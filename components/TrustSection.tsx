export default function TrustSection() {
  return (
    <section className="py-16 px-4 bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Trusted, Safe, Responsive
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-2">Part 135 Operators</h3>
            <p className="text-gray-300">
              We partner exclusively with FAA-certified Part 135 charter operators with proven safety records.
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Rapid Response</h3>
            <p className="text-gray-300">
              Typical response time as little as 60 minutes, depending on aircraft availability and location.
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">📞</div>
            <h3 className="text-xl font-semibold mb-2">24/7 Operations</h3>
            <p className="text-gray-300">
              Our operations team is available around the clock to coordinate your urgent charter needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
