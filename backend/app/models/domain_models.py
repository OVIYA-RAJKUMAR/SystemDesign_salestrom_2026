import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Index, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now)

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)

class Product(Base):
    __tablename__ = "products"

    product_id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, nullable=False, index=True)
    price = Column(Float, nullable=False)
    stock_initial = Column(Integer, nullable=False, default=100)
    category_id = Column(String, ForeignKey("categories.category_id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    inventory = relationship("Inventory", back_populates="product", uselist=False)

class Inventory(Base):
    __tablename__ = "inventories"

    inventory_id = Column(String, primary_key=True, default=generate_uuid)
    product_id = Column(String, ForeignKey("products.product_id"), unique=True, nullable=False, index=True)
    available_quantity = Column(Integer, nullable=False, default=100)
    reserved_quantity = Column(Integer, nullable=False, default=0)
    sold_quantity = Column(Integer, nullable=False, default=0)
    version = Column(Integer, nullable=False, default=1)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    product = relationship("Product", back_populates="inventory")

class InventoryReservation(Base):
    __tablename__ = "inventory_reservations"

    reservation_id = Column(String, primary_key=True, default=generate_uuid)
    customer_id = Column(String, nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.product_id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    status = Column(String, nullable=False, default="RESERVED", index=True) # PENDING, RESERVED, PAYMENT_PENDING, CONFIRMED, RELEASED, EXPIRED
    idempotency_key = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, nullable=True, index=True)
    reservation_id = Column(String, ForeignKey("inventory_reservations.reservation_id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    status = Column(String, nullable=False, default="INITIATED", index=True) # INITIATED, PROCESSING, SUCCESS, FAILED, TIMEOUT, RECONCILING
    provider = Column(String, default="STRIPE_SIMULATOR")
    transaction_reference = Column(String, unique=True, nullable=False, index=True)
    idempotency_key = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String, primary_key=True, default=generate_uuid)
    customer_id = Column(String, nullable=False, index=True)
    reservation_id = Column(String, ForeignKey("inventory_reservations.reservation_id"), nullable=False, index=True)
    payment_id = Column(String, ForeignKey("payments.payment_id"), nullable=True, index=True)
    status = Column(String, nullable=False, default="CREATED", index=True) # CREATED, PAYMENT_PENDING, CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)

class Cart(Base):
    __tablename__ = "carts"

    cart_id = Column(String, primary_key=True, default=generate_uuid)
    customer_id = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=utc_now)

class CartItem(Base):
    __tablename__ = "cart_items"

    cart_item_id = Column(String, primary_key=True, default=generate_uuid)
    cart_id = Column(String, ForeignKey("carts.cart_id"), nullable=False)
    product_id = Column(String, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

class Sale(Base):
    __tablename__ = "sales"

    sale_id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")
    start_time = Column(DateTime, default=utc_now)
    end_time = Column(DateTime, nullable=True)

class Coupon(Base):
    __tablename__ = "coupons"

    coupon_id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, nullable=False)
    discount_percent = Column(Float, nullable=False, default=10.0)

class Shipment(Base):
    __tablename__ = "shipments"

    shipment_id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=False)
    tracking_number = Column(String, unique=True, nullable=False)
    status = Column(String, default="LABEL_CREATED")
    created_at = Column(DateTime, default=utc_now)

class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(String, primary_key=True, default=generate_uuid)
    customer_id = Column(String, nullable=False)
    type = Column(String, nullable=False) # EMAIL, SMS, PUSH
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

class OutboxEvent(Base):
    __tablename__ = "outbox_events"

    event_id = Column(String, primary_key=True, default=generate_uuid)
    event_type = Column(String, nullable=False, index=True)
    aggregate_id = Column(String, nullable=False, index=True)
    payload = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="PENDING", index=True) # PENDING, PROCESSED, FAILED
    retry_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=utc_now)
    processed_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(String, primary_key=True, default=generate_uuid)
    event_name = Column(String, nullable=False, index=True)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    correlation_id = Column(String, nullable=True)
    request_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)
