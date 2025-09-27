import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import { NextRequest, NextResponse } from "next/server";

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal: string | undefined;
}

export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = (await req.json()) as IRequestPayload;
    const app_id = process.env.APP_ID as `app_${string}`;
    
    console.log('🔍 Verification request:', {
      action,
      signal,
      app_id: app_id ? 'present' : 'missing',
      payloadKeys: Object.keys(payload)
    });

    if (!app_id) {
      console.error('❌ APP_ID is missing');
      return NextResponse.json({ 
        error: 'APP_ID environment variable is missing',
        status: 500 
      }, { status: 500 });
    }

    const verifyRes = (await verifyCloudProof(
      payload,
      app_id,
      action,
      signal
    )) as IVerifyResponse; // Wrapper on this
    
    console.log('🔍 Verification result:', verifyRes);

    if (verifyRes.success) {
      // This is where you should perform backend actions if the verification succeeds
      // Such as, setting a user as "verified" in a database
      return NextResponse.json({ verifyRes, status: 200 });
    } else {
      // This is where you should handle errors from the World ID /verify endpoint.
      // Usually these errors are due to a user having already verified.
      console.error('❌ Verification failed:', verifyRes);
      return NextResponse.json({ verifyRes, status: 400 });
    }
  } catch (error) {
    console.error('❌ Verification error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 500 
    }, { status: 500 });
  }
}
