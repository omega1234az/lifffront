"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import { User, Gift, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface Profile {
  displayName: string;
  userId: string;
  pictureUrl?: string;
}

export default function RedeemLIFF() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

  // เพิ่ม: ตรวจจับและปรับตาม Theme ของ LINE (Light/Dark)
useEffect(() => {
  const init = async () => {
    try {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

      // Dark mode
      const applyTheme = () => {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.toggle("dark", isDark);
      };
      applyTheme();
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

      // แก้บัค iOS เด้ง login ซ้ำ (วิธีที่ดีที่สุดปี 2025)
      if (!liff.isLoggedIn() && !liff.getAccessToken()) {
        liff.login();
        return;
      }

      const prof = await liff.getProfile();
      setProfile({
        displayName: prof.displayName || "ลูกค้า",
        userId: prof.userId,
        pictureUrl: prof.pictureUrl,
      });

      await fetchPoints(prof.userId);
    } catch (err: any) {
      console.error("LIFF init error:", err);
      if (err?.code === "INIT_FAILED") {
        liff.login();
      }
    } finally {
      setLoading(false);
    }
  };

  init();

  return () => {
    window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", () => {});
  };
}, []);

  const fetchPoints = async (userId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/points/${userId}`);
      const data = await res.json();
      if (data.success) {
        setPoints(data.points);
      }
    } catch (err) {
      console.error("Failed to fetch points:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !profile) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.userId,
          code: code.trim().toUpperCase(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPoints(data.totalPoints);
        setResult({ success: true, message: `ได้รับ ${data.addedPoints} แต้ม` });
      } else {
        setResult({ success: false, message: data.message });
      }
    } catch (err) {
      setResult({ success: false, message: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" });
    } finally {
      setSubmitting(false);
      setCode("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-gray-600 dark:text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Gift className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            <h1 className="text-lg font-semibold">ระบบสะสมแต้ม</h1>
          </div>
          {profile && (
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm">{profile.displayName.split(" ")[0]}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - ลดขนาดลงให้เหมาะกับมือถือ */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-20">
        {/* Points Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ยอดแต้มสะสมปัจจุบัน</p>
            <p className="text-5xl font-bold">
              {points !== null ? points.toLocaleString() : "-"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">แต้ม</p>
          </div>
        </div>

        {/* Redeem Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium mb-5">กรอกรหัสรับแต้ม</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="กรอกรหัสที่นี่"
              className="w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl text-base placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:border-transparent transition-all"
              maxLength={20}
              disabled={submitting}
              autoFocus
            />

            <button
              type="submit"
              disabled={submitting || !code.trim()}
              className={`w-full py-3.5 rounded-xl font-medium text-base transition-all flex items-center justify-center gap-2 ${
                submitting || !code.trim()
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 active:bg-gray-700 shadow-md"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                "ยืนยันรหัส"
              )}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div
              className={`mt-5 p-4 rounded-xl border font-medium flex items-center gap-3 ${
                result.success
                  ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p>{result.message}</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          <p>พิมพ์ "แลกรางวัล" ในแชทเพื่อดูของที่แลกได้</p>
          <p className="mt-1">หรือ "แต้มของฉัน" เพื่อดูยอดแต้ม</p>
        </div>
      </main>
    </div>
  );
}