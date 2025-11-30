import React from 'react';

const Terms = () => {
  return (
    <section className="min-h-screen px-4 py-20 bg-gradient-to-b from-green-950/10 to-transparent">
      <div className="max-w-4xl mx-auto bg-[#07110a] p-8 rounded-2xl border border-green-800">
        <h1 className="text-4xl font-bold mb-4 text-green-300">Terms of Service</h1>
        <p className="text-gray-300 mb-4">Welcome to Plants Store. By using our website and services you agree to the following terms and conditions. Please read them carefully.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">1. Orders and Payments</h3>
        <p className="text-gray-300">All orders are subject to availability. Prices and payment terms are described at checkout. We use mock payment flows for demo purposes; in a production environment you will be presented with a secure gateway.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">2. Shipping & Returns</h3>
        <p className="text-gray-300">We strive to package plants safely. If a plant arrives unhealthy, contact us within 48 hours with photos so we can assist with a replacement or refund according to our returns policy.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">3. User Accounts</h3>
        <p className="text-gray-300">You are responsible for maintaining the confidentiality of your account. Do not share your password. We are not liable for losses due to unauthorized access if you share credentials.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">4. Limitation of Liability</h3>
        <p className="text-gray-300">To the maximum extent permitted by law, Plants Store and its affiliates are not liable for indirect or consequential losses arising from use of the site.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2">5. Changes</h3>
        <p className="text-gray-300">We may update these terms occasionally. Continued use of the site constitutes acceptance of the updated terms.</p>

        <div className="mt-8 text-sm text-gray-400">Last updated: 29 November 2025</div>
      </div>
    </section>
  );
};

export default Terms;
