import { useState, useRef, useCallback, useEffect } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

// ── Pick the most natural available voice ─────────────────────────────────────
function getBestVoice() {
  const voices = synth.getVoices();
  const preferred = [
    "Google UK English Male",
    "Google US English",
    "Microsoft Guy Online (Natural) - English (United States)",
    "Microsoft Davis Online (Natural) - English (United States)",
    "Microsoft James Online (Natural) - English (United Kingdom)",
    "Microsoft Ryan Online (Natural) - English (United Kingdom)",
    "Daniel (Enhanced)",
    "Daniel",
    "Alex",
    "Google UK English Female",
    "Google US English Female",
  ];
  for (const name of preferred) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }
  return voices.find(v => v.lang?.startsWith("en")) || voices[0] || null;
}

// ── Clean text for natural speech ─────────────────────────────────────────────
function naturalise(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/\bAPI\b/g, "A P I")
    .replace(/\bSQL\b/g, "S Q L")
    .replace(/\bCSS\b/g, "C S S")
    .replace(/\bHTML\b/g, "H T M L")
    .replace(/\bJWT\b/g, "J W T")
    .replace(/\bO\(n\)\b/gi, "O of n")
    .replace(/\bO\(log n\)\b/gi, "O of log n")
    .replace(/\bO\(n²\)\b/gi, "O of n squared")
    .replace(/\bO\(1\)\b/gi, "O of 1")
    .replace(/\bvs\.\b/gi, "versus")
    .replace(/&/g, " and ")
    .replace(/e\.g\./gi, "for example,")
    .replace(/i\.e\./gi, "that is,")
    .replace(/etc\./gi, "and so on")
    .replace(/[_\-–—]/g, " ")
    .replace(/[^\w\s.,!?;:'"()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Split into speakable chunks ────────────────────────────────────────────────
function splitIntoChunks(text, maxLen = 160) {
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  const chunks = [];
  let current  = "";
  for (const s of sentences) {
    if ((current + s).length > maxLen && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += " " + s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

export function useVoiceInterview() {
  const [isSupported, setIsSupported] = useState(false);
  const [voiceMode, setVoiceMode]     = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript]   = useState("");
  const [interimText, setInterimText] = useState("");
  const [voiceError, setVoiceError]   = useState("");
  const [aiThinking, setAiThinking]   = useState(false);

  const recognitionRef = useRef(null);
  const voiceRef       = useRef(null);
  const chunkQueue     = useRef([]);
  const cancelledRef   = useRef(false);

  // ── Load voices ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (SpeechRecognition && synth) {
      setIsSupported(true);
      const load = () => { voiceRef.current = getBestVoice(); };
      if (synth.getVoices().length > 0) {
        load();
      } else {
        synth.addEventListener("voiceschanged", load);
      }
    }
  }, []);

  // ── Speak one chunk ────────────────────────────────────────────────────────
  const speakChunk = useCallback((text, onEnd) => {
    if (!synth || !text.trim() || cancelledRef.current) {
      onEnd?.();
      return;
    }
    const utt    = new SpeechSynthesisUtterance(text);
    utt.voice    = voiceRef.current;
    utt.rate     = 1.10;
    utt.pitch    = 1.0;
    utt.volume   = 1.0;
    utt.onstart  = () => { if (!cancelledRef.current) setIsSpeaking(true); };
    utt.onend    = () => { onEnd?.(); };
    utt.onerror  = (e) => {
      if (e.error !== "interrupted") console.warn("TTS error:", e.error);
      onEnd?.();
    };
    synth.speak(utt);
  }, []);

  // ── Speak full text ────────────────────────────────────────────────────────
  const speak = useCallback((text, onDone) => {
    if (!synth || !text) {
      onDone?.();
      return;
    }

    synth.cancel();
    cancelledRef.current = false;
    setIsSpeaking(false);

    const clean  = naturalise(text);
    if (!clean) { onDone?.(); return; }

    const chunks = splitIntoChunks(clean, 160);
    chunkQueue.current = [...chunks];

    const speakNext = () => {
      if (cancelledRef.current || chunkQueue.current.length === 0) {
        if (!cancelledRef.current) {
          setIsSpeaking(false);
          onDone?.();
        }
        return;
      }
      const chunk = chunkQueue.current.shift();
      speakChunk(chunk, speakNext);
    };

    // Small delay so browser is ready
    setTimeout(speakNext, 100);
  }, [speakChunk]);

  const stopSpeaking = useCallback(() => {
    cancelledRef.current = true;
    chunkQueue.current   = [];
    synth?.cancel();
    setIsSpeaking(false);
  }, []);

  // ── Microphone ─────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setVoiceError("Speech recognition not supported. Use Chrome or Edge.");
      return;
    }
    setVoiceError("");
    setTranscript("");
    setInterimText("");

    try {
      const rec          = new SpeechRecognition();
      rec.continuous     = true;
      rec.interimResults = true;
      rec.lang           = "en-IN";
      recognitionRef.current = rec;

      let finalText = "";

      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            finalText += e.results[i][0].transcript + " ";
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        setTranscript(finalText);
        setInterimText(interim);
      };

      rec.onerror = (e) => {
        if (e.error === "no-speech") return;
        if (e.error === "not-allowed") {
          setVoiceError("Microphone access denied. Please allow microphone in browser settings.");
        } else {
          setVoiceError(`Microphone error: ${e.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        setInterimText("");
      };

      rec.start();
      setIsListening(true);
    } catch (err) {
      setVoiceError("Could not start microphone: " + err.message);
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText("");
  }, []);

  // ── Ask AI — routes through backend to avoid CORS ─────────────────────────
  const askAI = useCallback(async (userQuestion, sessionContext) => {
    if (!userQuestion.trim()) return;
    setAiThinking(true);
    stopSpeaking();

    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/voice/ask`,
        {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ userQuestion, sessionContext }),
        }
      );

      const data  = await res.json();
      const reply = data.reply || "That is a great question. Let me think about how to help you.";
      speak(reply);
    } catch (err) {
      console.error("askAI error:", err);
      speak("Sorry, I could not connect. Please try again.");
    } finally {
      setAiThinking(false);
    }
  }, [speak, stopSpeaking]);

  // ── Utils ──────────────────────────────────────────────────────────────────
  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimText("");
  }, []);

  const toggleVoiceMode = useCallback(() => {
    setVoiceMode(prev => {
      if (prev) {
        stopSpeaking();
        recognitionRef.current?.stop();
        setIsListening(false);
        setTranscript("");
        setInterimText("");
        setVoiceError("");
      }
      return !prev;
    });
  }, [stopSpeaking]);

  return {
    isSupported, voiceMode, toggleVoiceMode,
    isSpeaking, isListening, transcript, interimText,
    voiceError, aiThinking,
    speak, stopSpeaking,
    startListening, stopListening,
    askAI, clearTranscript, setTranscript,
  };
}