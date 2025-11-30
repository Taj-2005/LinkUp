"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { useRouter } from "next/navigation";

export default function TestEmailPage() {
  const { currentUser } = useUsers();
  const user = currentUser;
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [stats, setStats] = useState<{ total: number; sent: number; failed: number } | null>(null);

  if (!user || user.username?.toLowerCase() !== "tajuddinshaik_6") {
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-primary-light dark:bg-primary-dark">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-primary-dark dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-primary-light dark:text-gray-400">
            This page is only accessible to authorized users.
          </p>
          <button
            onClick={() => router.push("/linkhub")}
            className="mt-4 px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleSendEmails = async () => {
    setSending(true);
    setStatus({ type: null, message: "" });
    setStats(null);

    try {
      const response = await fetch("/api/test/send-bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send emails");
      }

      setStatus({
        type: "success",
        message: `Emails sent successfully! ${data.sent} emails sent to verified users.`,
      });
      setStats({
        total: data.total,
        sent: data.sent,
        failed: data.failed,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send emails",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-primary-light dark:bg-primary-dark p-4">
      <div className="max-w-2xl w-full bg-right-nav-light dark:bg-right-nav-dark rounded-2xl p-6 md:p-8 shadow-xl border border-[#d7d7d7] dark:border-white/10">
        <h1 className="text-3xl font-extrabold text-primary-dark dark:text-white mb-2">
          Email Test Page
        </h1>
        <p className="text-primary-light dark:text-gray-400 mb-6">
          Send engaging emails to all verified users for testing purposes.
        </p>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            ⚠️ This is a test page. Emails will be sent to all verified users.
          </p>
        </div>

        <button
          onClick={handleSendEmails}
          disabled={sending}
          className={`
            w-full px-6 py-3 rounded-xl font-semibold text-base
            bg-primary-light text-white dark:bg-primary-dark dark:text-white
            hover:brightness-110 shadow-lg transition
            ${sending ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {sending ? "Sending Emails..." : "Send Test Emails to All Verified Users"}
        </button>

        {status.type && (
          <div
            className={`mt-6 p-4 rounded-xl ${
              status.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400"
            }`}
          >
            <p className="font-semibold">{status.message}</p>
          </div>
        )}

        {stats && (
          <div className="mt-6 p-4 bg-left-nav-light dark:bg-left-nav-dark rounded-xl">
            <h3 className="font-semibold text-primary-dark dark:text-white mb-3">
              Email Statistics
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-light dark:text-gray-400">Total Verified Users:</span>
                <span className="font-semibold text-primary-dark dark:text-white">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-light dark:text-gray-400">Emails Sent:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{stats.sent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-light dark:text-gray-400">Failed:</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{stats.failed}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-primary-light dark:text-gray-500 text-center">
          <p>This page can be safely deleted after testing.</p>
        </div>
      </div>
    </div>
  );
}

