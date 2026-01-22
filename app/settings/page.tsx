"use client";

import { useTtsVoice } from "@/hooks/useTtsVoice";

const voiceDescriptions: Record<string, string> = {
  alloy: "清晰中性",
  ash: "稳重低沉",
  coral: "轻快明亮",
  echo: "干净有力",
  fable: "温和叙述",
  onyx: "厚实沉稳",
  nova: "柔和亲切",
  sage: "平静温暖",
  shimmer: "柔亮细腻"
};

export default function SettingsPage() {
  const { voice, setVoice, options } = useTtsVoice();

  return (
    <div className="space-y-6">
      <div className="card space-y-2">
        <h1 className="text-2xl font-semibold">环境设置</h1>
        <p className="text-slate-600">选择喜欢的 TTS 播报员。</p>
      </div>

      <div className="card space-y-3">
        <label className="text-sm font-semibold text-slate-700">播报员</label>
        <div className="grid gap-2 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option}
              className={`btn ${option === voice ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setVoice(option)}
            >
              <span className="font-semibold capitalize">{option}</span>
              <span className="ml-2 text-xs text-slate-500">
                {voiceDescriptions[option]}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          跟读与听力测试会使用这里设置的播报员。对话中会自动切换到另一个音色区分
          对话双方。
        </p>
      </div>
    </div>
  );
}
