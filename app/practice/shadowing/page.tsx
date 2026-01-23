"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { phrases } from "@/data/phrases";
import { TagChips } from "@/components/TagChips";
import { useTtsVoice } from "@/hooks/useTtsVoice";
import { useOpenedPhrases } from "@/hooks/useOpenedPhrases";
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
  cnText?: string;
  voice: string;
  preferFemale: boolean;
};

export default function ShadowingPage() {
  const { opened } = useOpenedPhrases();
  const playlist = useMemo(() => {
    const phraseMap = new Map(phrases.map((phrase) => [phrase.id, phrase]));
    const recentIds = opened.slice(-20).reverse();
    return recentIds
      .map((id) => phraseMap.get(id))
      .filter((phrase): phrase is (typeof phrases)[number] => Boolean(phrase));
  }, [opened]);
  const { voice } = useTtsVoice();
  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState(1.1);
  const [loop, setLoop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"server" | "browser" | "idle">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playIdRef = useRef(0);

  const current = playlist[index];

  useEffect(() => {
    setIndex(0);
  }, [playlist.length]);

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
    if (current.dialogue) {
      stop();
      playSequence();
      return () => {
        stop();
      };
    }
  }, [index, current?.dialogue]);

  if (playlist.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-lg font-semibold">还没有学习记录</p>
        <p className="text-slate-600">跟读仅展示学习过的内容。</p>
      </div>
    );
  }

  if (playlist.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-lg font-semibold">还没有学习记录</p>
        <p className="text-slate-600">跟读仅展示学习过的内容。</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="card text-center space-y-3">
        <p className="text-lg font-semibold">跟读完成！</p>
        <p className="text-slate-600">已完成本次学习内容的跟读。</p>
        <Link href="/practice/cloze" className="btn btn-primary">
          进入听力测试
        </Link>
      </div>
    );
  }

  const playLabel = current?.dialogue ? "播放会话" : "播放句子";

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h1 className="text-2xl font-semibold">🎧 跟读练习</h1>
        <p className="text-slate-600">
          自动播放整段会话，按对话顺序模仿语音节奏。
        </p>
      </div>

      <div className="card space-y-4">
        <p className="text-sm text-slate-500">仅展示你学习过的内容。</p>
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
        <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <button className="btn btn-primary flex items-center gap-2" onClick={playSequence}>
            <span aria-hidden>🎬</span>
            <span>{loading ? "播放中..." : playLabel}</span>
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
