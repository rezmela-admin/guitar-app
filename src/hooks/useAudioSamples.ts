import { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { midiToNote } from '../types';

interface UseAudioSamplesProps {
  instrument?: string;
  volume?: number; // This is master volume for Tone.js, or per-note for sampler
  attackTime?: number;
  decayTime?: number;
  sustainLevel?: number;
  releaseTime?: number;
  reverbSendLevel?: number; // For sampler's reverb send, and Tone.Reverb wetness
  reverbOutputLevel?: number; // For sampler's reverb output gain
  // EQ settings
  lowGain?: number; // dB
  midGain?: number; // dB
  highGain?: number; // dB
  // Chorus settings
  chorusRate?: number; // Hz
  chorusDepth?: number; // 0-1
  chorusWet?: number; // 0-1
  // Filter settings
  filterCutoff?: number; // Hz
  filterResonance?: number; // Q
  filterType?: BiquadFilterType;
  // Stereo Widener settings
  stereoWidth?: number; // 0-1
}

export const useAudioSamples = (props?: UseAudioSamplesProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false); // General initialization state
  const [isToneInitialized, setIsToneInitialized] = useState(false); // Tone.js specific initialization
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sampler-specific refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const samplerReverbSendGainRef = useRef<GainNode | null>(null);
  const delay1Ref = useRef<DelayNode | null>(null);
  const feedback1GainRef = useRef<GainNode | null>(null);
  const delay2Ref = useRef<DelayNode | null>(null);
  const feedback2GainRef = useRef<GainNode | null>(null);
  const samplerReverbOutputGainRef = useRef<GainNode | null>(null);

  // Tone.js specific refs
  const toneMasterVolume = useRef<Tone.Volume | null>(null);
  const toneReverb = useRef<Tone.Reverb | null>(null);
  const toneEQ3 = useRef<Tone.EQ3 | null>(null);
  const toneChorus = useRef<Tone.Chorus | null>(null);
  const toneFilter = useRef<Tone.Filter | null>(null);
  const toneStereoWidener = useRef<Tone.StereoWidener | null>(null);
  const currentToneInstrument = useRef<any>(null);


  const initializeSampler = useCallback(async () => {
    console.log("initializeSampler called");
    try {
      const localAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = localAudioContext;

      samplerReverbSendGainRef.current = localAudioContext.createGain();
      delay1Ref.current = localAudioContext.createDelay();
      feedback1GainRef.current = localAudioContext.createGain();
      delay2Ref.current = localAudioContext.createDelay();
      feedback2GainRef.current = localAudioContext.createGain();
      samplerReverbOutputGainRef.current = localAudioContext.createGain();

      samplerReverbSendGainRef.current.gain.value = props?.reverbSendLevel ?? 0.4;
      if (delay1Ref.current) delay1Ref.current.delayTime.value = 0.025;
      if (feedback1GainRef.current) feedback1GainRef.current.gain.value = 0.65;
      if (delay2Ref.current) delay2Ref.current.delayTime.value = 0.045;
      if (feedback2GainRef.current) feedback2GainRef.current.gain.value = 0.55;
      samplerReverbOutputGainRef.current.gain.value = props?.reverbOutputLevel ?? 0.7;

      if (samplerReverbSendGainRef.current && delay1Ref.current && feedback1GainRef.current && delay2Ref.current && feedback2GainRef.current && samplerReverbOutputGainRef.current) {
        samplerReverbSendGainRef.current.connect(delay1Ref.current);
        delay1Ref.current.connect(feedback1GainRef.current);
        feedback1GainRef.current.connect(delay1Ref.current);
        delay1Ref.current.connect(samplerReverbOutputGainRef.current);
        samplerReverbSendGainRef.current.connect(delay2Ref.current);
        delay2Ref.current.connect(feedback2GainRef.current);
        feedback2GainRef.current.connect(delay2Ref.current);
        samplerReverbOutputGainRef.current.connect(localAudioContext.destination);
      }

      const samplesToLoad = [
        'E2', 'F2', 'Fs2', 'G2', 'Gs2', 'A2', 'As2', 'B2',
        'C3', 'Cs3', 'D3', 'Ds3', 'E3', 'F3', 'Fs3', 'G3', 'Gs3', 'A3', 'As3', 'B3',
        'C4', 'Cs4', 'D4', 'Ds4', 'E4', 'F4', 'Fs4', 'G4', 'Gs4', 'A4'
      ];
      const totalSamples = samplesToLoad.length;
      let loadedSamples = 0;

      for (const sample of samplesToLoad) {
        try {
          const encodedFileName = encodeURIComponent(`${sample}.mp3`);
          const url = `${process.env.PUBLIC_URL}/audio/samples/${encodedFileName}`;
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const arrayBuffer = await response.arrayBuffer();
          if (!localAudioContext) throw new Error("AudioContext not available for decoding");
          const audioBuffer = await localAudioContext.decodeAudioData(arrayBuffer);
          audioBuffersRef.current[sample] = audioBuffer;
          loadedSamples++;
          setLoadingProgress((loadedSamples / totalSamples) * 100);
        } catch (error) {
          console.error(`Error loading sample ${sample}:`, error);
          setErrorMessage(`Failed to load sample ${sample}.`);
        }
      }
      if (loadedSamples === totalSamples) {
        console.log("Sampler initialization complete");
      } else {
        throw new Error(`Only loaded ${loadedSamples}/${totalSamples} samples for sampler.`);
      }
    } catch (error) {
      console.error('Error initializing sampler:', error);
      setErrorMessage(`Failed to initialize sampler. ${error instanceof Error ? error.message : String(error)}`);
      // Do not set isLoading to false here if Tone.js might still be loading
    }
  }, [props?.reverbSendLevel, props?.reverbOutputLevel]);

  const initializeTone = useCallback(async () => {
    console.log("initializeTone called");
    if (isToneInitialized || Tone.context.state === 'running') {
      console.log("Tone.js already initialized or AudioContext running.");
      setIsToneInitialized(true); // Ensure state is true
      return;
    }
    try {
      await Tone.start();
      Tone.context.lookAhead = 0;
      toneMasterVolume.current = new Tone.Volume(props?.volume !== undefined ? Tone.gainToDb(props.volume) : -Infinity).toDestination();

      // Initialize Effects
      toneEQ3.current = new Tone.EQ3({
        low: props?.lowGain ?? 0,
        mid: props?.midGain ?? 0,
        high: props?.highGain ?? 0,
      });
      toneChorus.current = new Tone.Chorus({
        frequency: props?.chorusRate ?? 1.5,
        delayTime: 3.5, // Default, consider making prop if needed
        depth: props?.chorusDepth ?? 0.7,
        wet: props?.chorusWet ?? 0.0, // Default to dry initially
      });
      toneFilter.current = new Tone.Filter({
        type: props?.filterType ?? 'lowpass',
        frequency: props?.filterCutoff ?? 15000,
        Q: props?.filterResonance ?? 1,
      });
      toneStereoWidener.current = new Tone.StereoWidener({
        width: props?.stereoWidth ?? 0.0, // Default to mono initially
      });
      toneReverb.current = new Tone.Reverb({
        decay: 1.5, // Default decay
        preDelay: 0.01,
        wet: props?.reverbSendLevel ?? 0.0, // Default to dry initially
      });

      // Chain: EQ -> Chorus -> Filter -> StereoWidener -> Reverb -> MasterVolume
      // Instrument will be connected to toneEQ3.current when selected.
      toneEQ3.current.chain(
        toneChorus.current,
        toneFilter.current,
        toneStereoWidener.current,
        toneReverb.current,
        toneMasterVolume.current
      );

      setIsToneInitialized(true);
      console.log("Tone.js and effects initialized successfully.");
    } catch (error) {
      console.error("Error starting Tone.js AudioContext or initializing effects:", error);
      setErrorMessage("Error initializing Tone.js audio. Please try again.");
      setIsToneInitialized(false);
    }
  }, [isToneInitialized, props?.volume,
      props?.lowGain, props?.midGain, props?.highGain,
      props?.chorusRate, props?.chorusDepth, props?.chorusWet,
      props?.filterType, props?.filterCutoff, props?.filterResonance,
      props?.stereoWidth, props?.reverbSendLevel
  ]);

  const initializeAudio = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    if (props?.instrument === 'sampler') {
      await initializeSampler();
    } else if (props?.instrument && props.instrument !== 'sampler') {
      await initializeTone();
    } else {
      // Default or no instrument selected, perhaps initialize sampler or wait.
      // For now, let's assume sampler is the default if no specific instrument prop is passed.
      await initializeSampler();
    }
    setIsLoading(false);
    setIsInitialized(true); // General initialization flag
  }, [props?.instrument, initializeSampler, initializeTone]);


  // Effect to manage Tone.js instrument changes
  useEffect(() => {
    if (!isToneInitialized || !props?.instrument || props.instrument === 'sampler') {
      if (currentToneInstrument.current) {
        currentToneInstrument.current.disconnect(); // Disconnect from effects chain
        currentToneInstrument.current.dispose();
        currentToneInstrument.current = null;
      }
      return;
    }

    currentToneInstrument.current?.dispose(); // Dispose previous
    let newInstrument: any;

    // Define default envelope settings for synths that might need them
    const defaultEnvelope = {
        attack: props?.attackTime ?? 0.01,
        decay: props?.decayTime ?? 0.1,
        sustain: props?.sustainLevel ?? 0.5,
        release: props?.releaseTime ?? 1,
    };

    switch (props.instrument) {
      case 'FMSynth': newInstrument = new Tone.FMSynth({ envelope: defaultEnvelope }); break;
      case 'AMSynth': newInstrument = new Tone.AMSynth({ envelope: defaultEnvelope }); break;
      case 'MembraneSynth': newInstrument = new Tone.MembraneSynth({ envelope: defaultEnvelope }); break;
      case 'MetalSynth': newInstrument = new Tone.MetalSynth({ envelope: defaultEnvelope }); break;
      // NoiseSynth has a simpler envelope structure, apply if possible or use defaults
      case 'NoiseSynth': newInstrument = new Tone.NoiseSynth({ envelope: { attack: defaultEnvelope.attack, decay: defaultEnvelope.decay, sustain: defaultEnvelope.sustain } }); break;
      case 'PluckSynth': newInstrument = new Tone.PluckSynth({ release: defaultEnvelope.release }); break; // PluckSynth uses 'release' for its decay characteristic
      case 'Synth': default: newInstrument = new Tone.Synth({ envelope: defaultEnvelope }); break;
    }

    if (newInstrument && toneEQ3.current) {
      newInstrument.connect(toneEQ3.current); // Connect instrument to the start of the effects chain
      currentToneInstrument.current = newInstrument;
      console.log(`${props.instrument} created and connected to effects chain.`);
    }
  }, [props?.instrument, isToneInitialized, props?.attackTime, props?.decayTime, props?.sustainLevel, props?.releaseTime]);

  // Update Tone.js master volume
  useEffect(() => {
    if (toneMasterVolume.current && props?.volume !== undefined) {
      toneMasterVolume.current.volume.value = Tone.gainToDb(props.volume);
    }
  }, [props?.volume, isToneInitialized]);

  // Update Tone.js reverb settings (now only wetness, as it's part of the chain)
  useEffect(() => {
    if (toneReverb.current && props?.reverbSendLevel !== undefined) {
      toneReverb.current.wet.value = props.reverbSendLevel;
    }
  }, [props?.reverbSendLevel, isToneInitialized]);

  // Update EQ3 settings
  useEffect(() => {
    if (toneEQ3.current) {
      if (props?.lowGain !== undefined) toneEQ3.current.low.value = props.lowGain;
      if (props?.midGain !== undefined) toneEQ3.current.mid.value = props.midGain;
      if (props?.highGain !== undefined) toneEQ3.current.high.value = props.highGain;
    }
  }, [props?.lowGain, props?.midGain, props?.highGain, isToneInitialized]);

  // Update Chorus settings
  useEffect(() => {
    if (toneChorus.current) {
      if (props?.chorusRate !== undefined) toneChorus.current.frequency.value = props.chorusRate;
      if (props?.chorusDepth !== undefined) toneChorus.current.depth = props.chorusDepth;
      if (props?.chorusWet !== undefined) toneChorus.current.wet.value = props.chorusWet;
    }
  }, [props?.chorusRate, props?.chorusDepth, props?.chorusWet, isToneInitialized]);

  // Update Filter settings
  useEffect(() => {
    if (toneFilter.current) {
      if (props?.filterCutoff !== undefined) toneFilter.current.frequency.value = props.filterCutoff;
      if (props?.filterResonance !== undefined) toneFilter.current.Q.value = props.filterResonance;
      if (props?.filterType !== undefined) toneFilter.current.type = props.filterType;
    }
  }, [props?.filterCutoff, props?.filterResonance, props?.filterType, isToneInitialized]);

  // Update StereoWidener settings
  useEffect(() => {
    if (toneStereoWidener.current && props?.stereoWidth !== undefined) {
      toneStereoWidener.current.width.value = props.stereoWidth;
    }
  }, [props?.stereoWidth, isToneInitialized]);


	const playNote = useCallback((
	  midiNote: number, 
	  volume: number = 1, // Per-note volume for sampler, or master for Tone if not overridden
	  duration: number = 1000,
	  attackTimeParam?: number, // Optional, use prop if undefined
	  decayTimeParam?: number,
	  sustainLevelParam?: number,
	  releaseTimeParam?: number,
    reverbSendParam?: number,
    reverbOutputParam?: number // Currently less direct control for Tone.js reverb output via this
	) => {
    // Use parameters passed to playNote if available, otherwise fall back to props from hook state (global controls)
    const attack = attackTimeParam ?? props?.attackTime ?? 0.01;
    const decay = decayTimeParam ?? props?.decayTime ?? 0.1;
    const sustain = sustainLevelParam ?? props?.sustainLevel ?? 0.5;
    const release = releaseTimeParam ?? props?.releaseTime ?? 1;
    const currentReverbSend = reverbSendParam ?? props?.reverbSendLevel ?? 0.0; // Default to dry


    if (props?.instrument === 'sampler') {
      if (!audioContextRef.current || !isInitialized) { // General isInitialized should be enough for sampler
        console.warn('Sampler not initialized. Cannot play note.');
        return;
      }
      const noteName = midiToNote(midiNote);
      const sampleName = noteName.replace('#', 's');
      if (audioBuffersRef.current[sampleName]) {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffersRef.current[sampleName];
        const adsrGainNode = audioContextRef.current.createGain();
        const currentTime = audioContextRef.current.currentTime;
        const initialGain = 0.001;
        adsrGainNode.gain.setValueAtTime(initialGain, currentTime);
        adsrGainNode.gain.exponentialRampToValueAtTime(volume, currentTime + attack);
        adsrGainNode.gain.setTargetAtTime(volume * sustain, currentTime + attack, decay / 3); // decay is time constant here
        const noteDurationSec = Math.max(duration / 1000, release); // Ensure duration accommodates release
        const releaseStart = currentTime + noteDurationSec - release;
        adsrGainNode.gain.setTargetAtTime(initialGain, releaseStart, release / 3); // release is time constant
        source.connect(adsrGainNode);
        adsrGainNode.connect(audioContextRef.current.destination); // Dry signal to destination
        if (samplerReverbSendGainRef.current) {
          adsrGainNode.connect(samplerReverbSendGainRef.current); // Wet signal send
          samplerReverbSendGainRef.current.gain.setValueAtTime(currentReverbSend, currentTime);
        }
        // samplerReverbOutputGainRef is the return gain, set globally via props, not per note.

        source.playbackRate.setValueAtTime(1, currentTime); // No pitch adjustment for sampler
        source.start(currentTime);
        source.stop(currentTime + noteDurationSec);
      } else {
        console.warn(`No sample found for note: ${noteName} (MIDI: ${midiNote})`);
      }
    } else if (props?.instrument && props.instrument !== 'sampler') {
      if (!isToneInitialized || !currentToneInstrument.current || Tone.context.state !== 'running') {
        console.warn("Tone.js instrument not ready or AudioContext not running. Note playback aborted.");
        return;
      }
      const frequency = Tone.Frequency(midiNote, "midi").toFrequency();
      const durationSec = duration / 1000; // Tone.js uses seconds for duration

      // Apply ADSR envelope parameters for the current note
      // This overrides the default envelope settings applied when the instrument was created if the instrument has an envelope
      if (currentToneInstrument.current.envelope) {
        currentToneInstrument.current.envelope.attack = attack;
        currentToneInstrument.current.envelope.decay = decay;
        currentToneInstrument.current.envelope.sustain = sustain;
        currentToneInstrument.current.envelope.release = release;
      }

      // Apply per-note volume. Some Tone.js instruments might not have a top-level 'volume' property
      // or might handle volume as part of triggerAttack options.
      // This provides a general approach.
      if (typeof currentToneInstrument.current.volume !== 'undefined') {
        currentToneInstrument.current.volume.value = Tone.gainToDb(volume);
      }

      // Reverb wetness can be adjusted per note if desired, or controlled globally via props.
      // Here, we use currentReverbSend which can be per-note or from global props.
      if (toneReverb.current) {
        toneReverb.current.wet.value = currentReverbSend;
      }

      // Trigger the note
      if (typeof currentToneInstrument.current.triggerAttackRelease === 'function') {
        currentToneInstrument.current.triggerAttackRelease(frequency, durationSec, Tone.now());
      } else if (typeof currentToneInstrument.current.triggerAttack === 'function') {
        // For instruments like PluckSynth that don't have triggerAttackRelease or a duration parameter in triggerAttack
        currentToneInstrument.current.triggerAttack(frequency, Tone.now());
        // Manual release for such instruments is often handled by their natural decay or a separate triggerRelease call if needed.
        // For this generic setup, we rely on the instrument's defined release/decay characteristics.
      } else {
          console.warn(`Instrument ${props.instrument} does not have a recognized trigger method.`);
      }
    } else {
      console.warn("No instrument selected or instrument type unknown.");
    }
	}, [
    props, // Referencing the whole props object here as many are used.
          // Consider listing individual props if performance becomes an issue,
          // but for now, this ensures playNote is redefined if any relevant audio prop changes.
    isInitialized, isToneInitialized
  ]);

  useEffect(() => {
    return () => {
      // Dispose sampler resources
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().then(() => console.log('Sampler AudioContext closed.'));
      }
      // Dispose Tone.js resources
      currentToneInstrument.current?.dispose();
      toneEQ3.current?.dispose();
      toneChorus.current?.dispose();
      toneFilter.current?.dispose();
      toneStereoWidener.current?.dispose();
      toneReverb.current?.dispose();
      toneMasterVolume.current?.dispose();
      // Note: Do not close Tone.context globally here as it's managed by Tone.start()
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  return {
    isLoading,
    loadingProgress,
    playNote,
    initializeAudio,
    isInitialized,
    errorMessage
  };
};