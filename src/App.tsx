import React from 'react';
import GuitarChordDiagram from './GuitarChordDiagram';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Guitar Chord Diagram</h1>
      <GuitarChordDiagram />
    </div>
  );
};

export default App;