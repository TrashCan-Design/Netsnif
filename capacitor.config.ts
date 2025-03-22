import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'NetSniff',
  webDir: 'dist',
  server: {
    url: 'http://192.168.29.163:8100', // Your IP from the logs
    cleartext: true, // Allow HTTP
    androidScheme: 'http' // Use HTTP not HTTPS
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
