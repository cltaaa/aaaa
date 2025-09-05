import { getMimeTypeFromBase64 } from '../utils/imageUtils';

// 获取OpenRouter API密钥
const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("Available env vars:", Object.keys(process.env).filter(key => key.includes('API') || key.includes('OPENROUTER')));
  throw new Error("OpenRouter API密钥未设置。请检查环境变量配置。");
}

console.log("OpenRouter API Key found:", apiKey ? "Yes" : "No");

export async function generateImageWithReference(
    capturedImageBase64: string, // data:mime;base64,...
    referenceImageBase64: string, // data:mime;base64,...
    prompt: string
): Promise<string> {
    try {
        console.log("开始生成图像...");
        console.log("Prompt:", prompt);
        
        const capturedImageMimeType = getMimeTypeFromBase64(capturedImageBase64);
        const referenceImageMimeType = getMimeTypeFromBase64(referenceImageBase64);
        
        console.log("图像类型:", { capturedImageMimeType, referenceImageMimeType });

        // 构建OpenRouter API请求
        const requestBody = {
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `${prompt}. The first image is the main subject. The second image should be placed on a card held by the person in the first image.`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: capturedImageBase64
                            }
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: referenceImageBase64
                            }
                        }
                    ]
                }
            ],
            response_format: {
                type: "image"
            }
        };
        
        console.log("发送请求到OpenRouter API...");

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "Nano Banana Imager"
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter API错误:", response.status, errorText);
            throw new Error(`API请求失败: ${response.status} - ${errorText}`);
        }
        
        console.log("收到API响应");
        
        // 检查响应是否为图像
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
            // 直接返回图像数据
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } else {
            // 尝试解析JSON响应
            const data = await response.json();
            console.log("API响应数据:", data);
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const message = data.choices[0].message;
                
                // 检查是否有图像内容
                if (message.content && Array.isArray(message.content)) {
                    for (const content of message.content) {
                        if (content.type === 'image_url' && content.image_url && content.image_url.url) {
                            console.log("成功生成图像");
                            return content.image_url.url;
                        }
                    }
                }
                
                // 如果消息内容是字符串且包含图像数据
                if (typeof message.content === 'string' && message.content.startsWith('data:image/')) {
                    console.log("成功生成图像");
                    return message.content;
                }
            }
            
            throw new Error("API没有返回图像数据");
        }

    } catch (error) {
        console.error("生成图像时出错:", error);
        
        // 提供更详细的错误信息
        if (error instanceof Error) {
            if (error.message.includes('API_KEY') || error.message.includes('401')) {
                throw new Error("OpenRouter API密钥无效或未设置");
            } else if (error.message.includes('quota') || error.message.includes('429')) {
                throw new Error("API配额已用完或请求过于频繁");
            } else if (error.message.includes('permission') || error.message.includes('403')) {
                throw new Error("API权限不足");
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                throw new Error("网络连接错误，请检查网络连接");
            } else {
                throw new Error(`生成失败: ${error.message}`);
            }
        }
        
        throw new Error("生成图像失败，请检查控制台获取详细信息");
    }
}