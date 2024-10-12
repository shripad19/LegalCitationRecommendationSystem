import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../css/ResultsPage.css";
import hlogo from "../Assets/head logo.png";

export default function ResultsPage() {
  const location = useLocation();
  const { results } = location.state;
  const navigate = useNavigate();

  const handleJudgementDetails = (judgement) => {
    navigate("/judgement-details", { state: { judgement: judgement } });
  };

  return (
    <div className="results-container">
      <header className="header_result_page">
        <div>
          <Link to="/" className="logo-link">
            <img src={hlogo} alt="Emblem" className="result_page_head_logo" />
          </Link>
        </div>
        <div className="webName">Citations</div>

        <nav className="nav_result">
          <Link to="/legalnews">Legal News</Link>
          <Link to="/">Judge Panel</Link>
          <Link to="/submit-petition">Citation Predictions</Link>
        </nav>
      </header>

      <div className="citation-list-block">
        {results.map((judgement, index) => (
          <div className="citation-block" key={index}>
            <h4 className="citation-title">
              {judgement.PETITIONER}
              <br />
              <br />
              {judgement.RESPONDENT}
            </h4>
            <button onClick={() => handleJudgementDetails(judgement)}>
              Judgement Details
            </button>
          </div>
        ))}
      </div>

      <footer className="footer">
        <div className="footer-content">
          <img
            src="https://cdn.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2024/01/2024012288.svg"
            alt="Supreme Court Emblem"
            className="footer-logo"
          />
          <div className="footer-text">
            <h1>SUPREME COURT OF INDIA</h1>
            <p className="slogan">|| यतो धर्मस्ततो जयः ||</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&#169; Created by Epic Innovators &#169;</p>
          <p>Content sourced from the Supreme Court of India website.</p>
        </div>
      </footer>
    </div>
  );
}
