

import { NextResponse } from "next/server";

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
export async function POST() {
  try {
    // Fallback to predefined suggestions due to AI service issues
    const predefinedSuggestions = [
      "What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?",
      "What's the best advice you've ever received?||If you could learn any skill instantly, what would it be?||What's your favorite way to spend a weekend?",
      "What's a book that changed your perspective?||If you could live in any time period, when would it be?||What's something you're grateful for today?",
      "What's your dream travel destination?||If you could have any superpower, what would it be?||What's the most interesting fact you know?",
    ];
    
    const randomIndex = Math.floor(Math.random() * predefinedSuggestions.length);
    const selectedSuggestions = predefinedSuggestions[randomIndex];
    
    return new Response(selectedSuggestions, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === "APIError") {
      const apiError = error as { name: string; status: number; headers: Record<string, string>; message: string };
      const { name, status, headers, message } = apiError;
      return NextResponse.json({ name, status, headers, message }, { status });
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
