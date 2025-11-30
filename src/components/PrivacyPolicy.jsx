import React from 'react';

const PrivacyPolicy = () => {
  return (
    <section className="min-h-screen px-4 py-20 bg-gradient-to-b from-green-950/10 to-transparent">
      <div className="max-w-4xl mx-auto bg-[#07110a] p-8 rounded-2xl border border-green-800">
        <h1 className="text-4xl font-bold mb-4 text-green-300">Privacy Policy</h1>
        <p className="text-gray-300 mb-4">This Privacy Policy explains how we collect, use, and disclose your personal information when you use our website.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">Information We Collect</h3>
        <p className="text-gray-300">We collect information you provide directly (account details, contact messages, orders) and technical data (IP address, device information) to run and improve the service.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">How We Use Information</h3>
        <p className="text-gray-300">We use collected information to process orders, respond to inquiries, improve our site, and send transactional messages. We do not sell personal data to third parties.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">Security</h3>
        <p className="text-gray-300">We employ reasonable measures to protect your information. However, no system is completely secure; use strong passwords and report suspicious activity.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">Data Retention</h3>
        <p className="text-gray-300">We retain personal data as long as necessary for the purposes described in this policy or as required by law.</p>

        <div className="mt-8 text-sm text-gray-400">Last updated: 29 November 2025</div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
