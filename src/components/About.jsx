import React, { useEffect, useRef } from "react";
import "./About.css";
import RishavImg from "../assets/Rishav.jpg";
import VinayImg from "../assets/vinay.jpg";
import SaurabhImg from "../assets/saurabh.jpg";

const Feature = ({ title, children, delay = "0s" }) => (
  <div className="about-card group reveal" data-delay={delay} style={{ transitionDelay: delay }}>
    <div className="about-card-inner">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-sm text-slate-300">{children}</p>
    </div>
  </div>
);

const About = () => {
  const plantRef = useRef(null);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const d = e.target.getAttribute('data-delay') || e.target.style.transitionDelay || '0s';
          e.target.style.transitionDelay = d;
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleMove = (e) => {
    const el = plantRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateX(${ -y * 7 }deg) rotateY(${ x * 7 }deg) translateZ(0)`;
  };
  const handleLeave = () => {
    const el = plantRef.current; if (!el) return; el.style.transform = '';
  };
  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-left">
          <h1 className="about-title"><span>About</span> Us</h1>
          <p className="about-lead">Welcome to Plants Store — a creative plant studio where every leaf tells a story. We hand-pick nursery-grown plants, perform detailed health checks, and include friendly care notes so your new green friend settles in beautifully.</p>

            <div className="about-features">
              <Feature delay="0.04s" title="Quality Plants">Hand-selected specimens from trusted growers with quality checks.</Feature>
              <Feature delay="0.12s" title="Thoughtful Packaging">Eco-friendly packaging designed to protect plants during transit.</Feature>
              <Feature delay="0.20s" title="Plant Support">Guides, video tips and responsive customer help to keep plants thriving.</Feature>
            </div>

            <div className="cta-row">
              <a href="/shop" className="cta">Explore Plants</a>
              <div className="social-icons">
                <a href="#" aria-label="instagram" className="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" stroke="#BFF0D8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" stroke="#BFF0D8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17.5 6.5h.01" stroke="#BFF0D8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
                <a href="#" aria-label="facebook" className="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-3a4 4 0 00-4 4v3H8v4h3v8h4v-8h3l1-4h-4V6a1 1 0 011-1h3V2z" stroke="#BFF0D8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
              </div>
            </div>

          <div className="about-mission">
            <h3 className="mission-title">Our Mission</h3>
            <p className="text-sm text-slate-300">Make plant parenting joyful and accessible — for beginners and pros alike. We focus on sustainable sourcing, clear education, and community building.</p>
          </div>

          <div className="team">
            <h3 className="team-title">Meet the Team</h3>
            <div className="team-list">
              <div className="team-card reveal" data-delay="0.28s">
                <div className="team-image-wrap">
                  <img src={RishavImg} alt="Rishav Kumar" className="team-image" />
                </div>
                <div className="team-info">
                  <div className="team-name">Rishav Kumar</div>
                  <div className="team-role">Founder & Horticulturist</div>
                </div>
              </div>
              <div className="team-card reveal" data-delay="0.36s">
                <div className="team-image-wrap">
                  <img src={VinayImg} alt="Vinay Badnoriya" className="team-image" />
                </div>
                <div className="team-info">
                  <div className="team-name">Vinay Badnoriya</div>
                  <div className="team-role">Founder & Operations</div>
                </div>
              </div>
              <div className="team-card reveal" data-delay="0.44s">
                <div className="team-image-wrap">
                  <img src={SaurabhImg} alt="Saurabh Kumar" className="team-image" />
                </div>
                <div className="team-info">
                  <div className="team-name">Saurabh Kumar</div>
                  <div className="team-role">Co-Founder & Tech Lead</div>
                </div>
              </div>
            </div>
            <p className="contact">Contact: <a href="mailto:rishavkumar33372@gmail.com">rishavkumar33372@gmail.com</a></p>
          </div>
        </div>

        <div className="about-right">
          <div className="blob" />
          <div
            className="plant-illustration reveal"
            ref={plantRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            data-delay="0.06s"
            style={{ transitionDelay: '0.06s' }}
          >
            <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" className="plant-svg" aria-hidden>
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0%" stopColor="#2bd18f" />
                  <stop offset="100%" stopColor="#1fa67a" />
                </linearGradient>
              </defs>
              <g transform="translate(20,20)">
                <path className="leaf leaf-1" d="M60 120 C40 70, 120 40, 140 80 C160 120, 100 150, 60 120Z" fill="url(#g1)" opacity="0.95" />
                <path className="leaf leaf-2" d="M90 140 C110 100, 190 120, 170 160 C150 200, 100 180, 90 140Z" fill="#12805f" opacity="0.93" />
                <rect x="106" y="160" width="12" height="46" rx="6" fill="#073b2a" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
