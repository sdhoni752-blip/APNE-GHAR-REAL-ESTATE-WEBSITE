/**
 * Indian Rupee (₹) and Indian Numbering System formatter
 * Handles Lakhs (1,00,000) and Crores (1,00,00,000) properly.
 */
export const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(val);
};

export const formatCurrencyINR = (val: number): string => {
  return `₹${formatINR(val)}`;
};
