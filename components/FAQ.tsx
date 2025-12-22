'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'How quickly can you arrange a charter?',
    answer: 'Response times vary based on aircraft and operator availability, route, and current demand. In many cases, we can provide options within 60 minutes and arrange departures as little as a few hours out—though this depends on operational and regulatory constraints.',
  },
  {
    question: 'What are your rates?',
    answer: 'Pricing depends on aircraft type, route distance, positioning costs, and availability. We provide transparent quotes with no hidden fees. Expect higher rates for same-day or urgent requests due to limited availability.',
  },
  {
    question: 'Do you operate the aircraft?',
    answer: 'No. We are a charter broker connecting clients with FAA Part 135 certified operators. All flights are operated by licensed third-party operators who meet our safety and service standards.',
  },
  {
    question: 'What happens after I submit a request?',
    answer: 'Our team reviews your request and searches for available aircraft. We typically respond within 1-2 hours (often faster for critical requests) with options, pricing, and next steps.',
  },
  {
    question: 'Can I bring pets or medical equipment?',
    answer: 'Yes, in most cases. Specify any special requirements in the notes field, and we\'ll confirm availability with the operator.',
  },
  {
    question: 'What if no aircraft is available?',
    answer: 'If we cannot find suitable availability for your timeline, we\'ll let you know immediately and suggest alternative solutions or adjusted departure times.',
  },
  {
    question: 'Is there a cancellation policy?',
    answer: 'Cancellation terms vary by operator and are outlined in your charter agreement. Many same-day charters have strict or no-refund policies due to positioning costs.',
  },
  {
    question: 'Are you available 24/7?',
    answer: 'Yes. Our operations team monitors requests around the clock to support urgent and time-sensitive charter needs.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 px-4 bg-[#1a1a1a]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-[#242424] transition-colors"
              >
                <span className="font-semibold">{faq.question}</span>
                <span className="text-[#ff6b35] text-xl ml-4">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-[#242424] text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
