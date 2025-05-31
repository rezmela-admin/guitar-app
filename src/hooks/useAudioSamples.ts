import { useState, useCallback, useRef, useEffect } from 'react';
import { midiToNote } from '../types';

export const useAudioSamples = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});

  const initializeAudio = useCallback(async () => {
    console.log("initializeAudio called");
    try {
      console.log("Creating AudioContext");
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      setIsInitialized(true);
      console.log("AudioContext created successfully");

      const samples = [
        'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
        'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
        'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4'
      ];

      const totalSamples = samples.length;
      let loadedSamples = 0;

      for (const sample of samples) {
        try {
          // Encode the entire filename to handle special characters
          const encodedFileName = encodeURIComponent(`${sample}.mp3`);
          const url = `${process.env.PUBLIC_URL}/audio/samples/${encodedFileName}`;
          console.log(`Fetching sample: ${url}`);
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          console.log(`Decoding audio data for ${sample}`);
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          audioBuffersRef.current[sample] = audioBuffer;
          
          loadedSamples++;
          setLoadingProgress((loadedSamples / totalSamples) * 100);
          console.log(`Loaded ${loadedSamples}/${totalSamples} samples`);
        } catch (error) {
          console.error(`Error loading sample ${sample}:`, error);
          setErrorMessage(`Failed to load sample ${sample}. Please check the file exists and try again.`);
        }
      }

      if (loadedSamples === totalSamples) {
        setIsLoading(false);
        console.log("Audio initialization complete");
      } else {
        throw new Error(`Only loaded ${loadedSamples}/${totalSamples} samples`);
      }
    } catch (error) {
      console.error('Error initializing audio:', error);
      setErrorMessage(`Failed to initialize audio. Please try again.`);
      setIsLoading(false);
    }
  }, []);

	const playNote = useCallback((
	  midiNote: number, 
	  volume: number = 1, 
	  duration: number = 1000,
	  attackTime: number = 0.005,
	  decayTime: number = 0.2,
	  sustainLevel: number = 0.9,
	  releaseTime: number = 0.5
	) => {
	  if (!audioContextRef.current) {
		console.warn('Audio context not initialized. Cannot play note.');
		return;
	  }
	  
	  const noteName = midiToNote(midiNote);
	  console.log(`Playing note: ${noteName} (MIDI: ${midiNote}) at volume ${volume} for ${duration}ms`);
	  
	  // Directly use the correct sample
	  const sampleName = noteName;
	  
	  if (audioBuffersRef.current[sampleName]) {
		const source = audioContextRef.current.createBufferSource();
		source.buffer = audioBuffersRef.current[sampleName];
		
		const gainNode = audioContextRef.current.createGain();
		const currentTime = audioContextRef.current.currentTime;
		
		// Envelope setup
		const initialGain = 0.001;
		gainNode.gain.setValueAtTime(initialGain, currentTime);
		gainNode.gain.exponentialRampToValueAtTime(volume, currentTime + attackTime);
		gainNode.gain.setTargetAtTime(volume * sustainLevel, currentTime + attackTime, decayTime / 3);
		const noteDuration = Math.max(duration / 1000, releaseTime);
		const releaseStart = currentTime + noteDuration - releaseTime;
		gainNode.gain.setTargetAtTime(initialGain, releaseStart, releaseTime / 3);
		
		source.connect(gainNode);
		gainNode.connect(audioContextRef.current.destination);
		
		// No pitch adjustment needed as we're using the exact sample
		source.playbackRate.setValueAtTime(1, currentTime);
		
		source.start(currentTime);
		source.stop(currentTime + noteDuration);
		
		console.log(`Playing exact sample: ${sampleName}`);
		console.log(`Scheduled note to stop after ${noteDuration * 1000}ms`);
	  } else {
		console.warn(`No sample found for note: ${noteName} (MIDI: ${midiNote})`);
	  }
	}, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        console.log('Audio context closed.');
      }
    };
  }, []);

  return {
    isLoading,
    loadingProgress,
    playNote,
    initializeAudio,
    isInitialized,
    errorMessage
  };
};