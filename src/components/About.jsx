import React from "react";

const About = () => {
  return (
    <section className="min-h-screen px-0 py-20 bg-gradient-to-b from-green-950/10 to-transparent">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 text-center"><span className="text-green-400">About</span> Us</h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-6">We are a small team of plant lovers dedicated to bringing healthy, beautiful plants to your home. Every plant is inspected and shipped with care. We provide easy care instructions and customer support to help your plants thrive.</p>

        <h3 className="text-2xl font-bold mt-8 mb-4">Our Mission</h3>
        <p className="text-gray-300 mb-6">To make plant parenting simple and enjoyable for everyone — from beginners to experienced enthusiasts. We prioritize sustainability, healthy stock, and helpful guidance.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-6 rounded-2xl">
            <h4 className="font-bold text-lg mb-2">Quality Plants</h4>
            <p className="text-gray-300">Hand-selected, nursery-grown plants.</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-6 rounded-2xl">
            <h4 className="font-bold text-lg mb-2">Fast Delivery</h4>
            <p className="text-gray-300">Safe packaging and reliable shipping partners.</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-6 rounded-2xl">
            <h4 className="font-bold text-lg mb-2">Satisfaction</h4>
            <p className="text-gray-300">Money-back guarantee on unhealthy plants.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
