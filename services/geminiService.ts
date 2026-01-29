import { FeatureType, AngleOption, RoomOption, GenerationResult } from "../types";

export const MODEL_NAME = 'gemini-2.5-flash-image';

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

const cleanBase64 = (dataUrl: string): string => {
  if (dataUrl.includes(',')) {
    return dataUrl.split(',')[1];
  }
  return dataUrl;
};

export const generateFurnitureImage = async (
  originalImageBase64: string,
  featureType: FeatureType,
  option: AngleOption | RoomOption | string
): Promise<GenerationResult> => {
  
  try {
    // 1. Compress image client-side to save bandwidth before sending to server
    const compressedImage = await compressImage(originalImageBase64);
    const cleanImage = cleanBase64(compressedImage);

    // 2. Call our own Serverless Backend
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: cleanImage,
        featureType,
        option,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Pass the specific error message from server to the UI
      throw new Error(errorData.message || 'Server processing failed');
    }

    const data = await response.json();
    return data;

  } catch (error: any) {
    console.error("Service Generation Failed:", error);
    throw error;
  }
};