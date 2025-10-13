// Google OAuth Configuration
// Replace with your actual Google OAuth Client ID from Google Cloud Console
export const GOOGLE_CLIENT_ID = "346308048135-te71u2mq8092mgg8l6dc484ooeisshg5.apps.googleusercontent.com";

// API Configuration
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL
) + "/api";

// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_your_publishable_key_here";

// Environment check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
