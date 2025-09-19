import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const UsernameOuerySchema = z.object({
  username: usernameValidation,
});

/**
 * @swagger
 * /api/check-username-unique:
 *   get:
 *     tags: [Utility]
 *     summary: Check username availability
 *     description: Checks if a username is available and not already taken by a verified user
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 20
 *           pattern: '^[a-zA-Z0-9_]+$'
 *         description: Username to check for availability
 *         example: "john_doe"
 *     responses:
 *       200:
 *         description: Username is available
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
 *                       example: "Username is unique"
 *       400:
 *         description: Username is taken or invalid
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
 *                         - example: "Username is already taken"
 *                         - example: "Invalid query parameters"
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
 *                       example: "Error checking username"
 */
export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    console.log(searchParams);
    const queryParam = { username: searchParams.get("username") };
    //validate with zod
    const result = UsernameOuerySchema.safeParse(queryParam);
    console.log(result);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(",")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }
    const { username } = result.data;
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}
