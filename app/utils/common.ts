export function isEqual(a: any, b: any) {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) return false;

  if (typeof a !== 'object') return false;

  // Compare dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Compare arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // One is array and one is not
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // Compare objects
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) return false;

  for (let key of aKeys) {
    if (!b.hasOwnProperty(key)) return false;
    if (!isEqual(a[key], b[key])) return false;
  }

  return true;
}

export function debounce(fn: (...args: any[]) => void, delay: number) {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => fn(...args), delay);
  };
}
  