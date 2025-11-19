import type { TransitionConfig } from 'svelte/transition';
const CHARS = '!@#$%&*1234567890-=_+[]{}|;:,.<>/?';

const getRandomCharacter = () => {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
};

export const scrambleText = (
  node: HTMLElement,
  options: Partial<TransitionConfig> = {}
): TransitionConfig => {
  const { duration = 1500 } = options;
  const finalText = node.textContent ?? '';
  const length = finalText.length;

  return {
    duration,
    tick: (t: number) => {
      let output = '';
      for (let i = 0; i < length; i++) {
        if (t > i / length) {
          output += finalText[i];
        } else {
          output += getRandomCharacter();
        }
      }
      node.textContent = output;
    }
  };
};
