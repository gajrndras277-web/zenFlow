
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Task, Note } from "../types";

export const getFinancialAdvice = async (transactions: Transaction[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `
    Analyze these financial transactions and provide 3 concise, actionable pieces of advice for the user.
    Transactions: ${JSON.stringify(transactions)}
    Focus on spending patterns and saving opportunities.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional financial advisor specializing in personal budgeting.",
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Unable to generate financial advice at this moment. Keep tracking your expenses!";
  }
};

export const suggestTasksFromNotes = async (notes: Note[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `
    Based on the following user notes, suggest a list of 3-5 potential tasks or actionable items the user might have forgotten to add to their todo list.
    Notes: ${JSON.stringify(notes)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
            },
            required: ['title', 'priority']
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};
