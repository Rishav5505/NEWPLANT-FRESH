import React from "react";

const Contact = () => {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for contacting us! We'll get back to you soon.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <section className="min-h-screen px-0 py-20 bg-gradient-to-b from-green-950/10 to-transparent">
      <div className="max-w-full mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-green-400">📞 Get in Touch</span>
          </h1>
          <p className="text-gray-300 text-xl">
            Have questions about our plants? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 text-green-400">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-semibold">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-semibold">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none focus:border-green-400 transition resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition transform hover:scale-105 text-lg"
              >
                📤 Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4 text-green-400">📍 Our Address</h3>
              <p className="text-gray-300 text-lg">
                123 Green Street<br />
                Nature Valley, NV 12345<br />
                United States
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4 text-green-400">📞 Phone</h3>
              <p className="text-gray-300 text-lg">
                <a href="tel:+15551234567" className="hover:text-green-400 transition">
                  +1 (555) 123-4567
                </a>
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4 text-green-400">✉️ Email</h3>
              <p className="text-gray-300 text-lg">
                <a href="mailto:info@plantsstore.com" className="hover:text-green-400 transition">
                  info@plantsstore.com
                </a>
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4 text-green-400">🕐 Hours</h3>
              <p className="text-gray-300">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 4:00 PM<br />
                Sunday: Closed
              </p>
            </div>

            {/* Social Media */}
            <div className="bg-gradient-to-br from-green-900/20 to-black/40 border border-green-700 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4 text-green-400">Follow Us</h3>
              <div className="flex gap-4 text-2xl">
                <a href="#" className="hover:scale-125 transition">📘</a>
                <a href="#" className="hover:scale-125 transition">📷</a>
                <a href="#" className="hover:scale-125 transition">🐦</a>
                <a href="#" className="hover:scale-125 transition">💼</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
