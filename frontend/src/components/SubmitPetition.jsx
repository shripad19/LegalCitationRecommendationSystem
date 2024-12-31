import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import "../css/SubmitPetition.css";

export default function SubmitPetition() {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [citationInput, setCitationInput] = useState("");
  const [citationCount,setCitationCount] = useState(null);
  const [file, setFile] = useState(null);
  const [fileAttached, setFileAttached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  let messageInterval;

  const handleInputClick = () => {
    console.log("Input button clicked");
    setIsInputVisible(true);
  };

  const handleInputChange = (event) => {
    console.log("Citation input changed:", event.target.value);
    setCitationInput(event.target.value);
  };

  const handleCitationCount = (event) => {
    console.log("Citation count changed:", event.target.value);
    setCitationCount(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
      setFile(file);
      setFileAttached(true);
    } else {
      console.log("No file selected");
      setFile(null);
      setFileAttached(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    activeLoader();
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("citationCount",citationCount);
      try {
        const response = await fetch("http://localhost:5000/process-pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }

        const data = await response.json();
        navigate("/ResultsPage", { state: { results: data } });
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("No file selected for upload");
      setIsLoading(false);
    }
  };

  const messages = [
    "Analyzing the document...",
    "Extracting key insights...",
    "Summarizing important points...",
    "Please wait, processing in progress...",
    "Optimizing the document for readability...",
  ];
  let currentMessageIndex = 0;

  const rotateMessages = () => {
    const messageBlock = document.getElementById("loading_message");
    if (messageBlock) {
      messageBlock.classList.remove("message_active");
      setTimeout(() => {
        messageBlock.innerHTML = messages[currentMessageIndex];
        messageBlock.classList.add("message_active");
        currentMessageIndex = (currentMessageIndex + 1) % messages.length;
      }, 200);
    }
  };

  const activeLoader = () => {
    const loader = document.getElementById("loader_div");
    loader.classList.add("loader_active");
    rotateMessages();
  };

  useEffect(() => {
    if (isLoading) {
      messageInterval = setInterval(rotateMessages, 5000);
    }

    return () => {
      clearInterval(messageInterval);
      setIsLoading(false);
    };
  }, [isLoading]);

  return (
    <div className="citations-container">
      <header className="header_submit_file">
        <Link to="/" className="logo-link">
          <img
            src="https://pbs.twimg.com/media/EjVuypHXcAExU3E.jpg:large"
            alt="Logo"
            className="Logo"
          />
        </Link>
        <nav className="nav2_submit_file">
          <Link to="/legalnews">Legal News</Link>
          <Link to="/">Judge Panel</Link>
          <Link to="/submit-petition">Citation Prediction</Link>
        </nav>
      </header>

      {/* Main Content Section */}
      <div className="citecontainer">
        <main className="citations-main">
          <section className="importance-section">
            <h1>The Importance of Accurate Citations</h1>
            <p>
              Accurate citations are crucial in the legal field as they ensure
              that all legal arguments and documents are well-supported by
              authoritative sources. Proper citations provide credibility to
              legal arguments, allow for the verification of facts, and
              facilitate further research. They play a critical role in
              maintaining the integrity and reliability of legal proceedings and
              documentation.
            </p>
          </section>
          <section className="input-section">
            <button className="show-input-button" onClick={handleInputClick}>
              Submit Petition For Citations
            </button>

            {isInputVisible && (
              <div className="input-container">
                <input
                  type="text"
                  value={citationInput}
                  onChange={handleInputChange}
                  placeholder="Enter Petition Name"
                />
                  <input
                  type="number"
                  value={citationCount}
                  onChange={handleCitationCount}
                  placeholder="Enter No of Citation required"
                />
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                <div
                  className={`file-status ${
                    fileAttached ? "attached" : "not-attached"
                  }`}
                >
                  {fileAttached ? "File attached" : "No file attached"}
                </div>
                <button className="submit-button" onClick={handleSubmit}>
                  Get Citations
                </button>
              </div>
            )}
          </section>
          <div id="loader_div" className="loader"></div>
          <div id="loading_message" className="message_block"></div>
        </main>
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
