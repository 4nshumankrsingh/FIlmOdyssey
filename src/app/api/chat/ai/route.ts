import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build the prompt with conversation context
    const prompt = `
      You are FilmOdyssey AI, a friendly and knowledgeable film assistant. 
      You help users discover movies, analyze their taste, discuss film theory, 
      and provide personalized recommendations.
      
      Previous conversation context:
      ${conversationHistory?.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') || 'No previous context'}
      
      Current user message: ${message}
      
      Please provide a helpful, engaging response about films. Be conversational but informative.
      If recommending films, suggest specific titles with brief reasoning.
      If analyzing taste, ask follow-up questions to understand preferences better.
      Keep responses under 300 words unless detailed analysis is requested.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({
      response: response.text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        response: "I'm having trouble connecting right now. Please try again in a moment."
      },
      { status: 500 }
    );
  }
}