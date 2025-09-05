import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // 确保API密钥被正确加载
    const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
    console.log('API Key loaded:', apiKey ? 'Yes' : 'No');
    
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
