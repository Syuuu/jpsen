"use client";

import { useEffect, useMemo, useState } from "react";
import { readStorage, storageKeys, writeStorage } from "@/lib/storage";
import { ttsVoiceOptions } from "@/lib/tts";

export function useTtsVoice() {
  const [voice, setVoice] = useState(ttsVoiceOptions[0]);

  useEffect(() => {
    const stored = readStorage<string | null>(storageKeys.ttsVoice, null);
    if (stored) {
      setVoice(stored);
    }
  }, []);

  useEffect(() => {
    writeStorage(storageKeys.ttsVoice, voice);
  }, [voice]);

  const options = useMemo(() => ttsVoiceOptions, []);

  return { voice, setVoice, options };
}
