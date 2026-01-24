"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@midwestea/utils";
import { Settings, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface WebhookTestResult {
  success: boolean;
  message: string;
  timestamp?: string;
  error?: string;
}

export default function SettingsPage() {
  const [webhookTestResult, setWebhookTestResult] = useState<WebhookTestResult | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const testWebhookEndpoint = async () => {
    setIsTestingWebhook(true);
    setWebhookTestResult(null);

    try {
      const supabase = await createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setWebhookTestResult({
          success: false,
          message: "Not authenticated",
          error: "Please log in to test webhook endpoint",
        });
        return;
      }

      const basePath = typeof window !== 'undefined' 
        ? (window.location.pathname.startsWith('/app') ? '/app' : '')
        : '';

      const response = await fetch(`${basePath}/api/webhooks/stripe/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setWebhookTestResult({
          success: true,
          message: data.message || 'Webhook endpoint is accessible',
          timestamp: data.timestamp,
        });
      } else {
        setWebhookTestResult({
          success: false,
          message: 'Webhook test failed',
          error: data.error || `HTTP ${response.status}`,
        });
      }
    } catch (error: any) {
      setWebhookTestResult({
        success: false,
        message: 'Error testing webhook',
        error: error.message || 'Unknown error',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook Testing</h2>
        <p className="text-sm text-gray-600 mb-4">
          Test if your Stripe webhook endpoint is accessible and properly configured.
        </p>

        <button
          onClick={testWebhookEndpoint}
          disabled={isTestingWebhook}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isTestingWebhook
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isTestingWebhook ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Webhook Endpoint'
          )}
        </button>

        {webhookTestResult && (
          <div className={`mt-4 p-4 rounded-md border ${
            webhookTestResult.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {webhookTestResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  webhookTestResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {webhookTestResult.message}
                </p>
                {webhookTestResult.error && (
                  <p className="text-sm text-red-700 mt-1">
                    Error: {webhookTestResult.error}
                  </p>
                )}
                {webhookTestResult.timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    Tested at: {new Date(webhookTestResult.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

