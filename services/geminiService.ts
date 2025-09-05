
import { GoogleGenAI, Modality } from "@google/genai";
import { getMimeTypeFromBase64 } from '../utils/imageUtils';

// 获取API密钥，支持多种环境变量名
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Available env vars:", Object.keys(process.env).filter(key => key.includes('API') || key.includes('GEMINI')));
  throw new Error("API密钥未设置。请检查环境变量配置。");
}

console.log("API Key found:", apiKey ? "Yes" : "No");
const ai = new GoogleGenAI({ apiKey });

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

        const capturedImagePart = {
            inlineData: {
                data: capturedImageBase64.split(',')[1],
                mimeType: capturedImageMimeType,
            },
        };

        const referenceImagePart = {
            inlineData: {
                data: referenceImageBase64.split(',')[1],
                mimeType: referenceImageMimeType,
            },
        };
        
        const textPart = {
            text: `${prompt}. The first image is the main subject. The second image should be placed on a card held by the person in the first image.`,
        };
        
        console.log("发送请求到Gemini API...");

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [capturedImagePart, referenceImagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        console.log("收到API响应");
        
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("API没有返回任何候选结果");
        }
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                console.log("成功生成图像");
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error("API没有返回图像数据");

    } catch (error) {
        console.error("生成图像时出错:", error);
        
        // 提供更详细的错误信息
        if (error instanceof Error) {
            if (error.message.includes('API_KEY')) {
                throw new Error("API密钥无效或未设置");
            } else if (error.message.includes('quota')) {
                throw new Error("API配额已用完");
            } else if (error.message.includes('permission')) {
                throw new Error("API权限不足");
            } else {
                throw new Error(`生成失败: ${error.message}`);
            }
        }
        
        throw new Error("生成图像失败，请检查控制台获取详细信息");
    }
}
