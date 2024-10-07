// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LegalPage from './components/Home'; 
import CitationsPage from './components/CitationsPage';
import ResultsPage from './components/ResultsPage'; 
import LegalNews from './components/LegalNews';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LegalPage />} />
        <Route path="/CitationsPage" element={<CitationsPage />} />
        <Route path="/ResultsPage" element={<ResultsPage />} />
        <Route path="/legalnews" element={<LegalNews />} />
      </Routes>
    </Router>
  );
}