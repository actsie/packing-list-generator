/**
 * Application configuration
 * Manages environment-specific settings
 */
export const config = {
  demo: {
    // Set to true to force demo mode
    client: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
    // Server-side demo mode check
    server: process.env.DEMO_MODE === 'true',
  },
  // Add other configuration settings as needed
};