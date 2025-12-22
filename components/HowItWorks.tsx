export default function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-[#242424]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Submit Your Request</h3>
            <p className="text-gray-300">
              Fill out the quick form above with your route, timeline, and passenger count.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Options Fast</h3>
            <p className="text-gray-300">
              Our team searches available aircraft and operators, often providing options within the hour.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Confirm & Fly</h3>
            <p className="text-gray-300">
              Review your quote, confirm, and coordinate directly with the operator for your flight.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
