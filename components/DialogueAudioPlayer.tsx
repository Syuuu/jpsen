"use client";

import { useMemo, useRef, useState } from "react";
import { useTtsVoice } from "@/hooks/useTtsVoice";
import {
  isPreferFemaleVoice,
  pickAlternateVoice,
  pickJapaneseVoice,
  waitForVoices
} from "@/lib/tts";

const rates = [0.9, 1.0, 1.1, 1.25, 1.4];

type DialogueLine = {
  label: string;
  text: string;
};

export function DialogueAudioPlayer({ lines }: { lines: DialogueLine[] }) {
  const { voice } = useTtsVoice();
  const [rate, setRate] = useState(1.1);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"server" | "browser" | "idle">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playIdRef = useRef(0);

  const resolvedLines = useMemo(() => {
    const primaryVoice = voice;
    const secondaryVoice = pickAlternateVoice(voice);
    return lines.map((line, index) => {
      const lineVoice = index % 2 === 0 ? primaryVoice : secondaryVoice;
      return {
        ...line,
        voice: lineVoice,
        preferFemale: isPreferFemaleVoice(lineVoice)
      };
    });
  }, [lines, voice]);

  const fetchTts = async (text: string, ttsVoice: string) => {
    const res = await fetch(
      `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(ttsVoice)}`
    );
    if (!res.ok || res.status === 204) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("audio")) return null;
    return res.blob();
  };

  const playWebSpeech = async (
    text: string,
    preferFemale: boolean,
    playId: number
  ) => {
    if (typeof window === "undefined") return;
    setSource("browser");
    const synth = window.speechSynthesis;
    const voices = await waitForVoices(synth);
    if (playIdRef.current !== playId) return;
    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = rate;
      const selectedVoice = pickJapaneseVoice(voices, preferFemale);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      synth.cancel();
      synth.speak(utterance);
    });
  };

  const playAudio = (blob: Blob, playId: number) => {
    return new Promise<void>((resolve) => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = rate;
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio
        .play()
        .then(() => {
          if (playIdRef.current !== playId) {
            audio.pause();
          }
        })
        .catch(() => resolve());
    });
  };

  const playSequence = async () => {
    if (resolvedLines.length === 0) return;
    setLoading(true);
    setSource("idle");
    const playId = ++playIdRef.current;
    try {
      for (const line of resolvedLines) {
        if (playIdRef.current !== playId) return;
        const blob = await fetchTts(line.text, line.voice);
        if (blob) {
          setSource("server");
          await playAudio(blob, playId);
        } else {
          await playWebSpeech(line.text, line.preferFemale, playId);
        }
      }
    } finally {
      if (playIdRef.current === playId) {
        setLoading(false);
      }
    }
  };

  const stop = () => {
    playIdRef.current += 1;
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setSource("idle");
    setLoading(false);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-primary flex items-center gap-2" onClick={playSequence}>
          <span aria-hidden>🎬</span>
          <span>{loading ? "播放中..." : "播放会话"}</span>
        </button>
        <button className="btn flex items-center gap-2" onClick={stop}>
          <span aria-hidden>⏹️</span>
          <span>停止</span>
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">语速</span>
        {rates.map((item) => (
          <button
            key={item}
            className={`btn ${item === rate ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setRate(item)}
          >
            {item}x
          </button>
        ))}
      </div>
      <div className="text-xs text-slate-500">
        播放来源：
        {source === "server" && "TTS"}
        {source === "browser" && "浏览器"}
        {source === "idle" && "未播放"}
      </div>
    </div>
  );
}
