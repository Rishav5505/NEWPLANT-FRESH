import React from "react";

const ResponsiveMenu = ({ isOpen, onClose, children }) => {
  return (
    <>
      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 border-r border-green-700/30 z-50 transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="navigation"
        aria-label="Mobile menu"
      >
        <div className="p-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            aria-label="Close menu"
          >
            ✕
          </button>
          <nav className="mt-8 space-y-4">{children}</nav>
        </div>
      </div>
    </>
  );
};

export default ResponsiveMenu;
