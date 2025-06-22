import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

import { Message } from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      Response.json(
        {
          success: false,
          message: "Message not found",
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
      { status: 404 }
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
