import { phrases } from "@/data/phrases";

export const getPhraseById = (id: string) =>
  phrases.find((phrase) => phrase.id === id);

export const searchPhrases = (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return phrases;
  return phrases.filter(
    (phrase) =>
      phrase.jp.toLowerCase().includes(q) || phrase.cn.toLowerCase().includes(q)
  );
};
