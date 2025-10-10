import { connectMongoDB } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken, TokenPayload } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    const { email, password, rememberMe = false } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          message: "Email and password are required." 
        },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid email or password." 
        },
        { status: 401 }
      );
    }

    // Verify password
    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid email or password." 
        },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in database if remember me is checked
    if (rememberMe) {
      await User.findByIdAndUpdate(user._id, { refreshToken });
    }

    // Prepare response data
    const userData = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userData,
      accessToken,
      refreshToken: rememberMe ? refreshToken : undefined
    });

    // Set cookies for tokens (optional - you can remove this if you prefer header-based auth)
    if (rememberMe) {
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      });
    }

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 // 1 hour
    });

    return response;

  } catch (error: any) {
    console.error("Login API error:", error);
    
    return NextResponse.json(
      { 
        success: false,
        message: "An error occurred during login. Please try again." 
      },
      { status: 500 }
    );
  }
}

// Optional: Add a GET method to check login status
export async function GET(req: Request) {
  try {
    // You can implement token verification here if needed
    return NextResponse.json({
      success: true,
      message: "Login endpoint is active"
    });
  } catch (error) {
    console.error("Login status check error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Error checking login status" 
      },
      { status: 500 }
    );
  }
}