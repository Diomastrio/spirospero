import { toast } from "react-hot-toast";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const API_URL = import.meta.env.VITE_GEMINI_API_URL;

export async function getWritingInspiration(prompt, content = "") {
  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a creative writing assistant helping an author with their novel chapter.
                
Current content:
"""
${content.slice(0, 2000)}
"""

${prompt}

Keep your response concise and focused on helping the author continue their story. Provide specific suggestions that match the tone and style of their current writing.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 500,
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Error getting inspiration");
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API error:", error);
    toast.error("Failed to get inspiration. Please try again.");
    return null;
  }
}
