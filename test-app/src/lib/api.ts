const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  service_type_id: string;
  special_instructions?: string;
  number_of_shoes?: number;
  number_of_blankets?: number;
  regular_laundry_items?: Record<string, number>;
  ironing_items?: Record<string, number>;
  dry_cleaning_items?: Record<string, number>;
}

// Helper functions
import { Headers, RequestOptions } from './types';

const getAuthHeader = (): Headers => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
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
      body: new URLSearchParams(credentials),
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
  async getTimeSlots(): Promise<TimeSlot[]> {
    const response = await fetch(`${API_URL}/time-slots`, {
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
};

export default api;
