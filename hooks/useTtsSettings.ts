"use client";

import { useEffect, useMemo, useState } from "react";
import { readStorage, storageKeys, writeStorage } from "@/lib/storage";
import {
  defaultTtsVoice,
  isTtsVoice,
  secondaryTtsVoice,
  TtsVoiceId,
  ttsVoices
} from "@/lib/tts";

export type TtsSettings = {
  voice: TtsVoiceId;
  secondaryVoice: TtsVoiceId;
};

const normalizeSettings = (value?: Partial<TtsSettings>): TtsSettings => {
  const voice = isTtsVoice(value?.voice) ? value?.voice : defaultTtsVoice;
  const secondaryVoice = isTtsVoice(value?.secondaryVoice)
    ? value?.secondaryVoice
    : secondaryTtsVoice;
  return { voice, secondaryVoice };
};

export function useTtsSettings() {
  const [settings, setSettings] = useState<TtsSettings>(() =>
    normalizeSettings(readStorage<TtsSettings | undefined>(storageKeys.ttsSettings, undefined))
  );

  useEffect(() => {
    writeStorage(storageKeys.ttsSettings, settings);
  }, [settings]);

  const voices = useMemo(() => ttsVoices, []);

  const setVoice = (voice: TtsVoiceId) => {
    setSettings((prev) => ({ ...prev, voice }));
  };

  const setSecondaryVoice = (voice: TtsVoiceId) => {
    setSettings((prev) => ({ ...prev, secondaryVoice: voice }));
  };

  return { settings, voices, setVoice, setSecondaryVoice };
}
