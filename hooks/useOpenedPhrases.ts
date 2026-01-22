"use client";

import { useEffect, useState } from "react";
import { readStorage, storageKeys, writeStorage } from "@/lib/storage";

export function useOpenedPhrases() {
  const [opened, setOpened] = useState<string[]>(() =>
    readStorage<string[]>(storageKeys.openedPhrases, [])
  );

  useEffect(() => {
    writeStorage(storageKeys.openedPhrases, opened);
  }, [opened]);

  const markOpened = (id: string) => {
    setOpened((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return { opened, markOpened };
}
