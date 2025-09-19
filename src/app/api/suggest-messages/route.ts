// app/api/openai/route.ts

import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge"; // optional but recommended for streaming
export const maxDuration = 30;

/**
 * @swagger
 * /api/suggest-messages:
 *   post:
 *     tags: [Utility]
 *     summary: Generate suggested messages
 *     description: Uses AI to generate three open-ended and engaging questions for anonymous messaging
 *     responses:
 *       200:
 *         description: Successfully generated message suggestions
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Stream of AI-generated message suggestions
 *               example: "What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 name:
 *                   type: string
 *                   description: Error name (for OpenAI API errors)
 *                 status:
 *                   type: number
 *                   description: HTTP status code (for OpenAI API errors)
 *                 message:
 *                   type: string
 *                   description: Error message (for OpenAI API errors)
 */
export async function POST(req: Request) {
  try {
    const prompt = `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and suitable for a diverse audience. Avoid personal or sensitive topics. Focus instead on universal themes that encourage friendly interaction. For example, your output should be: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'`;

  const result = streamText({
    model: 'gpt-4o-mini',
    prompt: prompt,
  });
     return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
