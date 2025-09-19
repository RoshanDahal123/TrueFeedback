import UserModel, { User } from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";

/**
 * @swagger
 * /api/delete-message/{messageId}:
 *   delete:
 *     tags: [Messages]
 *     summary: Delete a specific message
 *     description: Deletes a message from the authenticated user's messages
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message to delete
 *         example: "64a1b5c6e4b0a1234567890a"
 *     responses:
 *       200:
 *         description: Message deleted successfully
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
 *                       example: "Message deleted successfully"
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
 *                       example: "Not authenticated"
 *       404:
 *         description: User or message not found
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
 *                         - example: "User not found"
 *                         - example: "Message not found or already deleted"
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
 *                       example: "Error deleting message"
 */
export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: { messageId: string };
  }
) {
  const messageId = params.messageId;
  const session = await getServerSession(authOptions);
  const _user: User = session?.user as User;
  if (!session || !_user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }
  try {
    const updateResult = await UserModel.updateOne(
      {
        _id: _user._id,
      },
      { $pull: { messages: { _id: messageId } } }
    );
    if (updateResult.matchedCount === 0) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }
    if (updateResult.modifiedCount === 0) {
      return Response.json(
        {
          message: "Message not found or already deleted",
          success: false,
        },
        { status: 404 }
      );
    }
    return Response.json(
      { message: "Message deleted successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message: `Error deleting message, ${error}`,
        success: "false",
      },
      { status: 500 }
    );
  }
}
