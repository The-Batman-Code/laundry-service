'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, User, PickupRequestResponse, Invoice, LaundryType, TimeSlot, PickupRequest } from '@/lib/api';
import WeeklyCalendar from '@/components/WeeklyCalendar';

// Schedule Pickup Form Component
function SchedulePickupForm({ onSuccess }: { onSuccess: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [laundryTypes, setLaundryTypes] = useState<LaundryType[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [formData, setFormData] = useState({
    address: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      instructions: ''
    },
    time_slot_id: '',
    service_type_ids: [] as string[],
    service_items: {} as Record<string, Record<string, number>>, // serviceTypeId -> itemId -> quantity
    special_instructions: '',
    payment_method_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [pickupRequestId, setPickupRequestId] = useState('');

  // Mock item data for each service type
  const serviceItems = {
    regular: [
      { id: 'tshirt', name: 'T-Shirt', price: 25 },
      { id: 'shirt', name: 'Shirt', price: 35 },
      { id: 'jeans', name: 'Jeans', price: 45 },
      { id: 'lowers', name: 'Lowers/Pants', price: 40 },
      { id: 'underwear', name: 'Underwear', price: 15 },
      { id: 'socks', name: 'Socks', price: 10 },
    ],
    bag: [
      { id: 'small_bag', name: 'Small Bag (up to 5kg)', price: 150 },
      { id: 'medium_bag', name: 'Medium Bag (up to 8kg)', price: 200 },
      { id: 'large_bag', name: 'Large Bag (up to 10kg)', price: 249.9 },
    ],
    shoes: [
      { id: 'sneakers', name: 'Sneakers', price: 80 },
      { id: 'formal_shoes', name: 'Formal Shoes', price: 90 },
      { id: 'boots', name: 'Boots', price: 100 },
      { id: 'sandals', name: 'Sandals', price: 60 },
    ],
    blanket: [
      { id: 'single_blanket', name: 'Single Blanket', price: 120 },
      { id: 'double_blanket', name: 'Double Blanket', price: 180 },
      { id: 'comforter', name: 'Comforter', price: 199.9 },
      { id: 'duvet', name: 'Duvet', price: 220 },
    ],
    dry_cleaning: [
      { id: 'suit', name: 'Suit (2-piece)', price: 200 },
      { id: 'dress', name: 'Dress', price: 150 },
      { id: 'coat', name: 'Coat/Jacket', price: 180 },
      { id: 'saree', name: 'Saree', price: 120 },
      { id: 'curtains', name: 'Curtains', price: 100 },
    ],
    ironing: [
      { id: 'tshirt_iron', name: 'T-Shirt', price: 15 },
      { id: 'shirt_iron', name: 'Shirt', price: 20 },
      { id: 'jeans_iron', name: 'Jeans', price: 25 },
      { id: 'dress_iron', name: 'Dress', price: 30 },
      { id: 'saree_iron', name: 'Saree', price: 40 },
    ]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [types, methods] = await Promise.all([
          api.getLaundryTypes(),
          api.getPaymentMethods()
        ]);
        setLaundryTypes(types);
        setPaymentMethods(methods);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch time slots when a date is selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (selectedDate) {
        try {
          console.log('Fetching time slots for date:', selectedDate);
          const slots = await api.getTimeSlots(selectedDate);
          console.log('Received time slots:', slots);
          setTimeSlots(slots);
        } catch (error) {
          console.error('Error fetching time slots:', error);
        }
      } else {
        setTimeSlots([]);
      }
    };
    fetchTimeSlots();
  }, [selectedDate]);

  const selectedTimeSlot = timeSlots.find(slot => slot.id === formData.time_slot_id);
  const selectedServiceTypes = laundryTypes.filter(type => formData.service_type_ids.includes(type.id));
  const selectedPaymentMethod = paymentMethods.find(method => method.id === formData.payment_method_id);
  
  // Calculate total price based on selected items and quantities
  const calculateTotalPrice = () => {
    let total = 0;
    Object.entries(formData.service_items).forEach(([serviceTypeId, items]) => {
      const serviceItemsData = serviceItems[serviceTypeId as keyof typeof serviceItems] || [];
      Object.entries(items).forEach(([itemId, quantity]) => {
        const item = serviceItemsData.find(i => i.id === itemId);
        if (item && quantity > 0) {
          total += item.price * quantity;
        }
      });
    });
    return total;
  };
  
  const totalPrice = calculateTotalPrice();

  // Helper function to update item quantity - using direct state update
  const updateItemQuantity = (serviceTypeId: string, itemId: string, change: number) => {
    console.log(`Updating quantity for ${serviceTypeId}-${itemId} by ${change}`);
    
    // Get current quantity directly from formData
    const currentQuantity = formData.service_items[serviceTypeId]?.[itemId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    
    console.log(`Current: ${currentQuantity}, New: ${newQuantity}`);
    
    // Create new service items object
    const newServiceItems = { ...formData.service_items };
    if (!newServiceItems[serviceTypeId]) {
      newServiceItems[serviceTypeId] = {};
    }
    
    if (newQuantity === 0) {
      delete newServiceItems[serviceTypeId][itemId];
      if (Object.keys(newServiceItems[serviceTypeId]).length === 0) {
        delete newServiceItems[serviceTypeId];
      }
    } else {
      newServiceItems[serviceTypeId][itemId] = newQuantity;
    }
    
    // Update form data directly
    setFormData({
      ...formData,
      service_items: newServiceItems
    });
  };

  // Helper function to check if service has any items selected
  const hasItemsSelected = (serviceTypeId: string) => {
    const items = formData.service_items[serviceTypeId];
    return items && Object.values(items).some(quantity => quantity > 0);
  };

  // Auto-redirect after confirmation (only if not already redirecting to invoice)
  useEffect(() => {
    if (currentStep === 6 && !pickupRequestId) {
      const timer = setTimeout(() => onSuccess(), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onSuccess, pickupRequestId]);

  const handleContinue = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleDateSelect = (date: string) => {
    console.log('Selected date:', date);
    setSelectedDate(date);
    // Clear selected time slot when date changes
    setFormData({ ...formData, time_slot_id: '' });
  };

  const handleCreatePickupRequest = async () => {
    setLoading(true);
    try {
      const requestData = {
        address: formData.address,
        time_slot_id: formData.time_slot_id,
        service_type_ids: formData.service_type_ids,
        service_items: formData.service_items,
        special_instructions: formData.special_instructions
      };
      const response = await api.createPickupRequest(requestData as any);
      setPickupRequestId(response.id);
      setCurrentStep(5); // Go to payment step
    } catch (error) {
      console.error('Error creating pickup request:', error);
      alert('Failed to create pickup request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (totalPrice === 0 || !pickupRequestId) return;
    
    setLoading(true);
    try {
      const paymentResponse = await api.createPayment({
        pickup_request_id: pickupRequestId,
        payment_method_id: formData.payment_method_id,
        amount: totalPrice * 1.08 // Include tax in payment
      });
      
      // Get the invoice for this payment
      const invoice = await api.getInvoiceByPaymentId(paymentResponse.id);
      
      setCurrentStep(6); // Go to confirmation
      
      // After showing confirmation, redirect to invoice
      setTimeout(() => {
        window.location.href = `/invoice/${invoice.id}`;
      }, 3000);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
            currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
          }`}>
            {step}
          </div>
          <div className={`ml-3 text-sm font-medium ${
            currentStep >= step ? 'text-blue-600' : 'text-gray-400'
          }`}>
            {step === 1 && 'Address'}
            {step === 2 && 'Pickup Time'}
            {step === 3 && 'Service Type'}
          </div>
          {step < 3 && <div className="mx-4 w-16 h-0.5 bg-gray-300"></div>}
        </div>
      ))}
    </div>
  );

  const OrderSummary = () => (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      {formData.address.street && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">Pickup Address:</p>
          <p className="text-sm font-medium text-gray-900">
            {formData.address.street}, {formData.address.city}, {formData.address.state} {formData.address.zip_code}
          </p>
        </div>
      )}
      
      {selectedTimeSlot && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">Pickup Time:</p>
          <p className="text-sm font-medium text-gray-900">
            {selectedTimeSlot.display_date}, {selectedTimeSlot.time}
          </p>
        </div>
      )}
      
      {Object.keys(formData.service_items).length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">Selected Items:</p>
          <div className="space-y-2">
            {Object.entries(formData.service_items).map(([serviceTypeId, items]) => {
              const serviceType = laundryTypes.find(type => type.id === serviceTypeId);
              const serviceItemsData = serviceItems[serviceTypeId as keyof typeof serviceItems] || [];
              
              return (
                <div key={serviceTypeId} className="border-l-2 border-blue-200 pl-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">{serviceType?.name}</p>
                  {Object.entries(items).map(([itemId, quantity]) => {
                    const item = serviceItemsData.find(i => i.id === itemId);
                    if (!item || quantity === 0) return null;
                    
                    return (
                      <div key={itemId} className="flex justify-between items-center text-sm">
                        <span className="text-gray-900">
                          {item.name} × {quantity}
                        </span>
                        <span className="text-blue-600">₹{(item.price * quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold text-gray-900">Total:</p>
              <p className="text-lg font-bold text-blue-600">₹{totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Schedule Laundry Pickup</h1>
      
      {currentStep <= 3 && <StepIndicator />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Pickup Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main St"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apartment, Suite, etc. (Optional)</label>
                  <input
                    type="text"
                    value={formData.address.instructions || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, instructions: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Apt #123"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.address.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={formData.address.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="NY"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={formData.address.zip_code}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, zip_code: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10001"
                  />
                </div>
                
                <div className="flex justify-end pt-6">
                  <button
                    onClick={handleContinue}
                    disabled={!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.zip_code}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pickup Time */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Pickup Time</h2>
              
              {/* Weekly Calendar */}
              <div className="mb-6">
                <WeeklyCalendar 
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                />
              </div>

                            {/* Time Slots */}
              {selectedDate && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Available Time Slots</h3>
                  {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setFormData({ ...formData, time_slot_id: slot.id })}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                            formData.time_slot_id === slot.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                          }`}
                        >
                          <div className="text-lg font-semibold">{slot.time}</div>
                          <div className="text-xs text-gray-500 mt-1">Available</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No time slots available for this date.</p>
                    </div>
                  )}
                </div>
              )}

              {!selectedDate && (
                <div className="text-center py-8 text-gray-500">
                  <p>Please select a date to see available time slots.</p>
                </div>
              )}
              
              <div className="flex justify-between pt-6">
                <button
                  onClick={handleBack}
                  className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!formData.time_slot_id}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Service Type */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Laundry Services</h2>
              <p className="text-gray-600 mb-4">Select items and quantities for your pickup</p>
              <div className="space-y-6 mb-6">
                {laundryTypes.map((type) => {
                  const isSelected = formData.service_type_ids.includes(type.id);
                  const hasItems = hasItemsSelected(type.id);
                  const serviceItemsData = serviceItems[type.id as keyof typeof serviceItems] || [];
                  
                  const handleToggleService = () => {
                    if (isSelected) {
                      // Remove service and clear all items
                      setFormData(prev => {
                        const newServiceItems = { ...prev.service_items };
                        delete newServiceItems[type.id];
                        return {
                          ...prev,
                          service_type_ids: prev.service_type_ids.filter(id => id !== type.id),
                          service_items: newServiceItems
                        };
                      });
                    } else {
                      // Add service
                      setFormData(prev => ({ 
                        ...prev, 
                        service_type_ids: [...prev.service_type_ids, type.id]
                      }));
                    }
                  };

                  return (
                    <div
                      key={type.id}
                      className={`border rounded-lg transition-colors ${
                        isSelected || hasItems
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      {/* Service Type Header */}
                      <div
                        className="p-6 cursor-pointer"
                        onClick={handleToggleService}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleToggleService();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mr-3"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">{type.name}</h3>
                              <p className="text-sm text-gray-600">{type.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {hasItems && (
                              <p className="text-sm text-blue-600 font-medium">
                                {Object.values(formData.service_items[type.id] || {}).reduce((sum, qty) => sum + qty, 0)} items
                              </p>
                            )}
                            <p className="text-sm text-gray-500">Starting from ₹{Math.min(...serviceItemsData.map(item => item.price))}</p>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Items Section */}
                      {isSelected && (
                        <div className="border-t bg-white p-6">
                          <h4 className="font-medium text-gray-900 mb-4">Select Items:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {serviceItemsData.map((item) => {
                              const quantity = formData.service_items[type.id]?.[item.id] || 0;
                              
                              return (
                                <div 
                                  key={item.id} 
                                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-sm text-blue-600">₹{item.price} each</p>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateItemQuantity(type.id, item.id, -1);
                                      }}
                                      disabled={quantity === 0}
                                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center font-medium text-gray-900">
                                      {quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateItemQuantity(type.id, item.id, 1);
                                      }}
                                      className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
                <textarea
                  value={formData.special_instructions}
                  onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any special instructions for handling your laundry..."
                />
              </div>
              
              <div className="flex justify-between pt-6">
                <button
                  onClick={handleBack}
                  className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={handleCreatePickupRequest}
                  disabled={totalPrice === 0 || loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Payment Details</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.payment_method_id === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setFormData({ ...formData, payment_method_id: method.id })}
                    >
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          checked={formData.payment_method_id === method.id}
                          onChange={() => setFormData({ ...formData, payment_method_id: method.id })}
                          className="mr-3"
                        />
                        <h4 className="font-medium text-gray-900">{method.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup Address:</span>
                    <span className="text-gray-900 text-right">
                      {formData.address.street}, {formData.address.city}, {formData.address.state} {formData.address.zip_code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup Time:</span>
                    <span className="text-gray-900">{selectedTimeSlot?.display_date}, {selectedTimeSlot?.time}</span>
                  </div>
                  
                  {/* Itemized breakdown */}
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                    {Object.entries(formData.service_items).map(([serviceTypeId, items]) => {
                      const serviceType = laundryTypes.find(type => type.id === serviceTypeId);
                      const serviceItemsData = serviceItems[serviceTypeId as keyof typeof serviceItems] || [];
                      
                      return (
                        <div key={serviceTypeId} className="mb-3">
                          <p className="text-xs font-medium text-gray-600 mb-1">{serviceType?.name}:</p>
                          {Object.entries(items).map(([itemId, quantity]) => {
                            const item = serviceItemsData.find(i => i.id === itemId);
                            if (!item || quantity === 0) return null;
                            
                            return (
                              <div key={itemId} className="flex justify-between items-center text-sm ml-2">
                                <span className="text-gray-700">
                                  {item.name} × {quantity}
                                </span>
                                <span className="text-gray-900">₹{(item.price * quantity).toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (8%):</span>
                      <span className="text-gray-900">₹{(totalPrice * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-lg font-semibold text-blue-600">
                          ₹{(totalPrice * 1.08).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handlePayment}
                  disabled={!formData.payment_method_id || loading}
                  className="bg-blue-600 text-white px-12 py-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? 'Processing...' : 'Confirm Request & Generate Invoice'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 6 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Confirmed!</h2>
                             <p className="text-gray-600 mb-8">
                 Your pickup request has been confirmed. {selectedPaymentMethod?.name === 'Cash' ? 'You will pay on delivery.' : 'Payment has been processed.'}
               </p>
               <p className="text-gray-500 mb-8">Redirecting to your invoice...</p>
               <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
        </div>
        
        {/* Order Summary Sidebar */}
        {currentStep <= 3 && (
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pickupRequests, setPickupRequests] = useState<PickupRequestResponse[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user data and pickup requests
    const fetchData = async () => {
      try {
        const userData = await api.getCurrentUser();
        const requests = await api.getPickupRequests();
        const userInvoices = await api.getInvoices();
        setUser(userData);
        setPickupRequests(requests);
        setInvoices(userInvoices);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        // If token is invalid, redirect to login
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    fetchData();
  }, [router]);

  // Calculate stats from real data
  const activeOrders = pickupRequests.filter(req => req.status === 'pending' || req.status === 'confirmed' || req.status === 'paid').length;
  const completedOrders = pickupRequests.filter(req => req.status === 'completed').length;
  const totalSpent = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-blue-600">Laundry Service</h1>
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'dashboard'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'schedule'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Schedule Pickup
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'orders'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Orders
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'invoices'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Invoices
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Hello, {user?.full_name || 'test4'}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            {/* User Profile */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-semibold text-gray-600">
                  {user?.full_name?.charAt(0) || 't'}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.full_name || 'test4'}</h2>
              <p className="text-gray-600 text-sm">{user?.email || 'test4@test.com'}</p>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'schedule'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Schedule Pickup
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Order History
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Profile Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <span className="text-sm text-gray-600">Welcome, {user?.full_name || 'test4'}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>

                             {/* Stats Cards */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="bg-blue-50 p-6 rounded-lg">
                   <h3 className="text-lg font-semibold text-blue-600 mb-2">Active Orders</h3>
                   <p className="text-3xl font-bold text-blue-700">{activeOrders}</p>
                 </div>
                 <div className="bg-green-50 p-6 rounded-lg">
                   <h3 className="text-lg font-semibold text-green-600 mb-2">Completed Orders</h3>
                   <p className="text-3xl font-bold text-green-700">{completedOrders}</p>
                 </div>
                 <div className="bg-purple-50 p-6 rounded-lg">
                   <h3 className="text-lg font-semibold text-purple-600 mb-2">Total Spent</h3>
                   <p className="text-3xl font-bold text-purple-700">₹{totalSpent.toFixed(2)}</p>
                 </div>
               </div>

              {/* Recent Orders Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                  <button 
                    onClick={() => setActiveTab('schedule')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Schedule New Pickup
                  </button>
                </div>
                
                                 {pickupRequests.length === 0 ? (
                   <div className="text-center py-12">
                     <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                     <button 
                       onClick={() => setActiveTab('schedule')}
                       className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                     >
                       Schedule Your First Pickup
                     </button>
                   </div>
                 ) : (
                   <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                       <thead className="bg-gray-50">
                         <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Order ID
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Status
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Date
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Address
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Actions
                           </th>
                         </tr>
                       </thead>
                       <tbody className="bg-white divide-y divide-gray-200">
                         {pickupRequests.slice(0, 5).map((request) => (
                           <tr key={request.id}>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                               #{request.id.slice(-6)}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                               <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                 request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                 request.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                                 request.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-gray-100 text-gray-800'
                               }`}>
                                 {request.status}
                               </span>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {new Date(request.created_at).toLocaleDateString()}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {request.address.street}, {request.address.city}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                               <button 
                                 onClick={() => setActiveTab('invoices')}
                                 className="text-blue-600 hover:text-blue-900"
                               >
                                 View
                               </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
              </div>
            </div>
          )}

                     {activeTab === 'schedule' && (
             <div>
               <h1 className="text-2xl font-bold text-gray-900 mb-8">Schedule Pickup</h1>
               <div className="bg-white rounded-lg shadow-sm p-6">
                 <SchedulePickupForm onSuccess={() => {
                   setActiveTab('orders');
                   // Refresh data
                   const fetchData = async () => {
                     try {
                       const requests = await api.getPickupRequests();
                       const userInvoices = await api.getInvoices();
                       setPickupRequests(requests);
                       setInvoices(userInvoices);
                     } catch (error) {
                       console.error('Error refreshing data:', error);
                     }
                   };
                   fetchData();
                 }} />
               </div>
             </div>
           )}

                     {activeTab === 'orders' && (
             <div>
               <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
               <div className="bg-white rounded-lg shadow-sm p-6">
                 {pickupRequests.length === 0 ? (
                   <div className="text-center py-12">
                     <p className="text-gray-500 mb-4">No orders found.</p>
                     <button 
                       onClick={() => setActiveTab('schedule')}
                       className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                     >
                       Schedule Your First Pickup
                     </button>
                   </div>
                 ) : (
                   <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                       <thead className="bg-gray-50">
                         <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Order ID
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Status
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Date Created
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Address
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Time Slot
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Instructions
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Actions
                           </th>
                         </tr>
                       </thead>
                       <tbody className="bg-white divide-y divide-gray-200">
                         {pickupRequests.map((request) => (
                           <tr key={request.id}>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                               #{request.id.slice(-6)}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                               <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                 request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                 request.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                                 request.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-gray-100 text-gray-800'
                               }`}>
                                 {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                               </span>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {new Date(request.created_at).toLocaleDateString()}
                             </td>
                             <td className="px-6 py-4 text-sm text-gray-500">
                               <div>
                                 <div>{request.address.street}</div>
                                 <div>{request.address.city}, {request.address.state} {request.address.zip_code}</div>
                               </div>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {request.time_slot_id}
                             </td>
                             <td className="px-6 py-4 text-sm text-gray-500">
                               {request.special_instructions || 'None'}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                               <button 
                                 onClick={() => setActiveTab('invoices')}
                                 className="text-blue-600 hover:text-blue-900 mr-2"
                               >
                                 View
                               </button>
                               {request.status === 'pending' && (
                                 <button className="text-red-600 hover:text-red-900">Cancel</button>
                               )}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>
             </div>
           )}

                     {activeTab === 'invoices' && (
             <div>
               <h1 className="text-2xl font-bold text-gray-900 mb-8">Invoices</h1>
               <div className="bg-white rounded-lg shadow-sm p-6">
                 {invoices.length === 0 ? (
                   <div className="text-center py-12">
                     <p className="text-gray-500 mb-4">No invoices found.</p>
                     <p className="text-sm text-gray-400">Invoices will appear here after you complete orders.</p>
                   </div>
                 ) : (
                   <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                       <thead className="bg-gray-50">
                         <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Invoice ID
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Order ID
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Amount
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Status
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Date
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Estimated Delivery
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Actions
                           </th>
                         </tr>
                       </thead>
                       <tbody className="bg-white divide-y divide-gray-200">
                         {invoices.map((invoice) => (
                           <tr key={invoice.id}>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                               #{invoice.id.slice(-6)}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               #{invoice.pickup_request_id.slice(-6)}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                               ₹{invoice.amount.toFixed(2)}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                               <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                 invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                 invoice.status === 'issued' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-gray-100 text-gray-800'
                               }`}>
                                 {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                               </span>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {new Date(invoice.created_at).toLocaleDateString()}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {new Date(invoice.estimated_delivery).toLocaleDateString()}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                               <button 
                                 onClick={() => window.open(`/invoice/${invoice.id}`, '_blank')}
                                 className="text-blue-600 hover:text-blue-900 mr-2"
                               >
                                 Download
                               </button>
                               <button 
                                 onClick={() => window.location.href = `/invoice/${invoice.id}`}
                                 className="text-green-600 hover:text-green-900"
                               >
                                 View
                               </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>
             </div>
           )}

          {activeTab === 'profile' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-gray-600">Profile settings will go here...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 