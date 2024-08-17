export const formatValue = (value) => {
    if (value === 0) return '0';
    const absValue = Math.abs(value);
    if (absValue < 1e-9) return `${(value * 1e12).toFixed(2)} ps`;
    if (absValue < 1e-6) return `${(value * 1e9).toFixed(2)} ns`;
    if (absValue < 1e-3) return `${(value * 1e6).toFixed(2)} µs`;
    if (absValue < 1) return `${(value * 1e3).toFixed(2)} ms`;
    return `${value.toFixed(2)} s`;
  };