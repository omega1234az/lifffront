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

  useEffect(() => {
    const init = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const prof = await liff.getProfile();
        setProfile({
          displayName: prof.displayName || "ลูกค้า",
          userId: prof.userId,
          pictureUrl: prof.pictureUrl,
        });

        // ดึงแต้มทันที
        await fetchPoints(prof.userId);
      } catch (err) {
        console.error("LIFF init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-7 h-7 text-gray-700" />
              <h1 className="text-xl font-semibold text-gray-900">ระบบสะสมแต้ม</h1>
            </div>
            {profile && (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">{profile.displayName.split(" ")[0]}</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-6 py-8">
          {/* Points Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">ยอดแต้มสะสมปัจจุบัน</p>
              <p className="text-5xl font-bold text-gray-900">
                {points !== null ? points.toLocaleString() : "-"}
              </p>
              <p className="text-sm text-gray-500 mt-2">แต้ม</p>
            </div>
          </div>

          {/* Redeem Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-lg font-medium text-gray-900 mb-6">กรอกรหัสรับแต้ม</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="กรอกรหัสที่นี่"
                className="w-full px-5 py-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                maxLength={20}
                disabled={submitting}
              />

              <button
                type="submit"
                disabled={submitting || !code.trim()}
                className={`w-full py-4 rounded-xl font-medium text-lg transition-all ${
                  submitting || !code.trim()
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    กำลังตรวจสอบ...
                  </span>
                ) : (
                  "ยืนยันรหัส"
                )}
              </button>
            </form>

            {/* Result */}
            {result && (
              <div
                className={`mt-6 p-5 rounded-xl border ${
                  result.success
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                  <p className="font-medium">{result.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>พิมพ์ "แลกรางวัล" ในแชทเพื่อดูของที่แลกได้</p>
            <p className="mt-1">หรือ "แต้มของฉัน" เพื่อดูยอดแต้ม</p>
          </div>
        </main>
      </div>
    </>
  );
}