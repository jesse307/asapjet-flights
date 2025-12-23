export default function HeroSection() {
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+1 (862) 777-8468';

  return (
    <section className="min-h-[60vh] flex flex-col justify-center items-center text-center px-4 py-16 md:py-24">
      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
        Need a Jet — <span className="text-[#ff6b35]">ASAP?</span>
      </h1>
      <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-6">
        Rapid-response private jet charter for time-critical travel.
        <br />
        Professional. Reliable. Ready when you are.
      </p>

      {/* Prominent Phone Number */}
      <div className="mb-8 p-6 bg-[#242424] border-2 border-[#ff6b35] rounded-xl">
        <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Call Now - 24/7 Available</p>
        <a
          href={`tel:${contactPhone}`}
          className="text-4xl md:text-5xl font-bold text-[#ff6b35] hover:text-[#ff8555] transition-colors block"
        >
          {contactPhone}
        </a>
        <p className="text-sm text-gray-400 mt-2">Tap to call on mobile</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href={`tel:${contactPhone}`}
          className="bg-[#ff6b35] hover:bg-[#ff8555] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          📞 Call Now
        </a>
        <a
          href="#quote"
          className="bg-transparent border-2 border-[#ff6b35] hover:bg-[#ff6b35] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          Request Online Quote
        </a>
      </div>
    </section>
  );
}
