"use client";

import { useTtsSettings } from "@/hooks/useTtsSettings";

export function TtsSettingsPanel() {
  const { settings, voices, setVoice, setSecondaryVoice } = useTtsSettings();

  return (
    <div className="card space-y-3">
      <div>
        <h2 className="text-lg font-semibold">TTS 播报员设置</h2>
        <p className="text-sm text-slate-600">
          选择 OpenAI 播报员。对话模式会用主/副两个音色区分角色。
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="text-slate-500">主播播报员</span>
          <select
            value={settings.voice}
            onChange={(event) => setVoice(event.target.value as typeof settings.voice)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          >
            {voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-500">副播报员</span>
          <select
            value={settings.secondaryVoice}
            onChange={(event) =>
              setSecondaryVoice(event.target.value as typeof settings.secondaryVoice)
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          >
            {voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
