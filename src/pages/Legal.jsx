const CONTENT = {
  terms: {
    title: "Terms of Service",
    intro: "Welcome to JeevaLeaf. By using our website and services you agree to the following terms. Please read them carefully.",
    sections: [
      ["Orders and payments", "All orders are subject to availability. Prices are shown in Indian Rupees and include applicable taxes as itemised at checkout. Online payments on this site currently run in demo mode; in production you will be redirected to a secure payment gateway."],
      ["Shipping and plant health", "We package plants with care. If a plant arrives damaged or unhealthy, contact us within 48 hours of delivery with photos and we will arrange a replacement or refund according to our returns policy."],
      ["Coupons", "Coupon codes are subject to their stated conditions such as minimum order value and expiry, can't be exchanged for cash and only one code applies per order."],
      ["User accounts", "You are responsible for keeping your account credentials confidential. We are not liable for losses caused by unauthorised access resulting from shared passwords."],
      ["Limitation of liability", "To the maximum extent permitted by law, JeevaLeaf and its affiliates are not liable for indirect or consequential losses arising from use of the site."],
      ["Changes", "We may update these terms occasionally. Continued use of the site constitutes acceptance of the updated terms."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "This policy explains how we collect, use and protect your personal information when you use JeevaLeaf.",
    sections: [
      ["Information we collect", "Information you provide directly — account details, delivery addresses, orders, contact messages and the plants you add to My Garden — plus technical data such as device information needed to run the service."],
      ["How we use it", "To process orders, send transactional emails and care reminders, respond to enquiries and improve the site. We do not sell personal data to third parties."],
      ["Newsletter", "If you subscribe, we'll email you occasional care notes and offers. Every email has an unsubscribe link."],
      ["Security", "We use reasonable measures to protect your information, including hashed passwords. No system is perfectly secure, so please use a strong, unique password."],
      ["Data retention", "We keep personal data only as long as necessary for the purposes above or as required by law. You can ask us to delete your account at any time."],
    ],
  },
};

export default function Legal({ kind }) {
  const c = CONTENT[kind];
  return (
    <section className="container-x py-14 md:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="text-5xl font-light md:text-6xl">{c.title}</h1>
        <p className="mt-6 text-lg text-muted">{c.intro}</p>
        <div className="mt-12 space-y-10">
          {c.sections.map(([h, p], i) => (
            <div key={h} className="grid gap-2 border-t border-line pt-8 sm:grid-cols-[60px_1fr]">
              <span className="font-display text-clay italic">0{i + 1}</span>
              <div><h2 className="text-2xl">{h}</h2><p className="mt-3 leading-relaxed text-muted">{p}</p></div>
            </div>
          ))}
        </div>
        <p className="mt-14 text-sm text-muted">Last updated: November 2026</p>
      </div>
    </section>
  );
}
