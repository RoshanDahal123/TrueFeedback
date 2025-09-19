import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

/**
 * @swagger
 * /api/accept-messages:
 *   post:
 *     tags: [Messages]
 *     summary: Update message acceptance status
 *     description: Enables or disables message acceptance for the authenticated user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - acceptMessages
 *             properties:
 *               acceptMessages:
 *                 type: boolean
 *                 description: Whether to accept messages
 *                 example: true
 *     responses:
 *       200:
 *         description: Message acceptance status updated successfully
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
 *                       example: "Message acceptance status updated success"
 *                     updatedUser:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated or update failed
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
 *                         - example: "Not Authenticated"
 *                         - example: "Message acceptance status updated failed"
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
 *                       example: "Failed to update user status to accept messages"
 *   get:
 *     tags: [Messages]
 *     summary: Get message acceptance status
 *     description: Retrieves the current message acceptance status for the authenticated user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Message acceptance status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 isAcceptingMessage:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Not authenticated
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
 *                       example: "Not Authenticated"
 *       404:
 *         description: User not found
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
 *                       example: "User with that id not found"
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
 *                       example: "Error is getting message acceptance"
 */
export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        status: false,
        message: "Not Authenticated",
      },
      {
        status: 401,
      }
    );
  }
  const userId = user._id;
  const { acceptMessages } = await request.json();
console.log(acceptMessages);
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessage: acceptMessages,
      },
      { new: true }
    );
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Message acceptance status updated failed",
        },
        {
          status: 401,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: `Message acceptance status updated success${acceptMessages}`,
        updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Failed to update user status to accept messages", error);
    return Response.json(
      {
        success: false,
        message: "Failed to update user status to accept messages",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        status: false,
        message: "Not Authenticated",
      },
      {
        status: 401,
      }
    );
  }
  const userId = user._id;
  const foundUser = await UserModel.findById(userId);
  console.log(foundUser);

  try {
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User with that id not found",
        },
        {
          status: 404,
        }
      );
    }
    //@ts-ignore
    console.log(foundUser.isAcceptingMessage);
    return Response.json(
      {
        success: true,
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Failed to get the user status to accept messages", error);
    return Response.json(
      {
        success: false,
        message: "Error is getting message acceptance",
      },
      {
        status: 500,
      }
    );
  }
}
