"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";

interface Profile {
  displayName: string;
  userId: string;
  pictureUrl: string;
}

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            pictureUrl: prof.pictureUrl as string,
          });
        }
      } catch (err) {
        console.error("LIFF init error:", err);
        setErrorMessage("ไม่สามารถโหลดโปรไฟล์ได้");
      }
    };
    initLiff();
  }, []);

  const handleSendMessage = async () => {
    if (!profile) return;
    try {
      const resp = await fetch("/api/line", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile.userId,
          message: `สวัสดี ${profile.displayName} จาก LIFF!`,
        }),
      });
      const json = await resp.json();
      alert("ผลลัพธ์: " + JSON.stringify(json));
    } catch (err) {
      console.error("Send message error:", err);
      alert("ส่งข้อความไม่สำเร็จ");
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>LIFF + Next.js 15 + TypeScript 🚀</h1>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {profile ? (
        <div>
          <img src={profile.pictureUrl} width={100} alt="profile" />
          <p>ชื่อ: {profile.displayName}</p>
          <button onClick={handleSendMessage}>
            ส่งข้อความให้ BOT
          </button>
        </div>
      ) : (
        <p>กำลังโหลดโปรไฟล์...</p>
      )}
    </main>
  );
}
