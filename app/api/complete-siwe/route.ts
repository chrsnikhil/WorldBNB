import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export async function POST(req: NextRequest) {
  try {
    const { payload, nonce } = (await req.json()) as IRequestPayload;
    
    // Following official docs: Check nonce matches the one we created earlier
    const storedNonce = cookies().get("siwe")?.value;
    
    if (nonce != storedNonce) {
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid nonce",
      });
    }

    // Following official docs: verify the signature with verifySiweMessage
    const validMessage = await verifySiweMessage(payload, nonce);
    
    return NextResponse.json({
      status: "success",
      isValid: validMessage.isValid,
    });
  } catch (error: any) {
    // Handle errors in validation or processing
    console.error("SIWE verification error:", error);
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: error.message || "Verification failed",
    });
  }
}
