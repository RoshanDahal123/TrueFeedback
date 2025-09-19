import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

import { Message } from "@/model/User";

/**
 * @swagger
 * /api/send-message:
 *   post:
 *     tags: [Messages]
 *     summary: Send a message to a user
 *     description: Sends an anonymous message to a user if they are accepting messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - content
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the recipient
 *                 example: "john_doe"
 *               content:
 *                 type: string
 *                 description: Message content
 *                 example: "What's your favorite hobby?"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       example: true
 *                     message:
 *                       example: "Message sent Successfully"
 *       404:
 *         description: User not found or not accepting messages
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       example: false
 *                     message:
 *                       oneOf:
 *                         - example: "Message not found"
 *                         - example: "User is not accepting message"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       example: false
 *                     message:
 *                       example: "Internal server error"
 */
export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    //is user accepting the message
    if (!user?.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting message",
        },
        { status: 404 }
      );
    }
    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message);
    await user.save();
    return Response.json(
      {
        success: true,
        message: "Message sent Successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error adding messages");
    return Response.json(
      {
        status: false,
        message: `Internal server error,${error}`,
      },
      {
        status: 500,
      }
    );
  }
}
