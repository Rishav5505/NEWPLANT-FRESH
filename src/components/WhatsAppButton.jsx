import { useLocation } from "react-router-dom";

const NUMBER = "919508287609"; // from the Contact page

// Floating "chat with a plant expert" button.
export default function WhatsAppButton() {
  const { pathname } = useLocation();
  // Product pages have a sticky buy bar on mobile; checkout should stay distraction-free.
  if (/^\/(checkout|payment|admin)/.test(pathname)) return null;
  const onProduct = pathname.startsWith("/product/");
  const text = encodeURIComponent(`Hi JeevaLeaf! I have a question${onProduct ? ` about this plant: ${window.location.href}` : "."}`);
  return (
    <a
      href={`https://wa.me/${NUMBER}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={`group fixed left-4 z-40 flex items-center gap-2 rounded-full bg-[#25d366] p-3 text-white shadow-xl transition hover:pr-5 md:left-6 ${onProduct ? "bottom-[9.5rem] md:bottom-24 lg:bottom-6" : "bottom-20 md:bottom-6"}`}
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 1 1 7.99 4.42m8.03-17.45A11.24 11.24 0 0 0 12.04.75C5.8.75.73 5.82.73 12.06c0 1.99.52 3.94 1.51 5.65L.64 23.5l5.92-1.55a11.3 11.3 0 0 0 5.47 1.4h.01c6.24 0 11.31-5.07 11.31-11.31 0-3.02-1.18-5.86-3.32-8" />
      </svg>
      <span className="hidden max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap transition-all duration-300 group-hover:max-w-40 md:inline">Ask a plant expert</span>
    </a>
  );
}
