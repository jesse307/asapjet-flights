import Link from 'next/link';

export default function ThanksPage() {
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+1 (555) 000-0000';

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center">
        <div className="text-6xl mb-6">✓</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Request Received
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Thank you for your charter request. Our operations team is reviewing your details and will respond shortly.
        </p>

        <div className="bg-[#242424] border border-gray-700 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">What Happens Next</h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start">
              <div className="text-[#ff6b35] font-bold mr-3 mt-1">1.</div>
              <p className="text-gray-300">
                Our team searches available aircraft based on your route and timeline.
              </p>
            </div>
            <div className="flex items-start">
              <div className="text-[#ff6b35] font-bold mr-3 mt-1">2.</div>
              <p className="text-gray-300">
                We typically respond within 1-2 hours (often faster for critical requests) with options and pricing.
              </p>
            </div>
            <div className="flex items-start">
              <div className="text-[#ff6b35] font-bold mr-3 mt-1">3.</div>
              <p className="text-gray-300">
                Once you approve, we coordinate directly with the operator to confirm your flight.
              </p>
            </div>
          </div>
        </div>

        <div className="text-gray-400 mb-8">
          <p className="mb-2">Need immediate assistance?</p>
          <a
            href={`tel:${contactPhone}`}
            className="text-[#ff6b35] hover:text-[#ff8555] font-semibold text-xl transition-colors"
          >
            {contactPhone}
          </a>
          <p className="text-sm mt-2">Available 24/7</p>
        </div>

        <Link
          href="/"
          className="inline-block text-gray-400 hover:text-white transition-colors"
        >
          ← Return to Home
        </Link>
      </div>
    </main>
  );
}
