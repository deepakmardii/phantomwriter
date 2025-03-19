import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function generateTopicWithAI(category) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const categoryPrompts = {
      'professional-advice':
        'Generate professional advice topics related to career growth, leadership, or workplace excellence.',
      'explanation-analysis':
        'Generate topics that require in-depth explanation or analysis of business, tech, or industry concepts.',
      'personal-story':
        'Generate topics for sharing personal experiences or journeys in professional growth.',
      'industry-trends':
        'Generate topics about current trends, innovations, or changes in business or technology.',
      'how-to-guide':
        'Generate topics for practical guides or tutorials in professional development or technical skills.',
      'case-study':
        'Generate topics for analyzing business situations, project outcomes, or industry examples.',
    };

    const prompt = `Generate 5 distinct LinkedIn post topics based on this category: ${categoryPrompts[category] || 'Generate professional topics for LinkedIn'}.

The topics should be:
1. Specific and focused
2. Relevant to professional audiences
3. Timely and engaging
4. Something that sparks discussion
5. Each under 10 words

Format: Return each topic on a new line, numbered 1-5, no additional context.

Example:
1. The Hidden Cost of Perfectionism in Tech Leadership
2. Why Remote Teams Need Async Communication Culture
3. Breaking Down Complex Projects: A Leader's Guide
4. Building Trust in Cross-Functional Teams Today
5. Data-Driven Decision Making: Beyond the Numbers`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Process the response into individual topics
    const topics = text
      .split('\n')
      .map(t => t.trim())
      .filter(t => t && t.match(/^\d+\./)) // Keep only numbered lines
      .map(t => t.replace(/^\d+\.\s*/, '')) // Remove numbering
      .filter(t => t.length > 0); // Remove any empty lines

    if (topics.length === 0) {
      // If no properly formatted topics found, try to split by newlines
      const fallbackTopics = text
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .slice(0, 5);

      return fallbackTopics.length > 0 ? fallbackTopics : [text.trim()];
    }

    return topics;
  } catch (error) {
    console.error('AI Topic Generation error:', error);
    throw new Error('Failed to generate topics');
  }
}

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
