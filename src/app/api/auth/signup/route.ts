import { connectMongoDB } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    
    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    await connectMongoDB();
    
    // Check if user already exists with better error messages
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { message: "An account with this email already exists." },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { message: "This username is already taken." },
          { status: 400 }
        );
      }
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({ 
      username, 
      email: email.toLowerCase(), 
      password: hashedPassword 
    });

    console.log("User registered successfully:", user.email);

    return NextResponse.json(
      { 
        message: "User registered successfully.",
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      }, 
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error details:", error);
    
    // More specific error messages
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: `Validation error: ${messages.join(', ')}` },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      // This is a fallback for duplicate key errors
      return NextResponse.json(
        { message: "User with this email or username already exists." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "An error occurred while registering the user. Please try again." },
      { status: 500 }
    );
  }
}