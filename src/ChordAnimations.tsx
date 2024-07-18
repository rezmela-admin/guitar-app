import React from 'react';
import { ChordDataItem } from './types';

interface AnimationLayerProps {
  chordData: ChordDataItem[];
  animations: JSX.Element[];
}

export const AnimationLayer: React.FC<AnimationLayerProps> = ({ animations }) => {
  return (
    <g id="animation-layer">
      {animations}
    </g>
  );
};

export const triggerNoteAnimation = (
  midiNote: number, 
  stringNumber: number, 
  fretPosition: number, 
  isUpstroke: boolean,
  setAnimations: React.Dispatch<React.SetStateAction<JSX.Element[]>>
) => {
  const animationId = `note-animation-${Date.now()}-${midiNote}`;
  const x = fretPosition === 0 ? 10 : 20 + fretPosition * 100 - 50;
  const y = 40 + (stringNumber - 1) * 30;

  const newAnimation = (
    <g key={animationId}>
      <circle
        cx={x}
        cy={y}
        r="12"
        fill="none"
        stroke={isUpstroke ? "#00ff00" : "#ff0000"}
        strokeWidth="2"
      >
        <animate
          attributeName="r"
          from="12"
          to="24"
          dur="0.2s"
          fill="freeze"
        />
        <animate
          attributeName="opacity"
          from="1"
          to="0"
          dur="0.2s"
          fill="freeze"
        />
      </circle>
      <line
        x1={x}
        y1={y}
        x2={x + (isUpstroke ? -20 : 20)}
        y2={y + (isUpstroke ? -20 : 20)}
        stroke={isUpstroke ? "#00ff00" : "#ff0000"}
        strokeWidth="2"
      >
        <animate
          attributeName="opacity"
          from="1"
          to="0"
          dur="0.2s"
          fill="freeze"
        />
      </line>
    </g>
  );
  
  setAnimations(prev => [...prev, newAnimation]);
  
  setTimeout(() => {
    setAnimations(prev => prev.filter(anim => anim.key !== animationId));
  }, 200);
};

export const resetAnimations = (setAnimations: React.Dispatch<React.SetStateAction<JSX.Element[]>>) => {
  setAnimations([]);
};

export const animationStyles = `
  @keyframes expandAndFade {
    0% { r: 12; opacity: 1; }
    50% { r: 32; opacity: 1; }
    100% { r: 32; opacity: 0; }
  }
  
  #animation-layer circle {
    animation: expandAndFade 1.5s ease-out;
  }
`;