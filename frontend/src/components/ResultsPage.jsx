import React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import "../css/ResultsPage.css";
import hlogo from "../Assets/emblemLogo.png";

export default function ResultsPage() {
  const location = useLocation();
  const { results } = location.state;

  const header_title = [
    'PETITIONER',
    'RESPONDENT',
    'DATE OF JUDGMENT',
    'BENCH',
    'CITATION',
    'ACT',
    'HEADNOTE',
    'JUDGMENT',
  ];

  // Function to generate and download the PDF
  // const generatePDF = (pdf_index) => {
  //   const doc = new jsPDF();

  //   // Set title for the PDF
  //   doc.setFontSize(16);
  //   doc.text(`Judgment - ${pdf_index + 1}`, 10, 10);

  //   // Loop through all the sections and add them to the PDF
  //   let positionY = 20; // Starting Y position
  //   header_title.forEach((header, index) => {
  //     const sectionContent =
  //       results[pdf_index]?.[header] || "Section not available";

  //     // Add section title
  //     doc.setFontSize(12);
  //     doc.text(header, 10, positionY);

  //     // Add section content
  //     doc.setFontSize(10);
  //     const splitText = doc.splitTextToSize(sectionContent, 180); // Wrap long text
  //     doc.text(splitText, 10, positionY + 10);

  //     // Adjust the Y position for the next section
  //     positionY += 10 + splitText.length * 5; // Adjust spacing for the text

  //     // Check if the page height is exceeded (roughly 280), if so, add new page
  //     if (positionY > 280) {
  //       doc.addPage();
  //       positionY = 20;
  //     }
  //   });
  //   doc.save(`${pdf_index+1}_Judgment.pdf`);
  // };

  // const generatePDF = (pdf_index) => {
  //   const doc = new jsPDF();
  //   const pageHeight = doc.internal.pageSize.height; // Get the page height
  //   const marginY = 10; // Top margin
  //   let positionY = marginY; // Starting Y position
  
  //   // Set title for the PDF
  //   doc.setFontSize(16);
  //   doc.text(`Judgment - ${pdf_index + 1}`, 10, positionY);
  //   positionY += 10;
  
  //   // Loop through all the sections and add them to the PDF
  //   header_title.forEach((header, index) => {
  //     const sectionContent = results[pdf_index]?.[header] || "Section not available";
  
  //     // Add section title
  //     doc.setFontSize(12);
  //     doc.text(header, 10, positionY);
  //     positionY += 6;
  
  //     // Add section content
  //     doc.setFontSize(10);
  //     const splitText = doc.splitTextToSize(sectionContent, 180); // Wrap long text
  
  //     splitText.forEach((line) => {
  //       // Check if the next line will exceed the page height
  //       if (positionY + 6 > pageHeight - marginY) {
  //         doc.addPage(); // Add a new page
  //         positionY = marginY; // Reset Y position for the new page
  //       }
  //       doc.text(line, 10, positionY);
  //       positionY += 6; // Move down for the next line
  //     });
  
  //     // Add some spacing after each section
  //     positionY += 4;
  //   });
  
  //   // Save the PDF
  //   doc.save(`${pdf_index + 1}_Judgment.pdf`);
  // };
  
  const generatePDF = (pdf_index) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width; // Get page width
    const pageHeight = doc.internal.pageSize.height; // Get page height
    const marginX = 10; // Left and right margin
    const marginY = 10; // Top margin
    const maxLineWidth = pageWidth - 2 * marginX; // Max width for text
    let positionY = marginY; // Starting Y position
  
    // Set title for the PDF
    doc.setFontSize(16);
    doc.text(`Judgment - ${pdf_index + 1}`, marginX, positionY);
    positionY += 10;
  
    const justifyText = (line, maxLineWidth) => {
      const words = line.split(" ");
      if (words.length === 1) return line; // No need to justify a single word
    
      // Calculate the total width of the words in the line
      const totalWordWidth = doc.getStringUnitWidth(line) * doc.internal.getFontSize();
    
      // If the total word width exceeds the maximum line width, skip justification
      if (totalWordWidth >= maxLineWidth) {
        return line;
      }
    
      const spaceWidth = (maxLineWidth - totalWordWidth) / (words.length - 1); // Extra space to distribute
    
      let justifiedText = words[0];
      for (let i = 1; i < words.length; i++) {
        justifiedText += " ".repeat(spaceWidth / 2) + words[i]; // Add extra spaces between words
      }
      return justifiedText;
    };
        
    // Loop through all the sections and add them to the PDF
    header_title.forEach((header, index) => {
      const sectionContent = results[pdf_index]?.[header] || "Section not available";
  
      // Add section title
      doc.setFontSize(12);
      doc.text(header, marginX, positionY);
      positionY += 6;
  
      // Add section content
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(sectionContent, maxLineWidth); // Wrap long text
  
      splitText.forEach((line) => {
        // Check if the next line will exceed the page height
        if (positionY + 6 > pageHeight - marginY) {
          doc.addPage(); // Add a new page
          positionY = marginY; // Reset Y position for the new page
        }
  
        // Justify the text
        const justifiedLine = justifyText(line, maxLineWidth);
        doc.text(justifiedLine, marginX, positionY);
        positionY += 6; // Move down for the next line
      });
  
      // Add some spacing after each section
      positionY += 4;
    });
  
    // Save the PDF
    doc.save(`${pdf_index + 1}_Judgment.pdf`);
  };
  
  

  // function JudgementComponent({ judgement, index }) {
  let [showFullHeadnote, setShowFullHeadnote] = useState(false);
  let [showFullJudgment, setShowFullJudgment] = useState(false);
  let [showFullAct, setShowFullAct] = useState(false);

  const toggleHeadnote = () => setShowFullHeadnote(!showFullHeadnote);
  const toggleJudgment = () => setShowFullJudgment(!showFullJudgment);
  const toggleAct = () => setShowFullAct(!showFullAct);

  const maxLines = 3; // You can customize the number of lines
  // }

  return (
    <div className="results-container">
      <header className="header">
        <div>
          <Link to="/" className="logo-link">
            <img src={hlogo} alt="Emblem" className="head-logo" />
          </Link>
        </div>
        <div className="webName">Legal Cite</div>

        <nav className="nav">
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

      <div className="judgments-container">
        {results.map((judgement, index) => (
          <div key={index}>
            <h4>
              {judgement.PETITIONER} - {judgement.RESPONDENT}
            </h4>
            <p  className="judgement_component">{judgement["DATE OF JUDGMENT"]}</p>
            <p className="judgement_component">{judgement.BENCH}</p>
            <p className="judgement_component">{judgement.CITATION}</p>
            <p className="judgement_component"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: showFullAct ? "none" : maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {judgement.ACT}
            </p>
            <button onClick={toggleAct}>
              {showFullAct ? "Read less" : "Read more"}
            </button>


            <p className="judgement_component"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: showFullHeadnote ? "none" : maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {judgement.HEADNOTE}
            </p>
            <button onClick={toggleHeadnote}>
              {showFullHeadnote ? "Read less" : "Read more"}
            </button>


            <p className="judgement_component"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: showFullJudgment ? "none" : maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {judgement.JUDGMENT}
            </p>
            <button onClick={toggleJudgment}>
              {showFullJudgment ? "Read less" : "Read more"}
            </button>
            <button onClick={() => generatePDF(index)}>Download PDF</button>
          </div>
        ))}
        ;
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
