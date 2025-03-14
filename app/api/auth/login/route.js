import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";
import { generateToken } from "@/middleware/auth";

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Find user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user._id);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        linkedinProfile: user.linkedinProfile,
        subscription: user.subscription,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
