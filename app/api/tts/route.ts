import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text");
  if (!text) {
    return new Response("Missing text", { status: 400 });
  }

  const provider = process.env.TTS_PROVIDER;
  if (!provider) {
    return new Response(null, { status: 204 });
  }

  if (provider === "voicerss") {
    const apiKey = process.env.TTS_API_KEY;
    if (!apiKey) {
      return new Response("Missing TTS_API_KEY", { status: 400 });
    }
    const voice = process.env.TTS_VOICE ?? "ja-jp";
    const url = `https://api.voicerss.org/?key=${apiKey}&hl=${voice}&src=${encodeURIComponent(
      text
    )}&c=MP3&f=44khz_16bit_stereo`;
    const res = await fetch(url);
    if (!res.ok) {
      return new Response("TTS provider error", { status: 502 });
    }
    const audioBuffer = await res.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg"
      }
    });
  }

  return new Response("Unsupported TTS provider", { status: 501 });
}
