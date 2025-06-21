'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">Laundry Service</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Professional Laundry Service</span>
            <span className="block text-blue-600">For Your Convenience</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Experience the best laundry service in town. We offer pickup and delivery, professional cleaning, and quick turnaround times.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="p-6 border rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Schedule Pickup</h3>
              <p className="mt-2 text-gray-500">
                Easy scheduling for pickup at your convenience. Choose your preferred time slot.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 border rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Multiple Services</h3>
              <p className="mt-2 text-gray-500">
                From regular laundry to dry cleaning, we handle all your clothing care needs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 border rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Quick Delivery</h3>
              <p className="mt-2 text-gray-500">
                Fast turnaround times with real-time tracking of your laundry status.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Our Services</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Service 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Regular Laundry</h3>
              <p className="mt-2 text-sm text-gray-500">
                Wash, dry, and fold service for your everyday clothes
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Dry Cleaning</h3>
              <p className="mt-2 text-sm text-gray-500">
                Professional dry cleaning for delicate garments
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Shoe Cleaning</h3>
              <p className="mt-2 text-sm text-gray-500">
                Expert cleaning for all types of footwear
              </p>
            </div>

            {/* Service 4 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Blanket Cleaning</h3>
              <p className="mt-2 text-sm text-gray-500">
                Deep cleaning for blankets and comforters
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
