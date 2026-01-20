"use client";

import { useEffect, useRef, useState } from "react";

const rates = [0.75, 0.9, 1.0, 1.1, 1.25];

function getJapaneseVoice() {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang === "ja-JP") ||
    voices.find((voice) => voice.lang.startsWith("ja")) ||
    null
  );
}

export function AudioPlayer({ text }: { text: string }) {
  const [rate, setRate] = useState(1.0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);
      if (!res.ok) return null;
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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = rate;
    const voice = getJapaneseVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = async () => {
    const url = await fetchTts();
    if (url) {
      const audio = new Audio(url);
      audio.playbackRate = rate;
      audioRef.current = audio;
      audio.play();
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
  };

  return (
    <div className="space-y-3">
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
    </div>
  );
}
