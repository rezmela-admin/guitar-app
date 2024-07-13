import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GuitarChordApp from './GuitarChordApp';
import './App.css';

const Home: React.FC = () => (
  <div className="App">
    <h1>Practice Essential Guitar Chords</h1>
    <GuitarChordApp />
  </div>
);

const NotFound: React.FC = () => (
  <div className="App">
    <h1>404 - Not Found</h1>
  </div>
);

const App: React.FC = () => {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;