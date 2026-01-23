"use client";

import { useEffect, useRef, useState } from "react";
import { useTtsVoice } from "@/hooks/useTtsVoice";
import { isPreferFemaleVoice, pickJapaneseVoice, waitForVoices } from "@/lib/tts";

const rates = [0.9, 1.0, 1.1, 1.25, 1.4];

export function AudioPlayer({ text, voice }: { text: string; voice?: string }) {
  const [rate, setRate] = useState(1.1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"server" | "browser" | "idle">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { voice: storedVoice } = useTtsVoice();
  const resolvedVoice = voice ?? storedVoice;

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, [rate]);

  const fetchTts = async () => {
    if (audioUrl) return audioUrl;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(resolvedVoice)}`
      );
      if (!res.ok || res.status === 204) return null;
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("audio")) return null;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      return url;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const playWithWebSpeech = () => {
    if (typeof window === "undefined") return;
    setSource("browser");
    const synth = window.speechSynthesis;
    const speak = (voices: SpeechSynthesisVoice[]) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = rate;
      const preferred = isPreferFemaleVoice(resolvedVoice);
      const selectedVoice = pickJapaneseVoice(voices, preferred);
      if (selectedVoice) utterance.voice = selectedVoice;
      synth.cancel();
      synth.speak(utterance);
    };
    waitForVoices(synth).then((voices) => speak(voices));
  };

  const handlePlay = async () => {
    handleStop();
    const url = await fetchTts();
    if (url) {
      const audio = new Audio(url);
      audio.playbackRate = rate;
      audioRef.current = audio;
      audio
        .play()
        .catch(() => {
          playWithWebSpeech();
        });
      setSource("server");
      return;
    }
    playWithWebSpeech();
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setSource("idle");
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-primary" onClick={handlePlay}>
          {loading ? "加载中..." : "播放"}
        </button>
        <button className="btn" onClick={handleStop}>
          停止
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
