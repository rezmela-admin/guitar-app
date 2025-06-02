import { useState, useCallback, useRef, useEffect } from 'react';
import { midiToNote } from '../types';

export const useAudioSamples = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const reverbSendGainRef = useRef<GainNode | null>(null);
  const delay1Ref = useRef<DelayNode | null>(null);
  const feedback1GainRef = useRef<GainNode | null>(null);
  const delay2Ref = useRef<DelayNode | null>(null);
  const feedback2GainRef = useRef<GainNode | null>(null);
  const reverbOutputGainRef = useRef<GainNode | null>(null);

  const initializeAudio = useCallback(async () => {
    console.log("initializeAudio called");
    try {
      const localAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = localAudioContext;
      setIsInitialized(true);
      console.log("AudioContext created successfully");

      // Create and configure reverb nodes
      reverbSendGainRef.current = localAudioContext.createGain();
      delay1Ref.current = localAudioContext.createDelay();
      feedback1GainRef.current = localAudioContext.createGain();
      delay2Ref.current = localAudioContext.createDelay();
      feedback2GainRef.current = localAudioContext.createGain();
      reverbOutputGainRef.current = localAudioContext.createGain();

      reverbSendGainRef.current.gain.value = 0.4;
      if (delay1Ref.current) delay1Ref.current.delayTime.value = 0.025; // 25ms
      if (feedback1GainRef.current) feedback1GainRef.current.gain.value = 0.65;
      if (delay2Ref.current) delay2Ref.current.delayTime.value = 0.045; // 45ms
      if (feedback2GainRef.current) feedback2GainRef.current.gain.value = 0.55;
      reverbOutputGainRef.current.gain.value = 0.7;

      // Connect reverb nodes
      if (reverbSendGainRef.current && delay1Ref.current && feedback1GainRef.current && delay2Ref.current && feedback2GainRef.current && reverbOutputGainRef.current) {
        reverbSendGainRef.current.connect(delay1Ref.current);
        delay1Ref.current.connect(feedback1GainRef.current);
        feedback1GainRef.current.connect(delay1Ref.current); // Feedback loop 1
        delay1Ref.current.connect(reverbOutputGainRef.current);

        reverbSendGainRef.current.connect(delay2Ref.current);
        delay2Ref.current.connect(feedback2GainRef.current);
        feedback2GainRef.current.connect(delay2Ref.current); // Feedback loop 2
        delay2Ref.current.connect(reverbOutputGainRef.current);

        reverbOutputGainRef.current.connect(localAudioContext.destination);
      }


      const samples = [
        'E2', 'F2', 'Fs2', 'G2', 'Gs2', 'A2', 'As2', 'B2',
        'C3', 'Cs3', 'D3', 'Ds3', 'E3', 'F3', 'Fs3', 'G3', 'Gs3', 'A3', 'As3', 'B3',
        'C4', 'Cs4', 'D4', 'Ds4', 'E4', 'F4', 'Fs4', 'G4', 'Gs4', 'A4'
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
          if (!localAudioContext) throw new Error("AudioContext not available for decoding");
          const audioBuffer = await localAudioContext.decodeAudioData(arrayBuffer);
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
	  
	  // Directly use the correct sample, replacing # with s for filename matching
	  const sampleName = noteName.replace('#', 's');
	  
	  if (audioBuffersRef.current[sampleName]) {
		const source = audioContextRef.current.createBufferSource();
		source.buffer = audioBuffersRef.current[sampleName];
		
		const adsrGainNode = audioContextRef.current.createGain(); // Renamed from gainNode
		const currentTime = audioContextRef.current.currentTime;
		
		// Envelope setup
		const initialGain = 0.001;
		adsrGainNode.gain.setValueAtTime(initialGain, currentTime);
		adsrGainNode.gain.exponentialRampToValueAtTime(volume, currentTime + attackTime);
		adsrGainNode.gain.setTargetAtTime(volume * sustainLevel, currentTime + attackTime, decayTime / 3);
		const noteDuration = Math.max(duration / 1000, releaseTime);
		const releaseStart = currentTime + noteDuration - releaseTime;
		adsrGainNode.gain.setTargetAtTime(initialGain, releaseStart, releaseTime / 3);
		
		source.connect(adsrGainNode);
		adsrGainNode.connect(audioContextRef.current.destination); // Dry signal
		if (reverbSendGainRef.current) {
		  adsrGainNode.connect(reverbSendGainRef.current); // Wet signal send
		}
		
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