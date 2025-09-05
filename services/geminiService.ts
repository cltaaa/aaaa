
import { GoogleGenAI, Modality } from "@google/genai";
import { getMimeTypeFromBase64 } from '../utils/imageUtils';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateImageWithReference(
    capturedImageBase64: string, // data:mime;base64,...
    referenceImageBase64: string, // data:mime;base64,...
    prompt: string
): Promise<string> {
    try {
        const capturedImageMimeType = getMimeTypeFromBase64(capturedImageBase64);
        const referenceImageMimeType = getMimeTypeFromBase64(referenceImageBase64);

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

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [capturedImagePart, referenceImagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error("API did not return an image.");

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please check the console for details.");
    }
}
