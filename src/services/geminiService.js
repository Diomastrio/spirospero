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

export async function chatWithAgent(
  message,
  history,
  contextData,
  role = "reader",
) {
  try {
    const systemPrompt =
      role === "author"
        ? `You are an AI author assistant helping write and edit a novel. Use the provided context to offer suggestions, brainstorming, or grammar checks.\n\nContext:\n${contextData}`
        : `You are an AI reading companion. Help the reader understand the chapter, summarize content, or recall characters based ONLY on the provided context.\n\nContext:\n${contextData}`;

    // Format history for Gemini structured prompt
    const contents = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Add current message with system prompt if no history yet, or just user message
    if (contents.length === 0) {
      contents.push({
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }],
      });
    } else {
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });
    }

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    const data = await response.json();
    if (data.error)
      throw new Error(data.error.message || "Error communicating with AI");

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API error:", error);
    toast.error("AI Assistant is unavailable. Please try again later.");
    return null;
  }
}
