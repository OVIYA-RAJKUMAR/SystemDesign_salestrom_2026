import asyncio
import json
import logging
from typing import Dict, Any, Callable, List, Optional
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class Event:
    def __init__(self, event_type: str, aggregate_id: str, payload: Dict[str, Any], correlation_id: Optional[str] = None):
        self.event_id = payload.get("event_id") or str(asyncio.get_event_loop().time())
        self.event_type = event_type
        self.aggregate_id = aggregate_id
        self.payload = payload
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.correlation_id = correlation_id or self.event_id
        self.retry_count = 0

class MessageBroker:
    """Abstract Interface for Architecture Readiness (Kafka / RabbitMQ ready)"""
    async def publish(self, topic: str, event: Event) -> bool:
        raise NotImplementedError
        
    async def subscribe(self, topic: str, handler: Callable[[Event], Any]):
        raise NotImplementedError

class InMemoryMessageBroker(MessageBroker):
    def __init__(self):
        self.subscribers: Dict[str, List[Callable[[Event], Any]]] = {}
        self.dead_letter_queue: List[Dict[str, Any]] = []
        self.message_queue: asyncio.Queue = asyncio.Queue()
        self.processed_events: List[Event] = []
        self.is_running = True

    async def publish(self, topic: str, event: Event) -> bool:
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        
        # Add to async queue for processing
        await self.message_queue.put((topic, event))
        return True

    def subscribe(self, topic: str, handler: Callable[[Event], Any]):
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(handler)

    async def process_messages(self, failure_simulator=None):
        """Worker loop processing events from the queue with retry & dead-letter queue support"""
        while self.is_running:
            try:
                topic, event = await asyncio.wait_for(self.message_queue.get(), timeout=0.1)
                handlers = self.subscribers.get(topic, [])
                
                # Check failure simulator
                if failure_simulator and failure_simulator.is_failed("message_processing_failure"):
                    logger.warning(f"[Broker] Message processing failure simulated for event {event.event_type}")
                    event.retry_count += 1
                    if event.retry_count > 3:
                        self.dead_letter_queue.append({
                            "event": event.__dict__,
                            "reason": "Simulated processing failure max retries exceeded",
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        })
                    else:
                        await self.message_queue.put((topic, event))
                    self.message_queue.task_done()
                    continue

                for handler in handlers:
                    try:
                        if asyncio.iscoroutinefunction(handler):
                            await handler(event)
                        else:
                            handler(event)
                        self.processed_events.append(event)
                    except Exception as e:
                        logger.error(f"[Broker] Error handling event {event.event_type}: {e}")
                        event.retry_count += 1
                        if event.retry_count > 3:
                            self.dead_letter_queue.append({
                                "event": event.__dict__,
                                "reason": str(e),
                                "timestamp": datetime.now(timezone.utc).isoformat()
                            })
                        else:
                            # Re-enqueue for retry
                            await self.message_queue.put((topic, event))
                
                self.message_queue.task_done()
            except asyncio.TimeoutError:
                await asyncio.sleep(0.01)
            except Exception as e:
                logger.error(f"[Broker] Error in worker loop: {e}")

global_broker = InMemoryMessageBroker()
