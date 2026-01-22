import { FeatureType, AngleOption, RoomOption, GenerationResult } from "../types";

export const MODEL_NAME = 'gemini-2.5-flash-image';

// Cost constants
const ESTIMATED_COST_USD = 0.002;
const EXCHANGE_RATE = 25400;

// Helper function to compress image (Client side optimization)
const compressImage = (base64Str: string, maxWidth = 1024, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export const generateFurnitureImage = async (
  originalImageBase64: string,
  featureType: FeatureType,
  option: AngleOption | RoomOption
): Promise<GenerationResult> => {
  
  // 1. Compress image client-side to save bandwidth
  const compressedImage = await compressImage(originalImageBase64);

  try {
    // 2. Call Vercel Serverless Function
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalImageBase64: compressedImage,
        featureType,
        option
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.result) {
      throw new Error("Invalid response format from server");
    }

    // Calculate estimated cost
    const costUsd = ESTIMATED_COST_USD;
    const costVnd = Math.round(costUsd * EXCHANGE_RATE);

    return {
      imageUrl: data.result,
      cost: {
        usd: `$${costUsd.toFixed(4)}`,
        vnd: `${costVnd.toLocaleString('vi-VN')} đ`
      }
    };

  } catch (error: any) {
    console.error("API Call Failed:", error);
    throw error;
  }
};