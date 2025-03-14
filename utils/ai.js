import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function generateLinkedInPost({ topic, tone, keywords = [] }) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
            Generate a professional LinkedIn post about ${topic}.
            Tone: ${tone}
            Keywords to include: ${keywords.join(", ")}
            
            Guidelines:
            - Keep it engaging and authentic
            - Include relevant hashtags
            - Optimal length for LinkedIn (1300-1700 characters)
            - Include emojis where appropriate
            - Break into readable paragraphs
            - End with a call to action or question to encourage engagement
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      content: text,
    };
  } catch (error) {
    console.error("AI Generation error:", error);
    return {
      success: false,
      error: "Failed to generate content",
    };
  }
}
