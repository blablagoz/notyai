import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.notyai.app',
    appName: 'NotyAI',
    webDir: 'dist',
    server: {
          androidScheme: 'https',
    },
};

export default config;
