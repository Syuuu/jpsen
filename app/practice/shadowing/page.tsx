"use client";

import { useMemo, useRef, useState } from "react";
import { phrases } from "@/data/phrases";
import { TagChips } from "@/components/TagChips";

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

export default function ShadowingPage() {
  const playlist = useMemo(() => phrases.slice(0, 12), []);
  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [loop, setLoop] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voice = "female1";

  const current = playlist[index];

  const fetchTts = async (text: string) => {
    const res = await fetch(
      `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`
    );
    if (!res.ok || res.status === 204) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("audio")) return null;
    return res.blob();
  };

  const playWebSpeech = (text: string) => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    const speak = (voices: SpeechSynthesisVoice[]) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = rate;
      const selectedVoice = pickJapaneseVoice(voices, voice.startsWith("female"));
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.onend = () => {
        if (loop) {
          playWebSpeech(text);
        }
      };
      synth.cancel();
      synth.speak(utterance);
    };
    waitForVoices(synth).then((voices) => speak(voices));
  };

  const play = async () => {
    if (!current) return;
    setLoading(true);
    try {
      const blob = await fetchTts(current.jp);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = rate;
        audio.loop = loop;
        audioRef.current = audio;
        audio
          .play()
          .catch(() => {
            playWebSpeech(current.jp);
          });
        audio.onended = () => URL.revokeObjectURL(url);
        return;
      }
      playWebSpeech(current.jp);
    } finally {
      setLoading(false);
    }
  };

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h1 className="text-2xl font-semibold">跟读练习</h1>
        <p className="text-slate-600">
          逐句播放，模仿语音节奏。可以调整速度并循环当前句子。
        </p>
      </div>

      {current && (
        <div className="card space-y-4">
          <div>
            <p className="text-xl font-semibold">{current.jp}</p>
            <p className="text-slate-600">{current.cn}</p>
          </div>
          <TagChips tags={current.tags} tone={current.tone} />
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={play}>
              {loading ? "加载中..." : "播放"}
            </button>
            <button className="btn" onClick={stop}>
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
            <button
              className={`btn ${loop ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setLoop((prev) => !prev)}
            >
              {loop ? "循环中" : "循环"}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="btn"
              onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
            >
              上一句
            </button>
            <span className="text-sm text-slate-500">
              {index + 1} / {playlist.length}
            </span>
            <button
              className="btn"
              onClick={() => setIndex((prev) => Math.min(playlist.length - 1, prev + 1))}
            >
              下一句
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
