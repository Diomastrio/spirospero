import { toast } from "react-hot-toast";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
const API_URL = "https://api.openai.com/v1/chat/completions";

export async function getChatGPTInspiration(prompt, content = "") {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a creative writing assistant helping an author with their novel chapter.",
          },
          {
            role: "user",
            content: `Current content:
"""
${content.slice(0, 4000)}
"""

${prompt}

Keep your response concise and focused on helping the author continue their story. Provide specific suggestions that match the tone and style of their current writing.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Error getting inspiration");
    }

    // Extract the assistant's message content
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error.message, error);
    toast.error(
      `Failed to get inspiration: ${error.message || "Unknown error"}`
    );
    return null;
  }
}
