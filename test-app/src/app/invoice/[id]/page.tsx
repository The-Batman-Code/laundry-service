'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api, Invoice, PickupRequestResponse, LaundryType, User } from '@/lib/api';

// Add print-specific styles
const printStyles = `
  @media print {
    body { 
      margin: 0;
      padding: 0;
      font-size: 12px;
    }
    
    .print\\:hidden {
      display: none !important;
    }
    
    .invoice-table {
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
    }
    
    .invoice-table th,
    .invoice-table td {
      border: 1px solid #e5e7eb !important;
      padding: 8px !important;
      word-wrap: break-word !important;
      overflow: hidden !important;
    }
    
    .invoice-table th:nth-child(1),
    .invoice-table td:nth-child(1) {
      width: 25% !important;
    }
    
    .invoice-table th:nth-child(2),
    .invoice-table td:nth-child(2) {
      width: 25% !important;
    }
    
    .invoice-table th:nth-child(3),
    .invoice-table td:nth-child(3) {
      width: 15% !important;
      text-align: center !important;
    }
    
    .invoice-table th:nth-child(4),
    .invoice-table td:nth-child(4) {
      width: 17.5% !important;
      text-align: right !important;
    }
    
    .invoice-table th:nth-child(5),
    .invoice-table td:nth-child(5) {
      width: 17.5% !important;
      text-align: right !important;
    }
    
    .price-cell {
      font-weight: bold !important;
      color: #000 !important;
    }
    
    .overflow-x-auto {
      overflow: visible !important;
    }
    
    .min-w-full {
      width: 100% !important;
    }
    
    .totals-section {
      width: 100% !important;
      margin-top: 20px !important;
    }
    
    .totals-table {
      width: 100% !important;
      max-width: 300px !important;
      margin-left: auto !important;
      border-collapse: collapse !important;
    }
    
    .totals-table td {
      border: 1px solid #e5e7eb !important;
      padding: 8px !important;
      font-size: 14px !important;
    }
    
    .total-row {
      font-weight: bold !important;
      background-color: #f9fafb !important;
    }
  }
`;

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [pickupRequest, setPickupRequest] = useState<PickupRequestResponse | null>(null);
  const [serviceTypes, setServiceTypes] = useState<LaundryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchInvoiceData = async () => {
      try {
        const [invoiceData, userData] = await Promise.all([
          api.getInvoice(invoiceId),
          api.getCurrentUser()
        ]);
        
        setInvoice(invoiceData);
        setUser(userData);

        // Fetch pickup request details
        const pickupData = await api.getPickupRequest(invoiceData.pickup_request_id);
        setPickupRequest(pickupData);

        // Fetch service type details
        const laundryTypes = await api.getLaundryTypes();
        const services = laundryTypes.filter(type => pickupData.service_type_ids.includes(type.id));
        setServiceTypes(services);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoice data:', error);
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [invoiceId, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple download by opening print dialog
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice || !pickupRequest || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate subtotal from the correct invoice amount (which includes itemized calculation from backend)
  const subtotal = invoice.amount / 1.08; // Remove tax to get subtotal
  const tax = subtotal * 0.08;
  const total = invoice.amount; // Use the correct total from backend

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Inject print styles */}
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
              Laundry Service
            </Link>
            <nav className="flex space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Schedule Pickup</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">My Orders</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Invoices</Link>
              <span className="text-gray-600">Hello, {user.full_name}</span>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  router.push('/login');
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <p className="text-gray-600">#{invoice.id}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-blue-600 mb-2">Laundry Service</h2>
                <p className="text-gray-600">Manipal University Jaipur</p>
                <p className="text-gray-600">Bagru, Jaipur, 300310</p>
                <p className="text-gray-600">laundry@gmail.com</p>
                <p className="text-gray-600">+91 8974998267</p>
              </div>
            </div>

            {/* Bill To & Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
                <div className="text-gray-600">
                  <p className="font-medium text-gray-900">{user.full_name}</p>
                  <p>{pickupRequest.address.street}</p>
                  <p>{pickupRequest.address.city}, {pickupRequest.address.state} {pickupRequest.address.zip_code}</p>
                  <p>Email: {user.email}</p>
                  <p>Phone: {user.phone_number}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Date:</span>
                    <span className="text-gray-900">{new Date(invoice.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="text-gray-900">Cash on Delivery</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`${
                      invoice.status === 'paid' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {invoice.status === 'paid' ? 'Paid' : 'Pending (Pay on Delivery)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup Date:</span>
                    <span className="text-gray-900">{new Date(pickupRequest.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup Time:</span>
                    <span className="text-gray-900">{pickupRequest.time_slot_id.includes('afternoon') ? 'Afternoon (1:00 PM - 5:00 PM)' : 'Morning (9:00 AM - 12:00 PM)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Delivery:</span>
                    <span className="text-green-600">{new Date(invoice.estimated_delivery).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 invoice-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Type
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoice.itemized_breakdown && invoice.itemized_breakdown.length > 0 ? (
                      invoice.itemized_breakdown.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {item.item_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {item.service_type}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right price-cell">
                            ₹{item.unit_price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right price-cell">
                            ₹{item.total_price.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          Laundry Service
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          Professional laundry service
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                          1
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right price-cell">
                          ₹{subtotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right price-cell">
                          ₹{subtotal.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8 totals-section">
              <div className="w-64">
                <table className="totals-table">
                  <tbody>
                    <tr>
                      <td className="text-gray-600">Subtotal:</td>
                      <td className="text-gray-900 text-right price-cell">₹{subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="text-gray-600">Tax (8%):</td>
                      <td className="text-gray-900 text-right price-cell">₹{tax.toFixed(2)}</td>
                    </tr>
                    <tr className="total-row">
                      <td className="text-lg font-semibold text-gray-900">Total:</td>
                      <td className="text-lg font-semibold text-blue-600 text-right price-cell">₹{total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Notes:</h4>
                <p className="text-gray-600">
                  Thank you for choosing our laundry service. We appreciate your business!
                </p>
                {pickupRequest.special_instructions && (
                  <p className="text-gray-600 mt-2">
                    <strong>Special Instructions:</strong> {pickupRequest.special_instructions}
                  </p>
                )}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions:</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Payment is due upon pickup of laundry.</li>
                  <li>• Estimated delivery time may vary based on workload.</li>
                  <li>• Please check your items before leaving.</li>
                  <li>• We are not responsible for items left unclaimed for more than 30 days.</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-8 pt-8 border-t print:hidden">
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Print Invoice
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
              >
                Download PDF
              </button>
              <Link
                href="/dashboard"
                className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 