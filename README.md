# SALESTORM | SYSCRAFTERS 2026
## High-Scale E-Commerce Flash Sale System Design Architecture

[![Python Backend Tests](https://img.shields.io/badge/Pytest-6%20Passed%20(100%25)-emerald)](file:///c:/Users/OVIYA/OneDrive/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/Desktop/System_design/backend/tests/test_concurrency_and_system.py)
[![React Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20Tailwind-cyan)](file:///c:/Users/OVIYA/OneDrive/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/Desktop/System_design/frontend/package.json)
[![System Guarantee](https://img.shields.io/badge/Oversold%20Count-ZERO-emerald)](file:///c:/Users/OVIYA/OneDrive/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/Desktop/System_design/docs/tradeoffs.md)

---

## Executive Architectural Summary

**SALESTORM** is a design-first, high-concurrency e-commerce flash-sale platform built for the **SYSCRAFTERS 2026 System Design Hackathon**.

### Problem Scenario
- **Product X Initial Stock:** 100 units
- **Traffic Burst:** 10,000 customers click "BUY NOW" simultaneously at 09:00:00.000 AM.
- **Architectural Guarantees Enforced:**
  - ✅ **Maximum Successful Reservations <= 100**
  - ✅ **Oversold Count == 0 (Inventory never becomes negative)**
  - ✅ **Zero Duplicate Reservations** (Idempotency-Key collision detection)
  - ✅ **Zero Duplicate Payments** (Unique transaction reference constraints)
  - ✅ **30s Hold TTL Expiry** (Automatic background stock release)
  - ✅ **Payment Success + Order Service Outage Recovery** (Transactional Outbox & Queue Retry)
  - ✅ **Horizontal Scalability Architecture** (10,000 req/s scaling toward 500,000 req/s)

---

## Technical Architecture Overview

```
10,000 Concurrent Buyers
       │
       ▼
[ API Gateway & Token Bucket Rate Limiter ]
       │ (Admission Control)
       ▼
[ Inventory Service ] ──(Atomic SQL UPDATE)──► [ Relational Database Engine ]
       │
       ▼
[ Payment Service ] ──(Circuit Breaker)──► [ External Gateway / Outbox Table ]
       │
       ▼
[ Message Broker Event Stream ]
       │
       ▼
[ Order Service Consumer ] (Idempotent Recovery Worker)
```

---

## Core System Design Features

### 1. Concurrency-Safe Atomic Stock Reservation
Inventory allocation uses database-level conditional atomic updates rather than optimistic version retries:
```sql
UPDATE inventory
SET available_quantity = available_quantity - :requested_qty,
    reserved_quantity  = reserved_quantity + :requested_qty,
    version            = version + 1
WHERE product_id = :product_id
  AND available_quantity >= :requested_qty;
```
If affected row count equals 1, the reservation succeeds. If affected row count is 0, the product is out of stock. `available_quantity < 0` is physically impossible.

### 2. Idempotency & Financial Safety
Every mutation endpoint (`/reservations`, `/payments`) mandates an `Idempotency-Key` HTTP header. Re-submitting identical requests returns original transaction payloads with `is_duplicate: true`.

### 3. Transactional Outbox Pattern
Payment status changes and `PaymentSucceeded` events are written inside the same database transaction. If the Order Service is down, outbox events remain pending in queue and automatically reconcile when the service recovers.

### 4. Gateway Circuit Breaker
Protects external payment gateway calls across three states: `CLOSED` (Healthy), `OPEN` (Fail Fast), and `HALF_OPEN` (Test Request).

---

## Monorepo Project Structure

```
salestorm/
├── frontend/                     # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/           # Command Center Header, Navigation, Jury Modal
│   │   ├── pages/                # 10 Enterprise Control Center Pages
│   │   ├── services/             # REST API Client Service
│   │   └── types/                # TypeScript Interfaces
│   └── package.json
│
├── backend/                      # Python FastAPI + Async SQLAlchemy + Pydantic
│   ├── app/
│   │   ├── api/v1/               # REST API Routers
│   │   ├── core/                 # Config & Database Session Setup
│   │   ├── models/               # SQLAlchemy Domain Models
│   │   ├── repositories/         # Inventory, Payment & Outbox Repositories
│   │   ├── services/             # Reservation, Payment & Order Services
│   │   ├── domain/               # Circuit Breaker, Message Broker, Failure Simulator
│   │   └── main.py               # FastAPI App & Lifespan Workers
│   ├── tests/                    # Pytest Async Concurrency Suite
│   └── requirements.txt
│
├── docs/                         # Architectural Specs & ADRs (ADR-001 to ADR-009)
├── diagrams/                     # 10 C4 & Sequence Mermaid Diagrams (.mmd)
└── README.md
```

---

## Quick Start & Execution Guide

### 1. Run Backend Server (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- **API Docs (Swagger UI):** `http://localhost:8000/docs`

### 2. Run Automated Pytest Concurrency Tests
```bash
python -m pytest backend/tests -v
```

### 3. Run Frontend Control Center (React Vite)
```bash
cd frontend
npm install
npm run dev
```
- **Command Center UI:** `http://localhost:5173`

---

## Hackathon Jury Demonstration Flow

1. Click **JURY DEMO MODE** in the top header.
2. Advance through the **10-Step Guided Walkthrough**.
3. Navigate to **Concurrency Lab** and click **RUN 10,000 REQUEST ATTACK**.
4. Observe **OVERSOLD COUNT = 0** and **Successful Reservations <= 100**.
5. Navigate to **Failure Simulator** and activate **Order Service Down** to verify outbox event queue recovery.
6. Open **Architecture Page** and click any component node to inspect scaling strategies and failure behaviors.

---

## AI Assistance Disclosure
AI tools were used strictly as an **engineering accelerator** for boilerplate, API scaffolding, test generation, and Mermaid diagram formatting. Architecture decisions were formulated and validated by the engineering team (see `docs/AI_USAGE.md`).
