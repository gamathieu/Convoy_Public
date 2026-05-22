// Field validation helpers shared by Login / Register / forms.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value) {
  return typeof value === 'string' && EMAIL_RE.test(value.trim());
}

export function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isYear(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1000 && n <= 9999;
}
