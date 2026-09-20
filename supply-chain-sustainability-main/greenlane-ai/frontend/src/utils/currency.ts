/**
 * GreenLane AI — Currency Conversion & Formatting Utilities
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateFromEUR: number; // 1 EUR = X target currency
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euros (€ EUR)',
    rateFromEUR: 1.0,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupees (₹ INR)',
    rateFromEUR: 90.5,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollars ($ USD)',
    rateFromEUR: 1.08,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pounds (£ GBP)',
    rateFromEUR: 0.86,
  },
};

/**
 * Get currency symbol for a currency code (defaults to € if unknown)
 */
export const getCurrencySymbol = (currencyCode: string = 'EUR'): string => {
  return CURRENCIES[currencyCode.toUpperCase()]?.symbol || '€';
};

/**
 * Convert an amount in EUR to the target currency
 */
export const convertFromEUR = (amountInEUR: number, targetCurrency: string = 'EUR'): number => {
  const config = CURRENCIES[targetCurrency.toUpperCase()] || CURRENCIES.EUR;
  return amountInEUR * config.rateFromEUR;
};

/**
 * Convert an amount in target currency back to EUR
 */
export const convertToEUR = (amountInTarget: number, targetCurrency: string = 'EUR'): number => {
  const config = CURRENCIES[targetCurrency.toUpperCase()] || CURRENCIES.EUR;
  return amountInTarget / config.rateFromEUR;
};

/**
 * Format a EUR amount into the target currency formatted string
 */
export const formatCurrency = (
  amountInEUR: number,
  targetCurrency: string = 'EUR',
  options?: {
    decimals?: number;
    showSign?: boolean;
    compact?: boolean;
  }
): string => {
  if (isNaN(amountInEUR) || amountInEUR === null || amountInEUR === undefined) {
    return `${getCurrencySymbol(targetCurrency)}0`;
  }

  const converted = convertFromEUR(amountInEUR, targetCurrency);
  const symbol = getCurrencySymbol(targetCurrency);
  const decimals = options?.decimals !== undefined ? options.decimals : 0;
  const isPositive = converted > 0;
  const sign = options?.showSign && isPositive ? '+' : '';

  if (options?.compact && Math.abs(converted) >= 1000000) {
    return `${sign}${symbol}${(converted / 1000000).toFixed(1)}M`;
  }
  if (options?.compact && Math.abs(converted) >= 1000) {
    return `${sign}${symbol}${(converted / 1000).toFixed(1)}k`;
  }

  const formattedNumber = converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${sign}${symbol}${formattedNumber}`;
};

/**
 * Format a carbon price (e.g. €50/t or ₹4,500/t)
 */
export const formatCarbonPrice = (priceInEUR: number, targetCurrency: string = 'EUR'): string => {
  const symbol = getCurrencySymbol(targetCurrency);
  const converted = Math.round(convertFromEUR(priceInEUR, targetCurrency));
  return `${symbol}${converted.toLocaleString()}/t CO₂e`;
};
