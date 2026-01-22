"use client";

import { useEffect, useRef, useState } from "react";

const rates = [0.75, 0.9, 1.0, 1.1, 1.25];
const femaleVoiceRegex = /female|woman|girl|女|女性|ガール/i;

function pickJapaneseVoice(voices: SpeechSynthesisVoice[], preferFemale: boolean) {
  const japaneseVoices = voices.filter((voice) => voice.lang.startsWith("ja"));
  if (preferFemale) {
    const femaleVoice = japaneseVoices.find((voice) => femaleVoiceRegex.test(voice.name));
    if (femaleVoice) return femaleVoice;
  }
  return japaneseVoices[0] ?? null;
}

function waitForVoices(synth: SpeechSynthesis) {
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const voices = synth.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const handle = () => {
      resolve(synth.getVoices());
      synth.onvoiceschanged = null;
    };
    synth.onvoiceschanged = handle;
  });
}

export function AudioPlayer({ text, voice = "female1" }: { text: string; voice?: string }) {
  const [rate, setRate] = useState(1.0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"server" | "browser" | "idle">("idle");
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
      const res = await fetch(
        `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`
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
      const preferred = voice.startsWith("female");
      const selectedVoice = pickJapaneseVoice(voices, preferred);
      if (selectedVoice) utterance.voice = selectedVoice;
      synth.cancel();
      synth.speak(utterance);
    };
    waitForVoices(synth).then((voices) => speak(voices));
  };

  const handlePlay = async () => {
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
      <div className="text-xs text-slate-500">
        播放来源：
        {source === "server" && "TTS"}
        {source === "browser" && "浏览器"}
        {source === "idle" && "未播放"}
      </div>
    </div>
  );
}
