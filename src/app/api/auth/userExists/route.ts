import { connectMongoDB } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const { email, username } = await req.json();
    
    if (!email && !username) {
      return NextResponse.json(
        { error: "Email or username is required" },
        { status: 400 }
      );
    }

    let query = {};
    if (email && username) {
      query = { $or: [{ email }, { username }] };
    } else if (email) {
      query = { email };
    } else if (username) {
      query = { username };
    }

    const existingUser = await User.findOne(query).select("email username");
    
    return NextResponse.json({ 
      exists: !!existingUser,
      user: existingUser 
    });
  } catch (error) {
    console.error("User exists check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}