
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeProposal = async (title: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this blockchain voting proposal and provide a summary of pros, cons, and potential impact.
      Title: ${title}
      Description: ${description}
      
      Return the analysis in a clean structured format with Markdown.`,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Could not perform AI analysis at this time.";
  }
};

export const suggestImprovement = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Improve the clarity and persuasive tone of this DAO proposal description for a blockchain voting system:
      Original: ${description}
      
      Provide a professional rewrite that follows standard governance best practices.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini suggestion error:", error);
    return description;
  }
};
