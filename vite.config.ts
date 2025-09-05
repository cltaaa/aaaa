import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // 确保OpenRouter API密钥被正确加载
    const apiKey = env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY;
    console.log('OpenRouter API Key loaded:', apiKey ? 'Yes' : 'No');
    
    return {
      define: {
        'process.env.OPENROUTER_API_KEY': JSON.stringify(apiKey),
        'process.env.VITE_OPENROUTER_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
