from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import pickle
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pdfplumber
import re
import warnings
from nltk.tokenize import sent_tokenize
import numpy as np

# Suppress FutureWarnings
warnings.filterwarnings("ignore", category=FutureWarning)

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

app = Flask(__name__)
CORS(app)

# Load the sentence-transformers model (LegalBERT wrapped)
model_name = "nlpaueb/legal-bert-base-uncased"
sentence_transformer = SentenceTransformer(model_name)

# Load caches
with open('content_cache.pkl', 'rb') as f:
    content_cache = pickle.load(f)

with open('embeddings_cache.pkl', 'rb') as f:
    embeddings_cache = pickle.load(f)


def remove_incomplete_sentences(text):
    sentences = sent_tokenize(text)
    cleaned_sentences = [
        sentence for sentence in sentences if sentence.endswith(('.', '!', '?')) and len(sentence.split()) > 3
    ]
    return ' '.join(cleaned_sentences)


def format_summary_as_paragraphs(summary, sentences_per_paragraph):
    sentences = sent_tokenize(summary)
    paragraphs = [' '.join(sentences[i:i + sentences_per_paragraph]) for i in range(0, len(sentences), sentences_per_paragraph)]
    return paragraphs


def extractive_summary(text, percentage):
    sentences = text.split('. ')
    max_sentences = int(len(sentences) * (percentage / 100))
    if len(sentences) <= max_sentences:
        return text

    print("Max Sentences : ", max_sentences)
    # Generate embeddings for each sentence
    sentence_embeddings = np.vstack(sentence_transformer.encode(sentences))
    scores = cosine_similarity(sentence_embeddings, sentence_embeddings.mean(axis=0, keepdims=True))

    ranked_sentences = sorted(
        enumerate(sentences), key=lambda x: scores[x[0]][0], reverse=True
    )

    summary_sentences = [sentences[idx] for idx, _ in ranked_sentences[:max_sentences]]
    summary = '. '.join(summary_sentences)
    summary = remove_incomplete_sentences(summary)
    return summary


def get_summary(text, maxLimit):
    summary = extractive_summary(text, maxLimit)
    return summary


# Embedding generation function using sentence-transformers
def get_legal_bert_embeddings(text):
    embeddings = sentence_transformer.encode([text], convert_to_tensor=True)
    return embeddings


def extract(file_path):
    with pdfplumber.open(file_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()

    # Clean the text by removing extra spaces, newlines, and special characters
    text = re.sub(r'\s+', ' ', text)
    return text


def extract_and_split_pdf_sections(file_path):
    with pdfplumber.open(file_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()

    text = re.sub(r'\s+', ' ', text)

    sections = {
        "PETITIONER": r"PETITIONER[:\s]*",
        "RESPONDENT": r"RESPONDENT[:\s]*",
        "DATE OF JUDGMENT": r"DATE OF JUDGMENT[:\s]*",
        "BENCH": r"BENCH[:\s]*",
        "CITATION": r"CITATION[:\s]*",
        "ACT": r"ACT[:\s]*",
        "HEADNOTE": r"HEADNOTE[:\s]*",
        "JUDGMENT": r"JUDGMENT[:\s]*"
    }

    pattern = "|".join(sections.values())
    split_text = re.split(f'({pattern})', text)

    section_dict = {}
    for i in range(1, len(split_text), 2):
        section_title = None
        for header, regex in sections.items():
            if re.match(regex, split_text[i]):
                section_title = header
                break

        if section_title:
            section_content = split_text[i + 1].strip()
            section_dict[section_title] = section_content

    return section_dict


def process_pdf(file_path):
    sections = extract_and_split_pdf_sections(file_path)
    embeddings_dict = {section: get_legal_bert_embeddings(content) for section, content in sections.items()}
    return sections, embeddings_dict


def compare_with_reference(reference_pdf_embeddings):
    similarities = {}
    for pdf_name, pdf_embeddings in embeddings_cache.items():
        for section, ref_embedding in reference_pdf_embeddings.items():
            if section in pdf_embeddings:
                similarity = cosine_similarity(ref_embedding, pdf_embeddings[section])[0][0]
                similarities[(pdf_name, section)] = round(similarity, 3)

    return similarities


def determine_similarity(reference_pdf_path):
    sections, embeddings = process_pdf(reference_pdf_path)
    similarities = compare_with_reference(embeddings)

    total_similarity_dict = {}
    for (pdf_name, section), similarity in similarities.items():
        if section in ["ACT", "HEADNOTE", "JUDGMENT"]:
            if pdf_name not in total_similarity_dict:
                total_similarity_dict[pdf_name] = 0
            total_similarity_dict[pdf_name] += round(similarity, 3)

    return total_similarity_dict


def find_top_citations(reference_pdf_path, citationCount):
    total_similarity_dict = determine_similarity(reference_pdf_path)
    top_judgments = sorted(total_similarity_dict.items(), key=lambda x: x[1], reverse=True)[:citationCount]

    top_ranked_citations = [
        content_cache[pdf_name] for pdf_name, _ in top_judgments
    ]
    return top_ranked_citations


@app.route('/process-pdf', methods=['POST'])
def search():
    query_pdf = request.files['file']
    citationCount = int(request.form['citationCount'])
    similar_pdfs = find_top_citations(query_pdf, citationCount)
    return jsonify(similar_pdfs)


@app.route('/summary', methods=['POST'])
def find_summary():
    data = request.json
    text = data.get('text')
    para_length = 4
    percentage = int(data.get('percentage'))
    summary = get_summary(text, percentage)
    summary = format_summary_as_paragraphs(summary, para_length)
    return summary


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True, port=5000)
