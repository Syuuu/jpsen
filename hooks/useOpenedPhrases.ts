"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, storageKeys, writeStorage } from "@/lib/storage";

export function useOpenedPhrases() {
  const [opened, setOpened] = useState<string[]>([]);

  useEffect(() => {
    setOpened(readStorage<string[]>(storageKeys.opened, []));
  }, []);

  useEffect(() => {
    writeStorage(storageKeys.opened, opened);
  }, [opened]);

  const markOpened = useCallback((id: string) => {
    setOpened((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  return { opened, markOpened };
}
