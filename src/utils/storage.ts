const STORAGE_KEYS = {
  FEE_STANDARD: "moving_fee_standard",
  ORDERS: "moving_orders",
  DAMAGE_CLAIMS: "moving_damage_claims",
};

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
  }
  return defaultValue;
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
  }
}

export const storage = {
  feeStandard: {
    get: <T>(defaultValue: T) =>
      getFromStorage<T>(STORAGE_KEYS.FEE_STANDARD, defaultValue),
    set: <T>(value: T) => setToStorage<T>(STORAGE_KEYS.FEE_STANDARD, value),
  },
  orders: {
    get: <T>(defaultValue: T) =>
      getFromStorage<T>(STORAGE_KEYS.ORDERS, defaultValue),
    set: <T>(value: T) => setToStorage<T>(STORAGE_KEYS.ORDERS, value),
  },
  damageClaims: {
    get: <T>(defaultValue: T) =>
      getFromStorage<T>(STORAGE_KEYS.DAMAGE_CLAIMS, defaultValue),
    set: <T>(value: T) => setToStorage<T>(STORAGE_KEYS.DAMAGE_CLAIMS, value),
  },
};
