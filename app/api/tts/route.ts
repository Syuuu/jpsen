import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { isTtsVoice, normalizeTtsVoice, openAiVoices } from "@/lib/tts";

const audioCache = new Map<string, ArrayBuffer>();
function createCacheKey(text: string, voice: string | null, provider: string | undefined) {
  const hash = createHash("sha256")
    .update(JSON.stringify({ text, voice, provider }))
    .digest("hex");
  return hash;
}

function isUiVoiceLabel(voice: string | null) {
  return Boolean(voice && /^(female|male)\d*$/i.test(voice));
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

  if (provider === "voicerss") {
    const apiKey = process.env.TTS_API_KEY;
    if (!apiKey) {
      return new Response("Missing TTS_API_KEY", { status: 400 });
    }
    const voice = process.env.TTS_VOICE ?? "ja-jp";
    const resolvedVoiceParam = voiceParam && !isUiVoiceLabel(voiceParam) ? voiceParam : null;
    const cacheVoice = resolvedVoiceParam ? `${voice}:${resolvedVoiceParam}` : voice;
    const cacheKey = createCacheKey(text, cacheVoice, provider);
    const cached = audioCache.get(cacheKey);
    if (cached) {
      return new Response(cached.slice(0), {
        headers: {
          "Content-Type": "audio/mpeg",
          "X-Cache": "HIT"
        }
      });
    }
    const voiceArg = resolvedVoiceParam ? `&v=${encodeURIComponent(resolvedVoiceParam)}` : "";
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

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response("Missing OPENAI_API_KEY", { status: 400 });
    }
    const model = process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
    const format = process.env.OPENAI_TTS_FORMAT ?? "mp3";
    const candidateVoice =
      voiceParam && !isUiVoiceLabel(voiceParam) && isTtsVoice(voiceParam) ? voiceParam : null;
    const envVoice = normalizeTtsVoice(process.env.TTS_VOICE ?? undefined);
    const voice = candidateVoice && openAiVoices.has(candidateVoice) ? candidateVoice : envVoice;
    const cacheKey = createCacheKey(text, voice, provider);
    const cached = audioCache.get(cacheKey);
    if (cached) {
      return new Response(cached.slice(0), {
        headers: {
          "Content-Type": "audio/mpeg",
          "X-Cache": "HIT"
        }
      });
    }
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        voice,
        format,
        input: text
      })
    });
    if (!res.ok) {
      const errorText = await res.text();
      return new Response(`TTS provider error: ${errorText}`, { status: 502 });
    }
    const audioBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "audio/mpeg";
    audioCache.set(cacheKey, audioBuffer);
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": contentType,
        "X-Cache": "MISS"
      }
    });
  }

  return new Response("Unsupported TTS provider", { status: 501 });
}
