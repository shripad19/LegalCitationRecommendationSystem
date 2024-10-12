import jsPDF from "jspdf";

export default function GeneratePDF(judgement){
    const header_title = [
        "PETITIONER",
        "RESPONDENT",
        "DATE OF JUDGMENT",
        "BENCH",
        "CITATION",
        "ACT",
        "HEADNOTE",
        "JUDGMENT",
      ];

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginX = 10;
    const marginY = 10;
    const maxLineWidth = pageWidth - 2 * marginX;
    let positionY = marginY;
  
    doc.setFontSize(16);
    positionY += 10;
  
    // Function to justify text for even spacing
    const justifyText = (line, maxLineWidth) => {
      const words = line.split(" ");
      if (words.length === 1) return line;
      const totalWordWidth = doc.getStringUnitWidth(line) * doc.internal.getFontSize();
  
      if (totalWordWidth >= maxLineWidth) {
        return line;
      }
  
      const spaceWidth = (maxLineWidth - totalWordWidth) / (words.length - 1);
      let justifiedText = words[0];
      for (let i = 1; i < words.length; i++) {
        justifiedText += " ".repeat(spaceWidth / 2) + words[i];
      }
      return justifiedText;
    };
  

    const splitIntoParagraphs = (text, maxLength) => {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let paragraph = "";
      const paragraphs = [];
  
      sentences.forEach((sentence) => {
        if ((paragraph + sentence).length > maxLength) {
          paragraphs.push(paragraph.trim());
          paragraph = sentence;
        } else {
          paragraph += " " + sentence;
        }
      });
  
      if (paragraph) {
        paragraphs.push(paragraph.trim());
      }
  
      return paragraphs;
    };
  
    header_title.forEach((header) => {
      const sectionContent = judgement[header] || "Section not available";
  
      doc.setFontSize(12);
      doc.text(header, marginX, positionY);
      positionY += 6;
  
      doc.setFontSize(10);
  
      const splitText = (header === "HEADNOTE" || header === "JUDGMENT")
        ? splitIntoParagraphs(sectionContent, 1500) 
        : [sectionContent];
  
      splitText.forEach((paragraph) => {
        const lines = doc.splitTextToSize(paragraph, maxLineWidth);
  
        lines.forEach((line) => {
          if (positionY + 6 > pageHeight - marginY) {
            doc.addPage();
            positionY = marginY;
          }
  
          const justifiedLine = justifyText(line, maxLineWidth);
          doc.text(justifiedLine, marginX, positionY);
          positionY += 6;
        });
  
        positionY += 4; // Space between paragraphs
      });
    });
  
    doc.save(`Judgment.pdf`);
  };
  