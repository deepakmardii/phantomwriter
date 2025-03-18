import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function generateLinkedInPost({ topic, tone, keywords = [], improvements }) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Topic: ${topic}
Tone: ${tone}
Keywords: ${keywords.join(',')}
${improvements ? `MANDATORY IMPROVEMENTS TO INCLUDE: ${improvements}` : ''}

${improvements ? `YOU MUST REWRITE THE POST TO FOCUS ON: ${improvements}\n` : ''}Generate pure post content - no separators, dashes, or formatting characters. ${
      improvements
        ? `REQUIREMENTS:\n1. The post MUST heavily feature "${improvements}"\n2. Start by mentioning "${improvements}"\n3. Include multiple references to "${improvements}"\n4. Make "${improvements}" the central theme`
        : ''
    } Start with an attention-grabbing statement that ${
      improvements ? `centers on "${improvements}"` : 'challenges beliefs'
    }. Use impactful words and strategic emojis that ${
      improvements ? `relate to "${improvements}" and` : 'match'
    } the topic. Structure in 2-3 punchy paragraphs, with ${
      improvements ? `"${improvements}" woven throughout` : 'engaging content'
    }. End with a thought-provoking statement about ${
      improvements ? `"${improvements}" and` : ''
    } the main keywords. Add 3-4 trending hashtags. Stay under 2800 characters. Remember: Format as clean post content without any meta text or separators.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      content: text,
    };
  } catch (error) {
    console.error('AI Generation error:', error);
    return {
      success: false,
      error: 'Failed to generate content',
    };
  }
}
