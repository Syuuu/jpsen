import { NextRequest } from "next/server";
import { createHash } from "crypto";

const audioCache = new Map<string, ArrayBuffer>();

function createCacheKey(text: string, voice: string | null, provider: string | undefined) {
  const hash = createHash("sha256")
    .update(JSON.stringify({ text, voice, provider }))
    .digest("hex");
  return hash;
}

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text");
  const voiceParam = request.nextUrl.searchParams.get("voice");
  if (!text) {
    return new Response("Missing text", { status: 400 });
  }

  const provider = process.env.TTS_PROVIDER;
  if (!provider) {
    return new Response(null, { status: 204 });
  }

  const cacheKey = createCacheKey(text, voiceParam, provider);
  const cached = audioCache.get(cacheKey);
  if (cached) {
    return new Response(cached.slice(0), {
      headers: {
        "Content-Type": "audio/mpeg",
        "X-Cache": "HIT"
      }
    });
  }

  if (provider === "voicerss") {
    const apiKey = process.env.TTS_API_KEY;
    if (!apiKey) {
      return new Response("Missing TTS_API_KEY", { status: 400 });
    }
    const voice = process.env.TTS_VOICE ?? "ja-jp";
    const voiceArg = voiceParam ? `&v=${encodeURIComponent(voiceParam)}` : "";
    const url = `https://api.voicerss.org/?key=${apiKey}&hl=${voice}&src=${encodeURIComponent(
      text
    )}&c=MP3&f=44khz_16bit_stereo${voiceArg}`;
    const res = await fetch(url);
    if (!res.ok) {
      return new Response("TTS provider error", { status: 502 });
    }
    const audioBuffer = await res.arrayBuffer();
    audioCache.set(cacheKey, audioBuffer);
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "X-Cache": "MISS"
      }
    });
  }

  return new Response("Unsupported TTS provider", { status: 501 });
}
