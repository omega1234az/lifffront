"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import { Home, User, CheckCircle, AlertCircle } from "lucide-react";

interface Profile {
  displayName: string;
  userId: string;
  pictureUrl: string;
}

export default function RedeemLIFF() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<"redeem" | "profile">("redeem");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          const prof = await liff.getProfile();
          setProfile({
            displayName: prof.displayName,
            userId: prof.userId,
            pictureUrl: prof.pictureUrl || "/default-avatar.png",
          });
        }
      } catch (err) {
        console.error("LIFF Error:", err);
      }
    };
    initLiff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    // จำลองการตรวจสอบโค้ด (เปลี่ยนเป็นเรียก API จริงได้เลย)
    setTimeout(() => {
      setLoading(false);

      if (["WELCOME2025", "LINEGIFT", "FREECODE", "TEST123"].includes(code.trim().toUpperCase())) {
        setResult({ success: true, message: "ยินดีด้วย! รับสิทธิ์เรียบร้อยแล้ว 🎉" });
        setCode("");
      } else {
        setResult({ success: false, message: "รหัสไม่ถูกต้องหรือหมดอายุแล้ว 😢" });
      }
    }, 1500);
  };

  return (
    <>
      {/* พื้นที่หลัก */}
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24">
        {/* Header เขียวแบบ LINE */}
        <div className="bg-line-green text-white py-5 px-6 shadow-xl">
          <h1 className="text-2xl font-bold text-center">🎁 กรอกรหัสรับของรางวัล</h1>
          {profile && (
            <p className="text-center text-green-50 mt-1 text-sm">
              สวัสดี, {profile.displayName}
            </p>
          )}
        </div>

        <div className="p-6">
          {activeTab === "redeem" && (
            <div className="max-w-md mx-auto">
              {/* กล่องกรอกโค้ด */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 mt-8 border-4 border-green-200">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-5xl">🎁</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">ใส่รหัสของคุณที่นี่</h2>
                  <p className="text-gray-500 mt-2">รับของรางวัลสุดพิเศษทันที!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="เช่น WELCOME2025"
                    className="w-full text-center text-2xl font-mono tracking-widest py-5 border-4 border-gray-300 rounded-2xl focus:border-line-green focus:outline-none transition-all"
                    maxLength={20}
                    autoFocus
                  />

                  <button
                    type="submit"
                    disabled={loading || !code.trim()}
                    className={`w-full py-5 rounded-2xl font-bold text-xl transition-all transform ${
                      loading || !code.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-line-green text-white hover:bg-green-600 active:scale-95 shadow-xl"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                        กำลังตรวจสอบ...
                      </span>
                    ) : (
                      "🎉 แลกรางวัลเลย!"
                    )}
                  </button>
                </form>

                {/* ผลลัพธ์ */}
                {result && (
                  <div
                    className={`mt-8 p-6 rounded-2xl text-center font-bold text-lg transition-all animate-bounce-in ${
                      result.success
                        ? "bg-green-100 text-green-800 border-4 border-green-300"
                        : "bg-red-100 text-red-800 border-4 border-red-300"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-600" />
                    ) : (
                      <AlertCircle className="w-16 h-16 mx-auto mb-3 text-red-600" />
                    )}
                    <p>{result.message}</p>
                  </div>
                )}

                {/* โค้ดตัวอย่าง (ซ่อนใน Production ได้) */}
                <div className="mt-8 text-center text-xs text-gray-400">
                  <p>ทดลองใช้: WELCOME2025, LINEGIFT, TEST123</p>
                </div>
              </div>
            </div>
          )}

          {/* หน้าโปรไฟล์ */}
          {activeTab === "profile" && profile && (
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 mt-8">
              <div className="text-center">
                <img
                  src={profile.pictureUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto border-4 border-line-green shadow-xl"
                />
                <h2 className="text-2xl font-bold mt-6">{profile.displayName}</h2>
                <p className="text-gray-500 mt-2">LINE User ID</p>
                <p className="font-mono text-sm bg-gray-100 px-4 py-2 rounded-lg mt-1 break-all">
                  {profile.userId}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setActiveTab("redeem")}
            className={`flex flex-col items-center py-3 px-8 rounded-xl transition-all ${
              activeTab === "redeem"
                ? "text-line-green font-bold bg-green-50"
                : "text-gray-500"
            }`}
          >
            <Home size={28} />
            <span className="text-xs mt-1">กรอกรหัส</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center py-3 px-8 rounded-xl transition-all ${
              activeTab === "profile"
                ? "text-line-green font-bold bg-green-50"
                : "text-gray-500"
            }`}
          >
            <User size={28} />
            <span className="text-xs mt-1">โปรไฟล์</span>
          </button>
        </div>
      </div>

      {/* สีและ Animation */}
      <style jsx>{`
        .bg-line-green {
          background-color: #06C755;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </>
  );
}