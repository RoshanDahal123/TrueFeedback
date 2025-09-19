import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

/**
 * @swagger
 * /api/verify-code:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify user account with verification code
 *     description: Verifies a user account using the verification code sent via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - code
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username to verify
 *                 example: "john_doe"
 *               code:
 *                 type: string
 *                 description: 6-digit verification code
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Account verified successfully
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
 *                       example: "Account verified successfully"
 *       400:
 *         description: Invalid or expired verification code
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
 *                         - example: "Verification Code has expired please signup again to get a new code"
 *                         - example: "Incorrect Verification Code"
 *       500:
 *         description: User not found or server error
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
 *                         - example: "User Not found"
 *                         - example: "Error verifying User"
 */
export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();
    //decoding the data that comes from url
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({
      username: decodedUsername,
    });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User Not found",
        },
        { status: 500 }
      );
    }
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "Account verified successully",
        },
        {
          status: 200,
        }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification Code has expired please signup again to get a new code",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "InCorrect Verification Code",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifyng user", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying User",
      },
      { status: 500 }
    );
  }
}
