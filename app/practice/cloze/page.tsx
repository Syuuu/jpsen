"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { phrases, Phrase } from "@/data/phrases";
import { useTtsSettings } from "@/hooks/useTtsSettings";
import { prefersFemaleVoice } from "@/lib/tts";

const femaleVoiceRegex = /female|woman|girl|女|女性|ガール/i;

type ListeningQuestion = {
  id: string;
  type: "meaning" | "reply";
  prompt: string;
  correct: string;
  options: string[];
  label: string;
  phrase: Phrase;
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

const buildOptions = (correct: string, pool: string[]) => {
  const candidates = pool.filter((option) => option !== correct);
  const shuffled = candidates.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [...shuffled, correct].sort(() => Math.random() - 0.5);
  return options;
};

export default function ClozePage() {
  const { settings } = useTtsSettings();
  const items = useMemo(() => {
    const meaningQuestions: ListeningQuestion[] = phrases.slice(0, 8).map((phrase) => ({
      id: `${phrase.id}-meaning`,
      type: "meaning",
      prompt: phrase.jp,
      correct: phrase.cn,
      options: buildOptions(
        phrase.cn,
        phrases.map((item) => item.cn)
      ),
      label: "听句子，选择正确意思",
      phrase
    }));

    const dialoguePhrases = phrases.filter((phrase) => phrase.dialogue).slice(0, 6);
    const replyPool = dialoguePhrases.map((phrase) => phrase.dialogue!.b);
    const replyQuestions: ListeningQuestion[] = dialoguePhrases.map((phrase) => ({
      id: `${phrase.id}-reply`,
      type: "reply",
      prompt: phrase.dialogue!.a,
      correct: phrase.dialogue!.b,
      options: buildOptions(phrase.dialogue!.b, replyPool),
      label: "听第一句，选择合适回应",
      phrase
    }));

    return [...meaningQuestions, ...replyQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);
  }, []);

  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "reveal">("idle");
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"server" | "browser" | "idle">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const current = items[index];

  const resetQuestionState = () => {
    setAttempts(0);
    setStatus("idle");
    setWrongOptions([]);
  };

  useEffect(() => {
    resetQuestionState();
  }, [index]);

  const stopPlayback = () => {
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

  const fetchTts = async (text: string) => {
    const res = await fetch(
      `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(settings.voice)}`
    );
    if (!res.ok || res.status === 204) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("audio")) return null;
    return res.blob();
  };

  const playWebSpeech = async (text: string) => {
    if (typeof window === "undefined") return;
    setSource("browser");
    const synth = window.speechSynthesis;
    await waitForVoices(synth).then(
      (voices) =>
        new Promise<void>((resolve) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "ja-JP";
          const selectedVoice = pickJapaneseVoice(voices, prefersFemaleVoice(settings.voice));
          if (selectedVoice) utterance.voice = selectedVoice;
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          synth.cancel();
          synth.speak(utterance);
        })
    );
  };

  const playPrompt = async () => {
    if (!current) return;
    stopPlayback();
    setLoading(true);
    const blob = await fetchTts(current.prompt);
    if (blob) {
      setSource("server");
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioUrlRef.current = null;
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        audioUrlRef.current = null;
      };
      try {
        await audio.play();
      } catch {
        await playWebSpeech(current.prompt);
      } finally {
        setLoading(false);
      }
      return;
    }
    await playWebSpeech(current.prompt);
    setLoading(false);
  };

  useEffect(() => {
    if (current) {
      playPrompt();
    }
    return () => stopPlayback();
  }, [current, settings.voice]);

  const handleSelect = (choice: string) => {
    if (!current || status !== "idle") return;
    if (choice === current.correct) {
      setStatus("correct");
      setTimeout(() => {
        setIndex((prev) => Math.min(items.length, prev + 1));
      }, 700);
      return;
    }

    if (attempts === 0) {
      setAttempts(1);
      setWrongOptions((prev) => [...prev, choice]);
      return;
    }

    setWrongOptions((prev) => [...prev, choice]);
    setStatus("reveal");
    setTimeout(() => {
      setIndex((prev) => Math.min(items.length, prev + 1));
    }, 1200);
  };

  if (!current) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-semibold">听力测试完成</h1>
        <p className="text-slate-600">完成 {items.length} 题</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-2">
        <h1 className="text-2xl font-semibold">听力测试</h1>
        <p className="text-slate-600">{current.label}</p>
        <p className="text-sm text-slate-500">
          进度 {index + 1} / {items.length}
        </p>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn btn-primary" onClick={playPrompt} disabled={loading}>
            {loading ? "播放中..." : "播放听力"}
          </button>
          <span className="text-xs text-slate-500">
            播放来源：
            {source === "server" && "TTS"}
            {source === "browser" && "浏览器"}
            {source === "idle" && "未播放"}
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {current.options.map((option) => {
            const isWrong = wrongOptions.includes(option);
            const isCorrect = status !== "idle" && option === current.correct;
            return (
              <button
                key={option}
                className={`btn ${
                  isCorrect
                    ? "btn-primary"
                    : isWrong
                      ? "border-rose-300 text-rose-500"
                      : ""
                }`}
                onClick={() => handleSelect(option)}
                disabled={status !== "idle"}
              >
                {option}
              </button>
            );
          })}
        </div>
        {status === "correct" && (
          <p className="text-sm text-emerald-600">正确！进入下一题。</p>
        )}
        {status === "reveal" && (
          <p className="text-sm text-slate-600">
            正确答案：{current.correct}
          </p>
        )}
        {status === "idle" && attempts > 0 && (
          <p className="text-sm text-rose-500">不对哦，再试一次。</p>
        )}
      </div>
    </div>
  );
}
