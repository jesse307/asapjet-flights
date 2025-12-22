export default function Footer() {
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+1 (555) 000-0000';

  return (
    <footer className="py-12 px-4 bg-[#0f0f0f] border-t border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-xl mb-4">ASAP Jet</h3>
            <p className="text-gray-400 text-sm">
              Rapid-response private jet charter for time-critical travel needs.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-gray-400 text-sm mb-2">
              <a href={`tel:${contactPhone}`} className="hover:text-[#ff6b35] transition-colors">
                {contactPhone}
              </a>
            </p>
            <p className="text-gray-400 text-sm">
              Available 24/7
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <p className="text-gray-400 text-sm">
              ASAPJet.Flights is a network of independent trusted charter brokers.
              <br />
              We do not operate aircraft or act as a broker ourselves.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-500 text-xs leading-relaxed">
            <strong>Disclaimer:</strong> All charter availability, pricing, and departure times are subject to aircraft and operator availability, regulatory requirements, weather, and operational constraints. Quoted response times and departure windows are typical estimates and not guaranteed. ASAPJet.Flights operates as a network of independent trusted charter brokers and does not act as a broker itself or operate aircraft. All flights are arranged through and provided by independent FAA Part 135 certified charter operators and brokers. By using this service, you acknowledge that charter arrangements depend on real-time availability and may be subject to change.
          </p>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          © {new Date().getFullYear()} ASAP Jet. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
