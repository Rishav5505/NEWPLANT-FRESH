/**
 * Accessibility Utilities
 * ARIA labels and keyboard navigation helpers
 */

export const AccessibleButton = ({
  children,
  onClick,
  ariaLabel,
  ariaPressed,
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      disabled={disabled}
      className={`focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-gray-900 rounded ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const AccessibleLink = ({
  children,
  href,
  ariaLabel,
  className = "",
  ...props
}) => {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={`focus:outline-none focus:ring-2 focus:ring-green-600 underline ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

// Keyboard navigation handlers
export const handleKeyPress = (e, callback) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    callback();
  }
};

// Focus management
export const setFocusOnError = (fieldId) => {
  const field = document.getElementById(fieldId);
  if (field) {
    field.focus();
    field.setAttribute("aria-invalid", "true");
  }
};

export const clearErrorFocus = (fieldId) => {
  const field = document.getElementById(fieldId);
  if (field) {
    field.setAttribute("aria-invalid", "false");
  }
};

// Announcement for screen readers
export const announceToScreenReader = (message, priority = "polite") => {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.className = "sr-only";
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);
};
