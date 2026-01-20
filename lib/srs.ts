import { phrases } from "@/data/phrases";

export type EaseLevel = 1 | 2 | 3;

export type SrsEntry = {
  ease: EaseLevel;
  dueAt: number;
  lastReviewedAt?: number;
  lapses: number;
};

export type SrsMap = Record<string, SrsEntry>;

export const defaultEntry = (): SrsEntry => ({
  ease: 1,
  dueAt: Date.now(),
  lapses: 0
});

export const ensureSrsMap = (map: SrsMap): SrsMap => {
  const next = { ...map };
  for (const phrase of phrases) {
    if (!next[phrase.id]) {
      next[phrase.id] = defaultEntry();
    }
  }
  return next;
};

export const getDuePhrases = (map: SrsMap, now = Date.now()) => {
  return phrases
    .filter((phrase) => map[phrase.id]?.dueAt <= now)
    .sort((a, b) => (map[a.id]?.dueAt ?? 0) - (map[b.id]?.dueAt ?? 0));
};

export const nextDueAt = (ease: EaseLevel, previousEase: EaseLevel) => {
  const now = Date.now();
  if (ease === 1) {
    return now + 1000 * 60 * 60 * 24;
  }
  if (ease === 2) {
    return now + 1000 * 60 * 60 * 24 * 3;
  }
  if (ease === 3 && previousEase === 3) {
    return now + 1000 * 60 * 60 * 24 * 14;
  }
  return now + 1000 * 60 * 60 * 24 * 7;
};

export const updateSrsEntry = (entry: SrsEntry, ease: EaseLevel): SrsEntry => {
  return {
    ease,
    dueAt: nextDueAt(ease, entry.ease),
    lastReviewedAt: Date.now(),
    lapses: ease === 1 ? entry.lapses + 1 : entry.lapses
  };
};
