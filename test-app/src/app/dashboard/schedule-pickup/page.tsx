'use client';

import { useState } from 'react';
import { api, Address, LaundryType, TimeSlot } from '@/lib/api';

interface FormData {
  step: number;
  address: Address;
  pickupDate: string;
  timeSlotId: string;
  serviceTypeId: string;
  items: {
    regular: Record<string, number>;
    ironing: Record<string, number>;
    drycleaning: Record<string, number>;
  };
  specialInstructions: string;
}

export default function SchedulePickup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    step: 1,
    address: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      instructions: ''
    },
    pickupDate: '',
    timeSlotId: '',
    serviceTypeId: '',
    items: {
      regular: {},
      ironing: {},
      drycleaning: {}
    },
    specialInstructions: ''
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-semibold mb-6">Schedule Pickup</h1>
            
            {/* Step 1: Address */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-medium mb-4">Step 1: Pickup Address</h2>
                {/* Address form will go here */}
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-medium mb-4">Step 2: Pickup Date & Time</h2>
                {/* Calendar and time slots will go here */}
              </div>
            )}

            {/* Step 3: Service Selection */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-medium mb-4">Step 3: Select Services</h2>
                {/* Service type and items selection will go here */}
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-medium mb-4">Step 4: Review Order</h2>
                {/* Order review will go here */}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              {/* Order summary content will go here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
