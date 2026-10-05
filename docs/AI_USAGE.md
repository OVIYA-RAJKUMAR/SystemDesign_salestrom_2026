# AI Assistance & Transparency Declaration

## Architectural Ownership & Review
AI tools (Antigravity AI Agent & LLMs) were utilized strictly as an **engineering accelerator** for boilerplate generation, API route scaffolding, Pytest test case writing, frontend UI styling, and Mermaid diagram formatting.

### Human Engineering Decisions:
1. **Core Concurrency Strategy:** Design team explicitly chose SQL Atomic Conditional Updates over optimistic locking to prevent retry thrashing under 10,000 req/s bursts.
2. **Transactional Outbox & Message Broker:** Design team specified outbox pattern to guarantee at-least-once payment event delivery during Order Service downtime.
3. **Idempotency Model:** Idempotency key unique constraints on reservation and payment tables designed by team to ensure zero duplicate charges.
4. **Validation & Testing:** All concurrency test assertions (`oversold_count == 0`, `successful_reservations <= 100`) were formulated and verified empirically by the engineering team.
