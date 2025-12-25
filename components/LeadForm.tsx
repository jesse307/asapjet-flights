'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function LeadForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      from_airport_or_city: formData.get('from_airport_or_city') as string,
      to_airport_or_city: formData.get('to_airport_or_city') as string,
      date_time: formData.get('date_time') as string,
      trip_type: formData.get('trip_type') as 'one-way' | 'round-trip',
      return_date_time: formData.get('return_date_time') as string || undefined,
      pax: parseInt(formData.get('pax') as string, 10),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      urgency: 'urgent' as const, // All ASAP quotes are urgent
      notes: formData.get('notes') as string || undefined,
    };

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      // Fire Google Ads conversion tracking
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-17827004507/YOUR_CONVERSION_LABEL', // Replace with actual conversion label from Google Ads
          'value': 25.0,
          'currency': 'USD',
          'transaction_id': '' // Optional: add lead ID if needed
        });
      }

      router.push('/thanks');
    } catch {
      setError('Something went wrong. Please try again or call us directly.');
      setIsSubmitting(false);
    }
  }

  return (
    <section id="quote" className="py-16 px-4 bg-[#242424]">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Get Your Quote
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="from_airport_or_city" className="block text-sm font-medium mb-2">
                From (Airport or City) *
              </label>
              <input
                type="text"
                id="from_airport_or_city"
                name="from_airport_or_city"
                required
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
                placeholder="e.g., LAX or Los Angeles"
              />
            </div>

            <div>
              <label htmlFor="to_airport_or_city" className="block text-sm font-medium mb-2">
                To (Airport or City) *
              </label>
              <input
                type="text"
                id="to_airport_or_city"
                name="to_airport_or_city"
                required
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
                placeholder="e.g., JFK or New York"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Trip Type *</label>
            <div className="flex space-x-6">
              <div className="flex items-center">
                <input
                  id="one-way"
                  type="radio"
                  value="one-way"
                  name="trip_type"
                  className="h-4 w-4 border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
                  checked={tripType === 'one-way'}
                  onChange={() => setTripType('one-way')}
                />
                <label htmlFor="one-way" className="ml-2 text-sm font-medium">
                  One Way
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="round-trip"
                  type="radio"
                  value="round-trip"
                  name="trip_type"
                  className="h-4 w-4 border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
                  checked={tripType === 'round-trip'}
                  onChange={() => setTripType('round-trip')}
                />
                <label htmlFor="round-trip" className="ml-2 text-sm font-medium">
                  Round Trip
                </label>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date_time" className="block text-sm font-medium mb-2">
                Departure Date & Time *
              </label>
              <input
                type="datetime-local"
                id="date_time"
                name="date_time"
                required
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
              />
            </div>
            {tripType === 'round-trip' && (
              <div>
                <label htmlFor="return_date_time" className="block text-sm font-medium mb-2">
                  Return Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="return_date_time"
                  name="return_date_time"
                  required
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
                />
              </div>
            )}
            <div>
              <label htmlFor="pax" className="block text-sm font-medium mb-2">
                Passengers *
              </label>
              <input
                type="number"
                id="pax"
                name="pax"
                required
                min="1"
                max="50"
                defaultValue="1"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white resize-none"
              placeholder="Special requirements, medical equipment, pets, etc."
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#ff6b35] hover:bg-[#ff8555] disabled:bg-gray-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>

          <p className="text-sm text-gray-400 text-center">
            By submitting, you agree to be contacted about your charter request.
          </p>
        </form>
      </div>
    </section>
  );
}
