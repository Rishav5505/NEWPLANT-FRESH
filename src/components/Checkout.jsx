import React from "react";

const Checkout = () => {
  return (
    <section className="min-h-screen px-0 py-20 bg-gradient-to-b from-transparent to-green-950/10">
      <div className="max-w-3xl mx-auto bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-8 rounded-3xl">
        <h2 className="text-3xl font-bold mb-4">Checkout</h2>
        <p className="text-gray-300 mb-6">This is a checkout skeleton. Integrate payment & shipping logic here.</p>

        <form className="space-y-4">
          <input className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none" placeholder="Full name" />
          <input className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none" placeholder="Email" />
          <input className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none" placeholder="Address" />

          <div className="flex gap-4">
            <input className="flex-1 px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none" placeholder="City" />
            <input className="w-28 px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none" placeholder="ZIP" />
          </div>

          <button className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold">Place Order</button>
        </form>
      </div>
    </section>
  );
};

export default Checkout;
