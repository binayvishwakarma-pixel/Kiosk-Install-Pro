import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CapturedImage } from "../types";

// NOTE: In a production app, never expose the API key in the client side code directly like this if it wasn't behind an env var.
// For this demo, we assume process.env.API_KEY is available or the user will handle it.
// The instructions strictly say to use process.env.API_KEY.

export const auditInstallationImages = async (images: CapturedImage[]): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API Key not found");
    return "API Key missing. Cannot perform AI audit.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare parts: Text prompt + Images
    const parts: any[] = [
      {
        text: "You are a Quality Assurance expert for Kiosk Installations. Analyze these 'After Installation' images. Check for: 1. Cleanliness (no debris). 2. Proper alignment of equipment. 3. Screen visibility. 4. General workmanship quality. Provide a concise summary report (max 100 words) grading the installation as PASS or FAIL with reasons."
      }
    ];

    // Add first 3 images to keep payload reasonable for demo purposes
    // In production, we might need to resize images before sending if they are huge.
    // The dataUrl format is "data:image/jpeg;base64,..."
    // We need to strip the prefix for the API.
    
    const imagesToSend = images.slice(0, 3); 

    for (const img of imagesToSend) {
        const base64Data = img.dataUrl.split(',')[1];
        if (base64Data) {
            parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                }
            });
        }
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Efficient model for multi-modal
      contents: {
        parts: parts
      },
    });

    return response.text || "No response generated.";

  } catch (error) {
    console.error("Gemini Audit Error:", error);
    return "AI Audit failed. Please check network or API quota.";
  }
};