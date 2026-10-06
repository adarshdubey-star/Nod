export function isSpeechRecognitionSupported(): boolean {
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

export function isFullscreenSupported(): boolean {
  return !!document.documentElement.requestFullscreen;
}
