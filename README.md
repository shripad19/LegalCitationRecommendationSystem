# 🏛️ AI-Driven Judicial Assistance System  

## 📌 Overview  
The `AI-Driven Judicial Assistance System` is an intelligent legal research platform that recommends relevant judicial citations based on petition files. It ranks judgments, provides concise summaries, and explains why specific cases are relevant, assisting lawyers and legal professionals in streamlining legal research. The system also supports **multilingual case law retrieval**, making it accessible to diverse legal practitioners.  

## 🚀 Features  
- 📂 **Petition File Processing** → Users upload legal petitions for analysis.  
- 🔍 **Feature Matching & Citation Retrieval** → Extracts key legal arguments and matches them with relevant past judgments.  
- 📊 **Ranking of Judgments** → Uses AI to prioritize the most relevant case laws.  
- 📝 **Summarization** → Generates concise summaries for each cited judgment.   
- 🌍 **Multilingual Support** → Supports case retrieval and legal text processing in multiple languages.  


## 🏗️ Tech Stack  
```yaml
Frontend: React.js (User Interface)
Backend: Flask (REST API)
Machine Learning: BERT (Natural Language Processing)
Libraries Used:
  - Python: NumPy, Pandas, NLTK, Scikit-learn, PyPDF
  - NLP: BERT, NLTK for text processing
  - Frontend: HTML, CSS, JavaScript
  - Backend: Flask, PyPDF for document processing
  - Multilingual Support: Language models for legal text analysis
```

## 🏗️ Installation & Setup  

1️⃣ **Clone the Repository**
```bash
git clone https://github.com/your-username/AI-Judicial-Assistant.git
cd AI-Judicial-Assistant
```
2️⃣ **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
python app.py
```
3️⃣ **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

## 🎯 Usage
1. Upload a petition file in PDF format.
2. The system extracts key legal features and searches for relevant judgments.
3. Ranked judgments are displayed along with a summary and an explanation of relevance.
4. Users can access judgments in multiple languages, ensuring broader accessibility.
