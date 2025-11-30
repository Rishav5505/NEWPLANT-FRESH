import React, { useState } from 'react';

const WhyChooseUs = () => {
  const [expanded, setExpanded] = useState(null);

  const reasons = [
    {
      id: 'shipping',
      emoji: '🚚',
      title: 'Free Shipping',
      short: 'Free delivery on orders over ₹4,150 across the country',
      details: 'We offer free shipping on all orders exceeding ₹4,150. Our partnership with reliable logistics ensures your plants arrive safely and on time. For orders below ₹4,150, we charge a nominal shipping fee based on your location.'
    },
    {
      id: 'quality',
      emoji: '🎁',
      title: 'Quality Guarantee',
      short: '100% healthy plants or money back guarantee',
      details: 'Every plant is hand-inspected before packaging. If your plant arrives unhealthy or damaged, contact us within 48 hours with photos and we\'ll provide a replacement or full refund—no questions asked.'
    },
    {
      id: 'eco',
      emoji: '🌍',
      title: 'Eco-Friendly',
      short: 'Sustainable packaging and carbon-neutral shipping',
      details: 'We use biodegradable, recycled materials for all packaging. Our shipping partners offset carbon emissions, ensuring your order leaves a minimal environmental footprint. We\'re committed to sustainability at every step.'
    },
    {
      id: 'support',
      emoji: '📞',
      title: 'Expert Support',
      short: '24/7 customer support and plant care guidance',
      details: 'Our team of plant experts is available around the clock to answer questions, provide care tips, and troubleshoot issues. Contact us via email, phone, or our contact form—we\'re here to help your plants thrive.'
    }
  ];

  const toggle = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent to-green-950/10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          <span className="text-green-400">Why Choose</span> Us?
        </h2>
        <p className="text-gray-400 text-center mb-12 text-lg max-w-2xl mx-auto">
          We're committed to delivering healthy plants, exceptional service, and sustainable practices.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reasons.map((reason) => (
            <div
              key={reason.id}
              onClick={() => toggle(reason.id)}
              className="cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  expanded === reason.id
                    ? 'bg-green-900/30 border-green-500 shadow-lg shadow-green-500/20'
                    : 'bg-[#07110a] border-green-800 hover:border-green-600'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl flex-shrink-0">{reason.emoji}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-300">{reason.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{reason.short}</p>
                  </div>
                  <div className="text-2xl text-green-400 flex-shrink-0">
                    {expanded === reason.id ? '−' : '+'}
                  </div>
                </div>

                {expanded === reason.id && (
                  <div className="mt-4 pt-4 border-t border-green-700/30 animate-in fade-in duration-300">
                    <p className="text-gray-300 leading-relaxed text-sm">{reason.details}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stats or CTA */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#07110a] p-6 rounded-2xl border border-green-800 text-center">
            <div className="text-3xl font-bold text-green-400">5000+</div>
            <div className="text-gray-400 text-sm mt-2">Happy Customers</div>
          </div>
          <div className="bg-[#07110a] p-6 rounded-2xl border border-green-800 text-center">
            <div className="text-3xl font-bold text-green-400">50+</div>
            <div className="text-gray-400 text-sm mt-2">Plant Varieties</div>
          </div>
          <div className="bg-[#07110a] p-6 rounded-2xl border border-green-800 text-center">
            <div className="text-3xl font-bold text-green-400">98%</div>
            <div className="text-gray-400 text-sm mt-2">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
