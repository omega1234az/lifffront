import type { NextApiRequest, NextApiResponse } from "next";

type RequestBody = {
  userId: string;
  message: string;
};

// LINE Messaging API endpoint
const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }
  const { userId, message } = req.body as RequestBody;

  try {
    const response = await fetch(LINE_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      console.error("LINE API error", json);
      return res.status(response.status).json({ error: json });
    }

    return res.status(200).json({ success: true, result: json });
  } catch (err) {
    console.error("API route error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
