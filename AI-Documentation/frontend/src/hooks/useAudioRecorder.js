import { useState, useRef, useEffect } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioLevels, setAudioLevels] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [transcriptText, setTranscriptText] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const recognitionRef = useRef(null);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const startRecording = async (patient) => {
    if (!patient) return;
    try {
      setTranscriptText(""); // Reset transcript
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.start();

      // Initialize HTML5 Web Speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN"; // English (India) / Hinglish text support
        
        recognition.onresult = (event) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript + ". ";
            }
          }
          if (currentTranscript) {
            setTranscriptText(prev => prev + currentTranscript);
          }
        };

        recognition.onerror = (e) => {
          console.warn("Speech recognition error:", e.error);
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      // Web Audio API setup for real-time frequency analysis
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 32; // 16 frequency bins, perfect for 8 bars representation
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;

      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Animation loop to capture and set frequency levels
      const updateAnalyser = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Select first 8 bins (voices range mostly fits here)
        const levels = [];
        for (let i = 0; i < 8; i++) {
          const rawValue = dataArray[i] || 0;
          levels.push(rawValue / 255);
        }
        setAudioLevels(levels);
        animationFrameIdRef.current = requestAnimationFrame(updateAnalyser);
      };

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      updateAnalyser();
    } catch (err) {
      console.error(err);
      alert("Microphone access denied");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state === "running") {
        audioContextRef.current.suspend();
      }
      setAudioLevels([0, 0, 0, 0, 0, 0, 0, 0]);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      const updateAnalyser = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const levels = [];
        for (let i = 0; i < 8; i++) {
          const rawValue = dataArray[i] || 0;
          levels.push(rawValue / 255);
        }
        setAudioLevels(levels);
        animationFrameIdRef.current = requestAnimationFrame(updateAnalyser);
      };

      updateAnalyser();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setIsRecording(false);
        setIsPaused(false);
      };
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Clean up Web Audio API resources
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    setAudioLevels([0, 0, 0, 0, 0, 0, 0, 0]);
  };

  return {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioLevels,
    transcriptText,
    setTranscriptText,
    setAudioBlob,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    formatTime
  };
}
