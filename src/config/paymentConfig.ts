// Payment Configuration
// IMPORTANT: Replace these with your actual payment credentials

export const PAYMENT_CONFIG = {
  // Mastercard Payment Gateway Configuration
  MASTERCARD: {
    API_URL: process.env.REACT_APP_MASTERCARD_API_URL || 'https://api.mastercard.com/payment',
    API_KEY: process.env.REACT_APP_MASTERCARD_API_KEY || 'YOUR_MASTERCARD_API_KEY',
    MERCHANT_ID: process.env.REACT_APP_MASTERCARD_MERCHANT_ID || 'YOUR_MERCHANT_ID',
    SECRET_KEY: process.env.REACT_APP_MASTERCARD_SECRET_KEY || 'YOUR_SECRET_KEY',
    WEBHOOK_SECRET: process.env.REACT_APP_MASTERCARD_WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET',
    ENVIRONMENT: process.env.REACT_APP_MASTERCARD_ENV || 'sandbox', // 'sandbox' or 'production'
  },

  // MomoPay Configuration
  MOMOPAY: {
    API_URL: process.env.REACT_APP_MOMOPAY_API_URL || 'https://api.momopay.com/payment',
    API_KEY: process.env.REACT_APP_MOMOPAY_API_KEY || 'YOUR_MOMOPAY_API_KEY',
    MERCHANT_ID: process.env.REACT_APP_MOMOPAY_MERCHANT_ID || 'YOUR_MOMOPAY_MERCHANT_ID',
    SECRET_KEY: process.env.REACT_APP_MOMOPAY_SECRET_KEY || 'YOUR_MOMOPAY_SECRET_KEY',
    CALLBACK_URL: process.env.REACT_APP_MOMOPAY_CALLBACK_URL || 'https://movienight.giize.com/payment/callback',
    ENVIRONMENT: process.env.REACT_APP_MOMOPAY_ENV || 'test', // 'test' or 'production'
  },

  // General Payment Settings
  SETTINGS: {
    CURRENCY: 'USD',
    SUCCESS_URL: 'https://movienight.giize.com/payment/success',
    CANCEL_URL: 'https://movienight.giize.com/payment/cancel',
    WEBHOOK_URL: 'https://movienight.giize.com/api/payment/webhook',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
  }
};

// Payment validation rules
export const PAYMENT_VALIDATION = {
  CARD: {
    MIN_LENGTH: 13,
    MAX_LENGTH: 19,
    CVV_LENGTH: 3,
    EXPIRY_FORMAT: /^(0[1-9]|1[0-2])\/\d{2}$/,
  },
  MOMOPAY: {
    PHONE_LENGTH: 10,
    MOMO_LENGTH: 10,
    PHONE_REGEX: /^\+?\d{10,15}$/,
    MOMO_REGEX: /^\d{10}$/,
  },
  EMAIL: {
    FORMAT: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  }
};

// Currency formatting
export const CURRENCY_FORMAT = {
  USD: {
    symbol: '$',
    position: 'before',
    decimalPlaces: 2,
  },
  XAF: {
    symbol: 'FCFA',
    position: 'after',
    decimalPlaces: 0,
  }
};

// Error messages
export const PAYMENT_ERRORS = {
  CARD_DECLINED: 'Your card was declined. Please try another card or contact your bank.',
  INSUFFICIENT_FUNDS: 'Insufficient funds. Please use a different payment method.',
  INVALID_CARD: 'Invalid card details. Please check your card information.',
  EXPIRED_CARD: 'Your card has expired. Please use a different card.',
  PROCESSING_ERROR: 'Payment processing error. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  MOMOPAY_FAILED: 'MomoPay transaction failed. Please try again.',
  INVALID_PHONE: 'Invalid phone number. Please check and try again.',
  INVALID_MOMO: 'Invalid MomoPay number. Please check and try again.',
};

// Success messages
export const PAYMENT_SUCCESS = {
  CARD: 'Payment successful! Thank you for your donation.',
  MOMOPAY: 'MomoPay payment successful! Thank you for your donation.',
  GENERAL: 'Payment successful! Thank you for supporting Movie Night.',
};

// Helper functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const config = CURRENCY_FORMAT[currency as keyof typeof CURRENCY_FORMAT];
  if (!config) return `${currency} ${amount}`;
  
  const formattedAmount = amount.toFixed(config.decimalPlaces);
  
  if (config.position === 'before') {
    return `${config.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount} ${config.symbol}`;
  }
};

export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  const { MIN_LENGTH, MAX_LENGTH } = PAYMENT_VALIDATION.CARD;
  
  if (cleaned.length < MIN_LENGTH || cleaned.length > MAX_LENGTH) {
    return false;
  }
  
  // Luhn algorithm for card validation
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

export const validateExpiryDate = (expiry: string): boolean => {
  if (!PAYMENT_VALIDATION.CARD.EXPIRY_FORMAT.test(expiry)) {
    return false;
  }
  
  const [month, year] = expiry.split('/').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  return true;
};

export const getPaymentMethodIcon = (method: string): string => {
  const icons = {
    card: 'credit-card',
    momopay: 'smartphone',
    paypal: 'mail',
    crypto: 'shield',
  };
  
  return icons[method as keyof typeof icons] || 'credit-card';
};
