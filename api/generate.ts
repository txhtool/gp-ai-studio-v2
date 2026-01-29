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
      2. INFERENCE: If the new view hides details, logically infer the design based on the item's style.
      3. BACKGROUND: Place the object in a professional, neutral studio background (soft grey/white). COMPLETELY REMOVE the original background.
      4. FIDELITY: Keep the materials, colors, and design details identical to the product in the input image.
      5. QUANTITY: PRESERVE EXACT NUMBER OF ITEMS. Do not add or remove any furniture pieces.
      
      The result must look like a fresh photo taken from the requested angle.`;
    } else if (featureType === FeatureType.SCENE_PLACEMENT) {
      const optionStr = String(option);
      const isCustomDescription = optionStr.length > 25 || (optionStr.includes(' ') && !Object.values(RoomOption).includes(option as RoomOption));
      
      const sceneDescription = isCustomDescription 
        ? `a custom environment described as: "${optionStr}"` 
        : `a brand new, high-end, photorealistic ${optionStr}`;

      prompt = `You are a professional interior designer.
      Your task is to place the furniture item from the input image into a specific environment.

      Target Scene: ${optionStr}.

      CRITICAL INSTRUCTIONS:
      1. NEW ENVIRONMENT: Place the product in ${sceneDescription}.
      2. DIFFERENTIATION: The background and lighting MUST be completely different from the original image.
      3. INTEGRATION: Ensure realistic shadows, reflections, and lighting matching the scene.
      4. ISOLATION: Cleanly separate the furniture from its original background before placing it.
      
      The final image should look like a professional catalog photo in the requested setting.`;
    } else if (featureType === FeatureType.BACKGROUND_REMOVAL) {
      // Simplified, direct editing prompt for better success rate
      prompt = `Remove the background from this image. 
      Keep the main furniture item exactly as is. 
      Make the background fully transparent (alpha channel). 
      Ensure the edges are clean.`;
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