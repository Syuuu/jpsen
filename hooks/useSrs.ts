"use client";

import { useEffect, useMemo, useState } from "react";
import { storageKeys, readStorage, writeStorage } from "@/lib/storage";
import { ensureSrsMap, SrsMap, updateSrsEntry, EaseLevel } from "@/lib/srs";
import { phrases } from "@/data/phrases";

export function useSrs() {
  const [srsMap, setSrsMap] = useState<SrsMap>({});

  useEffect(() => {
    const initial = ensureSrsMap(readStorage<SrsMap>(storageKeys.srs, {}));
    setSrsMap(initial);
  }, []);

  useEffect(() => {
    if (Object.keys(srsMap).length === 0) return;
    writeStorage(storageKeys.srs, srsMap);
  }, [srsMap]);

  const dueToday = useMemo(() => {
    const now = Date.now();
    return phrases.filter((phrase) => srsMap[phrase.id]?.dueAt <= now);
  }, [srsMap]);

  const setEase = (id: string, ease: EaseLevel) => {
    setSrsMap((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: updateSrsEntry(current, ease)
      };
    });
  };

  return { srsMap, dueToday, setEase };
}
