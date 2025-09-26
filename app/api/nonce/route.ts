import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Generate a secure nonce (at least 8 alphanumeric characters)
    // Following official docs: crypto.randomUUID().replace(/-/g, "")
    const nonce = crypto.randomUUID().replace(/-/g, "");

    // Store the nonce in a secure HTTP-only cookie
    // Following official docs: cookies().set("siwe", nonce, { secure: true })
    cookies().set("siwe", nonce, { 
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 300 // 5 minutes
    });

    return NextResponse.json({ nonce });
  } catch (error) {
    console.error("Error generating nonce:", error);
    return NextResponse.json(
      { error: "Failed to generate nonce" },
      { status: 500 }
    );
  }
}
