"use client";

import { useState } from "react";
import { MiniKit, VerificationLevel, ISuccessResult } from "@worldcoin/minikit-js";

export default function VerificationDebug() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testVerification = async () => {
    try {
      setIsVerifying(true);
      setError(null);
      setResult(null);

      console.log('🧪 Testing verification...');
      console.log('🔍 MiniKit installed:', MiniKit.isInstalled());
      console.log('🔍 App ID:', process.env.NEXT_PUBLIC_WLD_APP_ID);

      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: "verifyuser", // Use the same action as in the main app
        signal: "debug-test-" + Date.now(),
        verification_level: VerificationLevel.Orb,
      });

      console.log('🔍 MiniKit response:', finalPayload);

      if (finalPayload.status === 'error') {
        setError(`MiniKit error: ${JSON.stringify(finalPayload)}`);
        return;
      }

      // Test backend verification
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: 'verifyuser',
          signal: "debug-test-" + Date.now(),
        }),
      });

      const verifyResponseJson = await verifyResponse.json();
      console.log('🔍 Backend response:', verifyResponseJson);

      setResult(verifyResponseJson);
    } catch (error: any) {
      console.error('❌ Debug verification error:', error);
      setError(error.message || 'Unknown error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
      <h3 className="text-red-400 font-semibold mb-3">🔧 Verification Debug</h3>
      
      <button
        onClick={testVerification}
        disabled={isVerifying}
        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {isVerifying ? "Testing..." : "Test Verification"}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 rounded-lg">
          <h4 className="text-red-300 font-medium mb-2">❌ Error:</h4>
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mb-4 p-3 bg-green-500/20 rounded-lg">
          <h4 className="text-green-300 font-medium mb-2">✅ Result:</h4>
          <pre className="text-green-200 text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="text-xs text-red-300">
        <p><strong>Environment:</strong> {process.env.NEXT_PUBLIC_WLD_APP_ID ? 'App ID present' : 'App ID missing'}</p>
        <p><strong>MiniKit:</strong> {MiniKit.isInstalled() ? 'Installed' : 'Not installed'}</p>
      </div>
    </div>
  );
}
