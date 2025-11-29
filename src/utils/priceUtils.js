// Utility to convert USD to INR and format INR strings
const DEFAULT_RATE = 83; // default USD -> INR rate (adjustable via VITE_USD_TO_INR)
export const USD_TO_INR_RATE = import.meta.env.VITE_USD_TO_INR ? Number(import.meta.env.VITE_USD_TO_INR) : DEFAULT_RATE;

export function toINR(usd) {
  const n = Number(usd) || 0;
  return +(n * USD_TO_INR_RATE);
}

export function formatINR(value) {
  const n = Number(value) || 0;
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function formatINRFromUSD(usd) {
  return formatINR(toINR(usd));
}

export default { toINR, formatINR, formatINRFromUSD };
