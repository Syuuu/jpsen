"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { phrases } from "@/data/phrases";
import { useTtsVoice } from "@/hooks/useTtsVoice";
import { useOpenedPhrases } from "@/hooks/useOpenedPhrases";
import { isPreferFemaleVoice, pickJapaneseVoice, waitForVoices } from "@/lib/tts";

const TOTAL_QUESTIONS = 12;
const baseRate = 1.1;

type ListeningType = "meaning" | "reply";

type ListeningItem = {
  id: string;
  type: ListeningType;
  audioText: string;
  prompt: string;
  answer: string;
  options: string[];
};

function sampleOptions(pool: string[], correct: string, count = 4) {
  const filtered = pool.filter((item) => item !== correct);
  const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, count - 1);
  const options = [...shuffled, correct].sort(() => Math.random() - 0.5);
  return options;
}

export default function ListeningPage() {
  const { voice } = useTtsVoice();
  const { opened } = useOpenedPhrases();
  const learnedPool = useMemo(
    () => phrases.filter((phrase) => opened.includes(phrase.id)),
    [opened]
  );
  const dialoguePool = useMemo(
    () => learnedPool.filter((phrase) => phrase.dialogue),
    [learnedPool]
  );
  const meaningPool = useMemo(() => learnedPool, [learnedPool]);
  const items = useMemo<ListeningItem[]>(() => {
    const questions: ListeningItem[] = [];
    const meaningChoices = meaningPool.map((phrase) => phrase.cn);
    const replyChoices = dialoguePool.map((phrase) => phrase.dialogue?.b ?? "");

    const hasDialogues = dialoguePool.length > 0;
    meaningPool.slice(0, TOTAL_QUESTIONS).forEach((phrase, idx) => {
      const isReply = hasDialogues && idx % 2 === 1 && dialoguePool[idx % dialoguePool.length];
      if (isReply) {
        const dialogue = dialoguePool[idx % dialoguePool.length].dialogue!;
        const answer = dialogue.b;
        questions.push({
          id: `${phrase.id}-reply`,
          type: "reply",
          audioText: dialogue.a,
          prompt: "听对话第一句，选择最合适的回答。",
          answer,
          options: sampleOptions(replyChoices, answer)
        });
      } else {
        const answer = phrase.cn;
        questions.push({
          id: `${phrase.id}-meaning`,
          type: "meaning",
          audioText: phrase.jp,
          prompt: "听句子，选择正确含义。",
          answer,
          options: sampleOptions(meaningChoices, answer)
        });
      }
    });

    return questions.slice(0, TOTAL_QUESTIONS);
  }, [dialoguePool, meaningPool]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "reveal" | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"server" | "browser" | "idle">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = items[index];

  const fetchTts = async (text: string) => {
    const res = await fetch(
      `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`
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
    const voices = await waitForVoices(synth);
    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = baseRate;
      const preferred = isPreferFemaleVoice(voice);
      const selectedVoice = pickJapaneseVoice(voices, preferred);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      synth.cancel();
      synth.speak(utterance);
    });
  };

  const playAudio = async () => {
    if (!current) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setSource("idle");
    setLoading(true);
    const blob = await fetchTts(current.audioText);
    if (blob) {
      setSource("server");
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = baseRate;
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setLoading(false);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setLoading(false);
      };
      audio.play().catch(async () => {
        await playWebSpeech(current.audioText);
        setLoading(false);
      });
      return;
    }
    await playWebSpeech(current.audioText);
    setLoading(false);
  };

  useEffect(() => {
    if (!current) return;
    setSelected(null);
    setAttempts(0);
    setFeedback(null);
    playAudio();
    return () => {
      audioRef.current?.pause();
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, [index, current?.id]);

  useEffect(() => {
    setIndex(0);
    setWrongCount(0);
    setWrongIds([]);
  }, [items.length]);

  const goNext = () => {
    setSelected(null);
    setAttempts(0);
    setFeedback(null);
    setIndex((prev) => Math.min(items.length, prev + 1));
  };

  const handleSelect = (choice: string) => {
    if (!current) return;
    setSelected(choice);
    if (choice === current.answer) {
      setFeedback("correct");
      setTimeout(() => goNext(), 700);
      return;
    }

    if (attempts === 0) {
      setAttempts(1);
      setFeedback("wrong");
      if (!wrongIds.includes(current.id)) {
        setWrongIds((prev) => [...prev, current.id]);
        setWrongCount((prev) => prev + 1);
      }
    } else {
      setFeedback("reveal");
      setTimeout(() => goNext(), 900);
    }
  };

  if (learnedPool.length === 0) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-semibold">听力测试</h1>
        <p className="text-slate-600">请先学习一些句子，再来进行测试。</p>
        <Link href="/library" className="btn btn-primary">
          去会话库学习
        </Link>
      </div>
    );
  }

  if (!current) {
    const total = items.length;
    const accuracy = total === 0 ? 0 : Math.round(((total - wrongCount) / total) * 100);
    const encouragement =
      accuracy >= 90
        ? "太棒了！发音和理解都很扎实。"
        : accuracy >= 70
        ? "做得不错！保持节奏继续进步。"
        : "继续加油，多练几轮就会更顺畅。";
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-semibold">听力测试结算</h1>
        <p className="text-slate-600">正确率 {accuracy}%</p>
        <p className="text-slate-500">{encouragement}</p>
        <Link href="/" className="btn btn-primary">
          返回主页
        </Link>
      </div>
    );
  }

  const isLocked = feedback === "correct" || feedback === "reveal";

  return (
    <div className="space-y-6">
      <div className="card space-y-2">
        <h1 className="text-2xl font-semibold">听力测试</h1>
        <p className="text-slate-600">听句子或对话，选择正确答案。</p>
        <p className="text-sm text-slate-500">
          进度 {index + 1} / {items.length}
        </p>
      </div>

      <div className="card space-y-4">
        <p className="text-sm text-slate-600">{current.prompt}</p>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <button className="btn btn-primary" onClick={playAudio}>
            {loading ? "播放中..." : "播放"}
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
            const isCorrect = option === current.answer;
            const isSelected = selected === option;
            const showCorrect = feedback === "reveal" && isCorrect;
            return (
              <button
                key={option}
                className={`btn ${
                  showCorrect
                    ? "btn-primary"
                    : isSelected && feedback === "wrong"
                      ? "border-rose-300 text-rose-500"
                      : isSelected && feedback === "correct"
                        ? "btn-primary"
                        : ""
                }`}
                onClick={() => handleSelect(option)}
                disabled={isLocked}
              >
                {option}
              </button>
            );
          })}
        </div>
        {feedback === "wrong" && (
          <p className="text-sm text-rose-500">不对，再试一次。</p>
        )}
        {feedback === "reveal" && (
          <p className="text-sm text-emerald-600">正确答案：{current.answer}</p>
        )}
      </div>
    </div>
  );
}
