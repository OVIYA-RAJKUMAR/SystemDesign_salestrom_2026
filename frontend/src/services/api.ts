import { SimulationRequest, SimulationResult, SystemMetrics, FailureConfig, ReservationResponse, PaymentResponse, OrderItem } from '../types';

const API_BASE = '/api/v1';

export const api = {
  async getMetrics(): Promise<SystemMetrics> {
    const res = await fetch(`${API_BASE}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch system metrics');
    return res.json();
  },

  async getInventoryState() {
    const res = await fetch(`${API_BASE}/inventory/state`);
    if (!res.ok) throw new Error('Failed to fetch inventory state');
    return res.json();
  },

  async runSimulation(req: SimulationRequest): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/flash-sale/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Simulation execution failed');
    }
    return res.json();
  },

  async createReservation(customerId: string, productId: string, idempotencyKey: string): Promise<ReservationResponse> {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        customer_id: customerId,
        product_id: productId,
        quantity: 1,
        idempotency_key: idempotencyKey,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail?.message || data.message || 'Reservation failed');
    }
    return data;
  },

  async releaseReservation(reservationId: string) {
    const res = await fetch(`${API_BASE}/reservations/${reservationId}/release`, {
      method: 'POST',
    });
    return res.json();
  },

  async processPayment(reservationId: string, amount: number, idempotencyKey: string): Promise<PaymentResponse> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        reservation_id: reservationId,
        amount,
        idempotency_key: idempotencyKey,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail?.message || data.message || 'Payment processing failed');
    }
    return data;
  },

  async getOrders(): Promise<OrderItem[]> {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getFailureConfig(): Promise<FailureConfig> {
    const res = await fetch(`${API_BASE}/failure/config`);
    if (!res.ok) throw new Error('Failed to fetch failure config');
    return res.json();
  },

  async updateFailureConfig(config: FailureConfig): Promise<FailureConfig> {
    const res = await fetch(`${API_BASE}/failure/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  async toggleFailureScenario(scenario: 'payment' | 'order-service' | 'database', enable: boolean) {
    const res = await fetch(`${API_BASE}/failure/${scenario}?enable=${enable}`, {
      method: 'POST',
    });
    return res.json();
  },

  async getEvents() {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  }
};
