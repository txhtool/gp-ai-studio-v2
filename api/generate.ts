import { GoogleGenAI } from "@google/genai";

// Define enums locally for server-side usage
enum FeatureType {
  MULTI_ANGLE = 'MULTI_ANGLE',
  SCENE_PLACEMENT = 'SCENE_PLACEMENT',
  BACKGROUND_REMOVAL = 'BACKGROUND_REMOVAL',
}

enum AngleOption {
  FRONT = 'Front view (straight on)',
  BACK = 'Rear view (back side)',
  LEFT = 'Left side view',
  RIGHT = 'Right side view',
  SLANTED = 'Slightly tilted side view (15-30 degrees)',
  THREE_QUARTER = '3/4 isometric view',
  TOP_DOWN = 'Top-down overhead view',
  LOW_ANGLE = 'Low angle view (looking slightly up)',
  CUSTOM = 'CUSTOM',
}

enum RoomOption {
  LIVING_ROOM = 'Living room',
  DINING_ROOM = 'Dining room',
  BEDROOM = 'Bedroom',
  OFFICE = 'Modern Home Office',
  OUTDOOR = 'Outdoor Patio / Garden',
  CUSTOM = 'CUSTOM',
}

// Increase body size limit to 4.5MB (max for Vercel Serverless)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
};

const ESTIMATED_COST_USD = 0.002;
const EXCHANGE_RATE = 25400;

export default async function handler(req: any, res: any) {
  // Config CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const body = req.body || {};
    const { image, featureType, option } = body;

    if (!image || !featureType) {
      return res.status(400).json({ message: "Missing required fields (image or featureType)" });
    }

    if (!process.env.API_KEY) {
      return res.status(500).json({ message: "KEY_ERROR" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const MODEL_NAME = 'gemini-2.5-flash-image';

    let prompt = "";

    if (featureType === FeatureType.MULTI_ANGLE) {
      prompt = `You are a professional product photographer. 
      Your task is to photograph the furniture item provided in the input image from a specific new angle.

      Target Viewpoint: ${option}.

      CRITICAL INSTRUCTIONS:
      1. TRANSFORMATION: You must rotate the object to match the Target Viewpoint exactly.
      2. PRESERVATION: Maintain the exact materials, textures (wood grain, fabric patterns), and structural proportions of the original furniture.
      3. BACKGROUND: Place the object in a pure white studio background with soft, natural contact shadows.
      4. INTEGRITY: Do not distort the legs or shape of the furniture.
      
      Output only the requested view.`;
    } else if (featureType === FeatureType.SCENE_PLACEMENT) {
      const optionStr = String(option);
      const isCustomDescription = optionStr.length > 25 || (optionStr.includes(' ') && !Object.values(RoomOption).includes(option as RoomOption));
      
      const sceneDescription = isCustomDescription 
        ? `a custom environment described as: "${optionStr}"` 
        : `a modern, high-end ${optionStr}`;

      prompt = `You are a professional interior designer and 3D visualizer.
      Place the furniture item from the input image into the following scene: ${sceneDescription}.

      CRITICAL INSTRUCTIONS:
      1. COMPOSITION: The furniture must be the main focus. Ensure it is placed on the floor/ground with realistic contact shadows and reflections.
      2. LIGHTING: Match the lighting on the furniture to the ambient lighting of the room (direction, temperature, intensity).
      3. SCALE: Ensure the furniture is scaled correctly relative to the room and other objects.
      4. STYLE: The room style should complement the furniture's design.
      5. NO HALOS: Ensure clean blending between the furniture edges and the new background.`;
    } else if (featureType === FeatureType.BACKGROUND_REMOVAL) {
      prompt = `Strictly remove the background from this furniture image.
      Output the furniture item on a purely transparent background (alpha channel).
      Ensure complex edges (like chair legs or fluffy textures) are masked precisely.
      Do not change the color or lighting of the furniture itself.`;
    }

    // IMPORTANT: Send image part FIRST, then text prompt.
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: image,
            },
          },
          { text: prompt },
        ],
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      
      // 1. Look for Image Part
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          const resultData = `data:${mimeType};base64,${part.inlineData.data}`;
          
          const costUsd = ESTIMATED_COST_USD;
          const costVnd = Math.round(costUsd * EXCHANGE_RATE);

          return res.status(200).json({
            imageUrl: resultData,
            cost: {
              usd: `$${costUsd.toFixed(4)}`,
              vnd: `${costVnd.toLocaleString('vi-VN')} đ`
            }
          });
        }
      }

      // 2. If no image, look for Text Part (Error/Refusal)
      for (const part of parts) {
        if (part.text) {
          console.warn("AI returned text instead of image:", part.text);
          return res.status(422).json({ message: "AI không tạo được ảnh: " + part.text });
        }
      }
    }

    return res.status(500).json({ message: "AI did not return any content." });

  } catch (error: any) {
    console.error("Backend Error:", error);
    return res.status(500).json({ 
      message: error.message || "Internal Server Error" 
    });
  }
}