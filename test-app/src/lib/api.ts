// Ensure API_URL is always absolute
let API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundry-service-production-537a.up.railway.app';

// Add protocol if missing
if (API_URL && !API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
  API_URL = `https://${API_URL}`;
}

// Debug logging
if (typeof window !== 'undefined') {
  console.log('API_URL:', API_URL);
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
}

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  instructions?: string;
}

export interface LaundryType {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  display_date: string;
}

export interface PickupRequest {
  address: Address;
  pickup_date: string | Date;
  time_slot_id: string;
  service_type_ids: string[];
  special_instructions?: string;
  number_of_shoes?: number;
  number_of_blankets?: number;
  regular_laundry_items?: Record<string, number>;
  ironing_items?: Record<string, number>;
  dry_cleaning_items?: Record<string, number>;
}

export interface PickupRequestResponse {
  id: string;
  user_id: string;
  address: Address;
  time_slot_id: string;
  service_type_ids: string[];
  special_instructions?: string;
  status: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

export interface Payment {
  id: string;
  pickup_request_id: string;
  payment_method_id: string;
  amount: number;
  user_id: string;
  status: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  pickup_request_id: string;
  payment_id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  estimated_delivery: string;
  payment_method?: string;
  service_items?: Record<string, Record<string, number>>;
  itemized_breakdown?: Array<{
    service_type: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

// Helper functions
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // FastAPI returns errors in the 'detail' field
    throw new Error(error.detail || error.message || 'An error occurred');
  }
  return response.json();
};

export interface UserRegistration {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  is_admin?: boolean;
}

// API functions
export const api = {
  // Auth
  async register(userData: UserRegistration): Promise<User> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: credentials.email, // OAuth2PasswordRequestForm expects 'username' field
        password: credentials.password,
      }),
    });
    return handleResponse(response);
  },

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Laundry Types
  async getLaundryTypes(): Promise<LaundryType[]> {
    const response = await fetch(`${API_URL}/laundry-types`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Time Slots
  async getTimeSlots(date?: string): Promise<TimeSlot[]> {
    const url = date ? `${API_URL}/time-slots?date=${encodeURIComponent(date)}` : `${API_URL}/time-slots`;
    const response = await fetch(url, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Pickup Requests
  async createPickupRequest(request: PickupRequest) {
    const response = await fetch(`${API_URL}/pickup-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(request),
    });
    return handleResponse(response);
  },

  async getPickupRequests(): Promise<PickupRequestResponse[]> {
    const response = await fetch(`${API_URL}/pickup-requests`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async getPickupRequest(pickupId: string): Promise<PickupRequestResponse> {
    const response = await fetch(`${API_URL}/pickup-requests/${pickupId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await fetch(`${API_URL}/payment-methods`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Payments
  async createPayment(payment: { pickup_request_id: string; payment_method_id: string; amount: number }): Promise<Payment> {
    const response = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payment),
    });
    return handleResponse(response);
  },

  async getPayment(paymentId: string): Promise<Payment> {
    const response = await fetch(`${API_URL}/payments/${paymentId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${API_URL}/invoices`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async getInvoiceByPaymentId(paymentId: string): Promise<Invoice> {
    const response = await fetch(`${API_URL}/invoices/payment/${paymentId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const response = await fetch(`${API_URL}/invoices/${invoiceId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

export default api;
