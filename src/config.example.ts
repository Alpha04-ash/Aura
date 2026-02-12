// Aura Coach Configuration
// IMPORTANT: Never commit your real API keys to version control.
// Copy this file to config.ts and add your real keys there.
// In production (Vercel), values come from environment variables.

export const CONFIG = {
    // OpenAI Configuration
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',

    // RevenueCat Configuration
    REVENUECAT_APPLE_KEY: process.env.REVENUECAT_APPLE_KEY || 'YOUR_APPLE_KEY_HERE',
    REVENUECAT_GOOGLE_KEY: process.env.REVENUECAT_GOOGLE_KEY || 'YOUR_GOOGLE_KEY_HERE',
};
