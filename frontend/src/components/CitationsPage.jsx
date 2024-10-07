import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/CitationsPage.css';

const CitationsPage = () => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [citationInput, setCitationInput] = useState('');
  const [file, setFile] = useState(null);
  const [fileAttached, setFileAttached] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const navigate = useNavigate();
  let messageInterval;

  const handleInputClick = () => {
    console.log('Input button clicked');
    setIsInputVisible(true);
  };

  const handleInputChange = (event) => {
    console.log('Citation input changed:', event.target.value);
    setCitationInput(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      setFile(file);
      setFileAttached(true);
    } else {
      console.log('No file selected');
      setFile(null);
      setFileAttached(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true); // Set loading state
    activeLoader();
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('http://localhost:5000/process-pdf', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        navigate('/ResultsPage', { state: { results: data } });
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsLoading(false); // Stop the loader when navigation happens
      }
    } else {
      console.log('No file selected for upload');
      setIsLoading(false); // Stop the loader in case of no file
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
    const loader = document.getElementById('loader_div');
    loader.classList.add('loader_active');
    rotateMessages();
  };

  useEffect(() => {
    if (isLoading) {
      messageInterval = setInterval(rotateMessages, 5000);
    }
    
    // Cleanup function to stop the interval when component unmounts
    return () => {
      clearInterval(messageInterval);
      setIsLoading(false); // Reset loading state when leaving the page
    };
  }, [isLoading]);

  return (
    <div className="citations-container">
      {/* Header Section */}
      <header className="header">
        <Link to="/" className="logo-link">
          <img
            src="https://pbs.twimg.com/media/EjVuypHXcAExU3E.jpg:large"
            alt="Logo"
            className="Logo"
          />
        </Link>
        <nav className="nav2">
          <a href="/">Legal News</a>
          <a href="/">Judge Panel</a>
          <a href="/">Citation Predictions</a>
          <div className="dropdown">
            <button className="dropbtn">More</button>
            <div className="dropdown-content">
              <a href="/">Option 1</a>
              <a href="/">Option 2</a>
              <a href="/">Option 3</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content Section */}
      <div className="citecontainer">
        <main className="citations-main">
          <section className="importance-section">
            <h1>The Importance of Accurate Citations</h1>
            <p>
              Accurate citations are crucial in the legal field as they ensure that
              all legal arguments and documents are well-supported by authoritative
              sources. Proper citations provide credibility to legal arguments,
              allow for the verification of facts, and facilitate further research.
              They play a critical role in maintaining the integrity and reliability
              of legal proceedings and documentation.
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
                  type="file"
                  accept="application/pdf" // Added to accept only PDF files
                  onChange={handleFileChange}
                />
                <div className={`file-status ${fileAttached ? 'attached' : 'not-attached'}`}>
                  {fileAttached ? 'File attached' : 'No file attached'}
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

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <img src="https://cdn.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2024/01/2024012288.svg" alt="Supreme Court Emblem" className="footer-logo" />
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
};

export default CitationsPage;
