import React, { useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

import "../css/ResultsPage.css";
import "../css/JudgementDetails.css";

import hlogo from "../Assets/emblemLogo.png";

import GeneratePDF from "./GeneratePdf";

export default function JudgementDetails() {
  const location = useLocation();
  const { judgement } = location.state;
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);

  const [maxLines, setMaxLines] = useState(5);

  const [showACT, setShowACT] = useState(false);
  const [showHeadnote, setShowHeadnote] = useState(false);
  const [showJudgment, setShowJudgment] = useState(false);

  let [showFullHeadnote, setShowFullHeadnote] = useState(false);
  let [showFullJudgment, setShowFullJudgment] = useState(false);
  let [showFullAct, setShowFullAct] = useState(false);

  const toggleHeadnote = () => {
    setShowFullHeadnote(!showFullHeadnote);
  };
  const toggleJudgment = () => {
    setShowFullJudgment(!showFullJudgment);
  };

  const toggleAct = () => {
    setShowFullAct(!showFullAct);
  };

  const getSummary = (text) => {
    setShowSummary(true);
    setLoading(true);
    axios
      .post("http://127.0.0.1:5000/judgment-summary", {
        text: text,
      })
      .then((response) => {
        const text_summary = response.data;
        setSummary(text_summary);
        console.lof(summary);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const handleCheckboxChange = (component) => {
    switch (component) {
      case "ACT":
        setShowACT(!showACT);
        break;
      case "Headnote":
        setShowHeadnote(!showHeadnote);
        break;
      case "Judgment":
        setShowJudgment(!showJudgment);
        break;
      default:
        break;
    }
  };

  const splitTextIntoParagraphs = (text, maxSentencesPerParagraph) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g);
    if (!sentences) return [text];

    const paragraphs = [];
    for (let i = 0; i < sentences.length; i += maxSentencesPerParagraph) {
      const paragraph = sentences
        .slice(i, i + maxSentencesPerParagraph)
        .join(" ");
      paragraphs.push(paragraph);
    }

    return paragraphs;
  };

  return (
    <div className="results-container">
      <header className="header_result_page">
        <div>
          <Link to="/" className="logo-link">
            <img src={hlogo} alt="Emblem" className="result_page_head_logo" />
          </Link>
        </div>
        <div className="webName">Legal Cite</div>

        <nav className="nav_result">
          <Link to="/legalnews">Legal News</Link>
          <Link to="/">Judge Panel</Link>
          <Link to="/submit-petition">Citation Predictions</Link>
        </nav>
      </header>

      <div className="judgments-container">
        <div className={showSummary ? "showSummary" : "hideSummary"}>
          <div className="summary-block">
            <h2>Judgement Summary</h2>
            <div className="summary-content">
              {loading ? (
                <>
                  <p>Loading...</p>
                  <br />
                  <div class="loader_summary loader_block"></div>
                </>
              ) : (
                <p>{summary}</p>
              )}
            </div>
            <div className="close-btn-block">
              <button
                onClick={() => setShowSummary(false)}
                className="close-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {judgement && (
          <div>
            <div className="judgement-header-block">
              <h4 className="judgement-title">
                {judgement.PETITIONER} {judgement.RESPONDENT}
              </h4>
              <div className="controls-btn-block">
                <button onClick={() => GeneratePDF(judgement)}>
                  Download PDF
                </button>
                <button onClick={() => getSummary(judgement.JUDGMENT)}>
                  Judgement Summary
                </button>
              </div>
            </div>

            <div className="judgement-component-control">
              <div className="component-table-block">
                <table className="component-table">
                  <tbody>
                    <tr className="table-row">
                      <td className="table-col">
                        <input
                          type="checkbox"
                          checked={showACT}
                          onChange={() => handleCheckboxChange("ACT")}
                        />
                        <label>ACT</label>
                      </td>
                      <td className="table-col">
                        <input
                          type="checkbox"
                          checked={showHeadnote}
                          onChange={() => handleCheckboxChange("Headnote")}
                        />
                        <label>Headnote</label>
                      </td>
                      <td className="table-col">
                        <input
                          type="checkbox"
                          checked={showJudgment}
                          onChange={() => handleCheckboxChange("Judgment")}
                        />
                        <label>Judgement</label>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {(showACT || showHeadnote || showJudgment) && (
              <div className="judgement-component-content">
                {showACT && (
                  <div className="content-section">
                    <h4>ACT</h4>
                    <p>{judgement.ACT}</p>
                  </div>
                )}
                {showHeadnote && (
                  <div className="content-section">
                    <h4>Headnote</h4>
                    {splitTextIntoParagraphs(judgement.HEADNOTE, 10).map(
                      (para, index) => (
                        <p key={index}>{para}</p>
                      )
                    )}
                  </div>
                )}
                {showJudgment && (
                  <div className="content-section">
                    <h4>Judgement</h4>
                    {splitTextIntoParagraphs(judgement.JUDGMENT, 20).map(
                      (para, index) => (
                        <p key={index}>{para}</p>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            <p className="judgement_component">
              <strong>Date of Judgement : </strong>
              {judgement["DATE OF JUDGMENT"]}
            </p>

            <p className="judgement_component">
              <strong>Bench : </strong>
              {judgement.BENCH}
            </p>

            <p className="judgement_component">
              <strong>Citations : </strong>
              {judgement.CITATION}
            </p>

            <p
              className="judgement_component"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: showFullAct ? "none" : maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              <strong>ACT : </strong>
              <br />
              {judgement.ACT}
            </p>
            <button className="judgement-read-btn" onClick={toggleAct}>
              {showFullAct ? "Read less" : "Read more"}
            </button>

            <p
              className="judgement_component"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: showFullHeadnote ? "none" : maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              <strong>Headnote : </strong>
              <br />
              {judgement.HEADNOTE}
            </p>
            <button className="judgement-read-btn" onClick={toggleHeadnote}>
              {showFullHeadnote ? "Read less" : "Read more"}
            </button>

            <p
              className="judgement_component"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: showFullJudgment ? "none" : maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              <strong>Judgement : </strong>
              <br />
              {judgement.JUDGMENT}
            </p>
            <button className="judgement-read-btn" onClick={toggleJudgment}>
              {showFullJudgment ? "Read less" : "Read more"}
            </button>
          </div>
        )}
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
