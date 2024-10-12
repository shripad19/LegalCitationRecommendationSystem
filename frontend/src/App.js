// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LegalPage from './components/Home'; 
import SubmitPetition from './components/SubmitPetition';
import ResultsPage from './components/ResultsPage'; 
import LegalNews from './components/LegalNews';
import JudgementDetails from './components/JudgementDetails';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LegalPage />} />
        <Route path="/submit-petition" element={<SubmitPetition />} />
        <Route path="/ResultsPage" element={<ResultsPage />} />
        <Route path="/legalnews" element={<LegalNews />} />
        <Route path="/judgement-details" element={<JudgementDetails />} />
      </Routes>
    </Router>
  );
}