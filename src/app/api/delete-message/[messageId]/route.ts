import UserModel, { User } from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
export async function Delete(
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
