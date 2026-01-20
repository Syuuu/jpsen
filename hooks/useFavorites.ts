"use client";

import { useEffect, useState } from "react";
import { readStorage, storageKeys, writeStorage } from "@/lib/storage";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readStorage<string[]>(storageKeys.favorites, []));
  }, []);

  useEffect(() => {
    writeStorage(storageKeys.favorites, favorites);
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return { favorites, toggleFavorite };
}
