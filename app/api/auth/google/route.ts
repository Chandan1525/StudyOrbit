import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://studyorbit-backend-0chi.onrender.com"
        : "http://localhost:5000");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const response = await fetch(`${backendUrl}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "The backend server returned an invalid response. It might be waking up (cold start). Please retry in a few seconds.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Next.js Google Auth Proxy Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error.name === "AbortError"
            ? "Authentication request timed out. The backend server might be waking up, please try again."
            : "Cannot reach backend authentication server. Please check your connection or make sure backend is running.",
      },
      { status: 502 }
    );
  }
}

