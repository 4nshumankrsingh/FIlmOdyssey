import { connectMongoDB } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    if (token?.id) {
      await connectMongoDB();
      // Clear refresh token from database
      await User.findByIdAndUpdate(token.id, { refreshToken: null });
    }

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}