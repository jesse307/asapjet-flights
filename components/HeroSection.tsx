export default function HeroSection() {
  return (
    <section className="min-h-[60vh] flex flex-col justify-center items-center text-center px-4 py-16 md:py-24">
      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
        Need a Jet — <span className="text-[#ff6b35]">ASAP?</span>
      </h1>
      <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-8">
        Rapid-response private jet charter for time-critical travel.
        <br />
        Professional. Reliable. Ready when you are.
      </p>
      <a
        href="#quote"
        className="bg-[#ff6b35] hover:bg-[#ff8555] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
      >
        Check Immediate Availability
      </a>
    </section>
  );
}
