"use client";

import { useEffect, useState } from 'react';

export function useVoiceAssistance() {
  const [speaking, setSpeaking] = useState(false);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const speak = (text) => {
    if (!synth) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    setSpeaking(true);
    synth.speak(utterance);
    
    utterance.onend = () => setSpeaking(false);
  };

  const stop = () => {
    if (synth) {
      synth.cancel();
      setSpeaking(false);
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return { speak, stop, speaking };
}