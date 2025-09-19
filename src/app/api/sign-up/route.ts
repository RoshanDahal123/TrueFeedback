import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema } from "@/schemas/signUpSchema";

/**
 * @swagger
 * /api/sign-up:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: Creates a new user account and sends a verification email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *                 description: Unique username for the account
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Valid email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Account password
 *                 example: "securePassword123"
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                       example: "User registered successfully. Please check your email for verification code."
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationError'
 *                 - allOf:
 *                   - $ref: '#/components/schemas/ApiResponse'
 *                   - type: object
 *                     properties:
 *                       success:
 *                         example: false
 *                       message:
 *                         example: "Username already exists"
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
 *                       example: "Error registering user"
 */
export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();

    const validation = signUpSchema.safeParse(body);

    if (!validation.success) {
      // Extract error messages
      const errors = validation.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));
      return Response.json(
        {
          success: false,
          errors,
        },
        {
          status: 400,
        }
      );
    }
    const { username, email, password } = validation.data;
    const existingUserVerifiedByUserName = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUserName) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        {
          status: 400,
        }
      );
    }
    const existingUserByEmail = await UserModel.findOne({
      email,
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User with this email already exists",
          },
          {
            status: 400,
          }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.username = username;
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        isVerified: false,
        verifyCode,
        isAcceptingMessage: true,
        messages: [],
        verifyCodeExpiry: expiryDate,
      });
      await newUser.save();
    }
    //send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    console.log(emailResponse);
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message:
          "User registered successfully. Please check your email for verification code.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("Error registering user:", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
