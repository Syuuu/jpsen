"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { phrases } from "@/data/phrases";
import { TagChips } from "@/components/TagChips";
import { useTtsVoice } from "@/hooks/useTtsVoice";
import {
  isPreferFemaleVoice,
  pickAlternateVoice,
  pickJapaneseVoice,
  waitForVoices
} from "@/lib/tts";

const rates = [0.75, 0.9, 1.0, 1.1, 1.25];

type DialogueLine = {
  label: string;
  text: string;
  cnText?: string;
  voice: string;
  preferFemale: boolean;
};

export default function ShadowingPage() {
  const playlist = useMemo(() => phrases.slice(0, 12), []);
  const { voice } = useTtsVoice();
  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [loop, setLoop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"server" | "browser" | "idle">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playIdRef = useRef(0);

  const current = playlist[index];

  const dialogueLines = useMemo<DialogueLine[]>(() => {
    if (!current) return [];
    const primaryVoice = voice;
    const secondaryVoice = pickAlternateVoice(voice);
    if (current.dialogue) {
      return [
        {
          label: "A",
          text: current.dialogue.a,
          cnText: current.dialogue.cn.a,
          voice: primaryVoice,
          preferFemale: isPreferFemaleVoice(primaryVoice)
        },
        {
          label: "B",
          text: current.dialogue.b,
          cnText: current.dialogue.cn.b,
          voice: secondaryVoice,
          preferFemale: isPreferFemaleVoice(secondaryVoice)
        }
      ];
    }
    return [
      {
        label: "句子",
        text: current.jp,
        voice: primaryVoice,
        preferFemale: isPreferFemaleVoice(primaryVoice)
      }
    ];
  }, [current, voice]);

  const fetchTts = async (text: string, ttsVoice: string) => {
    const res = await fetch(
      `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(ttsVoice)}`
    );
    if (!res.ok || res.status === 204) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("audio")) return null;
    return res.blob();
  };

  const playWebSpeech = async (line: DialogueLine, playId: number) => {
    if (typeof window === "undefined") return;
    setSource("browser");
    const synth = window.speechSynthesis;
    const voices = await waitForVoices(synth);
    if (playIdRef.current !== playId) return;
    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.lang = "ja-JP";
      utterance.rate = rate;
      const selectedVoice = pickJapaneseVoice(voices, line.preferFemale);
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
    if (!current) return;
    setLoading(true);
    const playId = ++playIdRef.current;
    try {
      do {
        for (const line of dialogueLines) {
          if (playIdRef.current !== playId) return;
          const blob = await fetchTts(line.text, line.voice);
          if (blob) {
            setSource("server");
            await playAudio(blob, playId);
          } else {
            await playWebSpeech(line, playId);
          }
        }
      } while (loop && playIdRef.current === playId);
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

  useEffect(() => {
    if (!current) return;
    stop();
    playSequence();
    return () => {
      stop();
    };
  }, [index]);

  if (!current) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h1 className="text-2xl font-semibold">跟读练习</h1>
        <p className="text-slate-600">
          自动播放整段会话，按对话顺序模仿语音节奏。
        </p>
      </div>

      <div className="card space-y-4">
        <div className="space-y-2">
          {dialogueLines.map((line) => (
            <div key={line.label} className="text-sm text-slate-600">
              <span className="mr-2 font-semibold text-slate-700">{line.label}：</span>
              <span className="text-base text-slate-900">{line.text}</span>
              {line.cnText && (
                <span className="block text-sm text-slate-500">
                  {line.label}：{line.cnText}
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-600">{current.cn}</p>
        <TagChips tags={current.tags} tone={current.tone} />
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={playSequence}>
            {loading ? "播放中..." : "重新播放"}
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
        <div className="text-xs text-slate-500">
          播放来源：
          {source === "server" && "TTS"}
          {source === "browser" && "浏览器"}
          {source === "idle" && "未播放"}
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
    </div>
  );
}
