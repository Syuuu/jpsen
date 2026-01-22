export const ttsVoiceOptions = [
  "alloy",
  "ash",
  "coral",
  "echo",
  "fable",
  "onyx",
  "nova",
  "sage",
  "shimmer"
];

const femaleVoiceRegex = /female|woman|girl|女|女性|ガール/i;
const femaleOpenAiVoices = new Set(["alloy", "coral", "fable", "nova", "sage", "shimmer"]);

export function isPreferFemaleVoice(voice: string) {
  if (voice.startsWith("female")) return true;
  if (voice.startsWith("male")) return false;
  return femaleOpenAiVoices.has(voice);
}

export function pickJapaneseVoice(voices: SpeechSynthesisVoice[], preferFemale: boolean) {
  const japaneseVoices = voices.filter((voice) => voice.lang.startsWith("ja"));
  if (preferFemale) {
    const femaleVoice = japaneseVoices.find((voice) => femaleVoiceRegex.test(voice.name));
    if (femaleVoice) return femaleVoice;
  }
  return japaneseVoices[0] ?? null;
}

export function waitForVoices(synth: SpeechSynthesis) {
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const voices = synth.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const handle = () => {
      resolve(synth.getVoices());
      synth.onvoiceschanged = null;
    };
    synth.onvoiceschanged = handle;
  });
}

export function pickAlternateVoice(voice: string) {
  const index = ttsVoiceOptions.indexOf(voice);
  if (index === -1) return ttsVoiceOptions[0];
  return ttsVoiceOptions[(index + 1) % ttsVoiceOptions.length];
}
