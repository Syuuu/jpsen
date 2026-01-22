"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { phrases } from "@/data/phrases";
import { TagChips } from "@/components/TagChips";
import { useTtsSettings } from "@/hooks/useTtsSettings";
import { prefersFemaleVoice } from "@/lib/tts";

const rates = [0.75, 0.9, 1.0, 1.1, 1.25];
const femaleVoiceRegex = /female|woman|girl|女|女性|ガール/i;

type ConversationItem = {
  id: string;
  cn: string;
  tags: string[];
  tone: "casual" | "polite" | "soft";
  dialogue: { a: string; b: string };
};

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
  const { settings } = useTtsSettings();
  const playlist = useMemo(
    () =>
      phrases
        .filter((phrase): phrase is ConversationItem => Boolean(phrase.dialogue))
        .slice(0, 12)
        .map((phrase) => ({
          id: phrase.id,
          cn: phrase.cn,
          tags: phrase.tags,
          tone: phrase.tone,
          dialogue: phrase.dialogue!
        })),
    []
  );
  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [loop, setLoop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"server" | "browser" | "idle">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const playbackId = useRef(0);

  const current = playlist[index];

  const fetchTts = async (text: string, voice: string) => {
    const res = await fetch(
      `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`
    );
    if (!res.ok || res.status === 204) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("audio")) return null;
    return res.blob();
  };

  const stopPlayback = () => {
    playbackId.current += 1;
    audioRef.current?.pause();
    audioRef.current = null;
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setSource("idle");
    setLoading(false);
  };

  const playWebSpeech = async (text: string, voiceId: string) => {
    if (typeof window === "undefined") return;
    setSource("browser");
    const synth = window.speechSynthesis;
    await waitForVoices(synth).then(
      (voices) =>
        new Promise<void>((resolve) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "ja-JP";
          utterance.rate = rate;
          const selectedVoice = pickJapaneseVoice(voices, prefersFemaleVoice(voiceId));
          if (selectedVoice) utterance.voice = selectedVoice;
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          synth.cancel();
          synth.speak(utterance);
        })
    );
  };

  const playAudioBlob = (blob: Blob) => {
    return new Promise<void>((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audio.playbackRate = rate;
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioUrlRef.current = null;
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        audioUrlRef.current = null;
        reject(new Error("audio error"));
      };
      audio
        .play()
        .catch((error) => {
          URL.revokeObjectURL(url);
          audioUrlRef.current = null;
          reject(error);
        });
    });
  };

  const playConversation = async () => {
    if (!current) return;
    stopPlayback();
    const runId = playbackId.current;
    setLoading(true);
    const lines = [
      { speaker: "A", text: current.dialogue.a },
      { speaker: "B", text: current.dialogue.b }
    ];

    for (const line of lines) {
      if (runId !== playbackId.current) return;
      const voiceId = line.speaker === "A" ? settings.voice : settings.secondaryVoice;
      const blob = await fetchTts(line.text, voiceId);
      if (runId !== playbackId.current) return;
      if (blob) {
        setSource("server");
        try {
          await playAudioBlob(blob);
          continue;
        } catch {
          await playWebSpeech(line.text, voiceId);
          continue;
        }
      }
      await playWebSpeech(line.text, voiceId);
    }

    if (runId !== playbackId.current) return;
    setLoading(false);
    if (loop) {
      playConversation();
    }
  };

  useEffect(() => {
    playConversation();
    return () => stopPlayback();
  }, [index, rate, loop, settings.voice, settings.secondaryVoice]);

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h1 className="text-2xl font-semibold">跟读练习</h1>
        <p className="text-slate-600">
          自动播放完整会话，模仿语音节奏。可以调整速度并循环当前对话。
        </p>
      </div>

      {current && (
        <div className="card space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">对话</p>
            <p className="text-lg font-semibold">A：{current.dialogue.a}</p>
            <p className="text-lg font-semibold">B：{current.dialogue.b}</p>
            <p className="text-slate-600">{current.cn}</p>
          </div>
          <TagChips tags={current.tags} tone={current.tone} />
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={playConversation}>
              {loading ? "播放中..." : "重播"}
            </button>
            <button className="btn" onClick={stopPlayback}>
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
      )}
    </div>
  );
}
