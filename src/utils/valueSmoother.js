export function createValueSmoother(alpha = 0.25) {
  let value = null;

  return {
    smooth(next) {
      if (value === null) {
        value = next;
      } else {
        value = alpha * next + (1 - alpha) * value;
      }
      return value;
    },
    reset() {
      value = null;
    },
  };
}

export function formatDegrees(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0°';
  }
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}°`;
}
