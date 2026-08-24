export function appendLetter(message: string, letter: string) {
  return `${message}${letter}`;
}

export function appendSpace(message: string) {
  return message.endsWith(" ") ? message : `${message} `;
}

export function deleteLastCharacter(message: string) {
  return message.slice(0, -1);
}

export function stableLetter(previous: string | null, next: string, confidence: number, threshold = 0.8) {
  if (confidence < threshold) return null;
  if (previous === next) return null;
  return next;
}
