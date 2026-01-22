export const ttsVoices = [
  { id: "alloy", label: "Alloy", gender: "neutral" },
  { id: "ash", label: "Ash", gender: "male" },
  { id: "coral", label: "Coral", gender: "female" },
  { id: "echo", label: "Echo", gender: "male" },
  { id: "fable", label: "Fable", gender: "female" },
  { id: "onyx", label: "Onyx", gender: "male" },
  { id: "nova", label: "Nova", gender: "female" },
  { id: "sage", label: "Sage", gender: "male" },
  { id: "shimmer", label: "Shimmer", gender: "female" }
] as const;

export type TtsVoiceId = (typeof ttsVoices)[number]["id"];
export type TtsVoiceGender = (typeof ttsVoices)[number]["gender"];

export const defaultTtsVoice: TtsVoiceId = "alloy";
export const secondaryTtsVoice: TtsVoiceId = "nova";

const voiceMap = new Map<TtsVoiceId, (typeof ttsVoices)[number]>(
  ttsVoices.map((voice) => [voice.id, voice])
);

export const openAiVoices = new Set(ttsVoices.map((voice) => voice.id));

export function isTtsVoice(value?: string | null): value is TtsVoiceId {
  if (!value) return false;
  return voiceMap.has(value as TtsVoiceId);
}

export function normalizeTtsVoice(
  value: string | null | undefined,
  fallback: TtsVoiceId = defaultTtsVoice
): TtsVoiceId {
  return isTtsVoice(value) ? value : fallback;
}

export function prefersFemaleVoice(value?: string | null) {
  const gender = value ? voiceMap.get(value as TtsVoiceId)?.gender : undefined;
  return gender === "female";
}
