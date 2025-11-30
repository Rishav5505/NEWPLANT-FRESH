import React from "react";

const About = () => {
  return (
    <section className="min-h-screen px-0 py-20 bg-gradient-to-b from-green-950/10 to-transparent">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 text-center"><span className="text-green-400">About</span> Us</h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-6">Welcome to Plants Store — a community of plant lovers and growers. We source healthy plants from trusted nurseries, inspect each specimen, and provide clear care instructions so your plants thrive in their new home. Our team is passionate about sustainability, education, and bringing a little more green into everyday life.</p>

        <h3 className="text-2xl font-bold mt-8 mb-4">Our Mission</h3>
        <p className="text-gray-300 mb-6">We make plant parenting simple and enjoyable for everyone — from first-time plant parents to experienced gardeners. We focus on sustainable sourcing, responsible packaging, and helpful customer support so you feel confident caring for your plants.</p>

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

        <div className="mt-10 bg-[#07110a] p-6 rounded-2xl border border-green-800">
          <h3 className="text-2xl font-bold mb-3 text-green-300">Meet the Team</h3>
          <p className="text-gray-300 mb-2">We are a small team of horticulturists, packers and plant lovers based in India. We handle sourcing, quality checks, and customer care personally.</p>
          <p className="text-gray-400 text-sm">Contact: <a href="mailto:rishavkumar33372@gmail.com" className="text-green-300">rishavkumar33372@gmail.com</a></p>
        </div>
      </div>
    </section>
  );
};

export default About;
