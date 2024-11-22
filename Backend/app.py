from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import pickle
from transformers import AutoTokenizer, AutoModel
from sklearn.metrics.pairwise import cosine_similarity
import torch
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

# Load the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained('legal_bert_tokenizer')
model = AutoModel.from_pretrained('legal_bert_model')

with open('content_cache.pkl', 'rb') as f:
    content_cache = pickle.load(f)

with open('embeddings_cache.pkl', 'rb') as f:
    embeddings_cache = pickle.load(f)


def remove_incomplete_sentences(text):
    # Split text into sentences
    sentences = sent_tokenize(text)
    
    # Define a filter for complete sentences
    cleaned_sentences = []
    for sentence in sentences:
        # Rule: Sentence must end with '.', '!', or '?' and have more than 3 words
        if sentence.endswith(('.', '!', '?')) and len(sentence.split()) > 3:
            cleaned_sentences.append(sentence)
    
    # Rejoin cleaned sentences into a paragraph
    cleaned_text = ' '.join(cleaned_sentences)
    return cleaned_text

def format_summary_as_paragraphs(summary, sentences_per_paragraph):
    # Tokenize the summary into sentences
    sentences = sent_tokenize(summary)
    
    # Group sentences into paragraphs
    paragraphs = []
    for i in range(0, len(sentences), sentences_per_paragraph):
        paragraph = ' '.join(sentences[i:i + sentences_per_paragraph])
        paragraphs.append(paragraph)
    return paragraphs

def extractive_summary(text,percentage):
    # Split the text into sentences
    sentences = text.split('. ')
    max_sentences = int(len(sentences)*(percentage/100))
    if len(sentences) <= max_sentences:
        return text  # No summarization needed

    print("Max Sentences : ",max_sentences)
    # Tokenize and encode each sentence
    sentence_embeddings = []
    for sentence in sentences:
        inputs = tokenizer(sentence, return_tensors="pt", padding=True, truncation=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
        # Extract CLS token embedding (first token in the sequence)
        cls_embedding = outputs.last_hidden_state[:, 0, :].squeeze(0).numpy()
        sentence_embeddings.append(cls_embedding)

    # Calculate sentence similarities
    sentence_embeddings = np.vstack(sentence_embeddings)
    scores = cosine_similarity(sentence_embeddings, sentence_embeddings.mean(axis=0, keepdims=True))

    # Rank sentences by similarity scores
    ranked_sentences = sorted(
        enumerate(sentences), key=lambda x: scores[x[0]][0], reverse=True
    )

    # Select the top N sentences for the summary
    summary_sentences = [sentences[idx] for idx, _ in ranked_sentences[:max_sentences]]
    summary = '. '.join(summary_sentences)
    
    summary = remove_incomplete_sentences(summary)
    return summary

def get_summary(text,maxLimit):
    summary = extractive_summary(text,maxLimit)
    return summary

# embedding generation function
def get_legal_bert_embeddings(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
        embeddings = outputs.last_hidden_state.mean(dim=1)
    return embeddings

# extracting & spliting 
def extract_and_split_pdf_sections(file_path):
    # Open and extract the text from the PDF
    with pdfplumber.open(file_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()

    # Clean the text by removing extra spaces, newlines, and special characters
    text = re.sub(r'\s+', ' ', text)
    
    # Define the section headers and create flexible patterns for matching
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
    
    # Create a combined regex pattern for all section headers
    pattern = "|".join(sections.values())
    
    # Split the text into sections
    split_text = re.split(f'({pattern})', text)
    
    section_dict = {}
    
    # Loop over the split text and assign content to the correct section headers
    for i in range(1, len(split_text), 2):
        # Match the section using the original flexible pattern
        section_title = None
        for header, regex in sections.items():
            if re.match(regex, split_text[i]):
                section_title = header
                break

        if section_title:
            section_content = split_text[i + 1].strip()
            section_dict[section_title] = section_content
    
    return section_dict

# pdf processing
def process_pdf(file_path):
    sections = extract_and_split_pdf_sections(file_path)  # Use your previous function
    embeddings_dict = {}
    
    for section, content in sections.items():
        embeddings_dict[section] = get_legal_bert_embeddings(content)

    return sections,embeddings_dict


# Function to compare with the reference PDF
def compare_with_reference(reference_pdf_embeddings):
    similarities = {}

    for pdf_name, pdf_embeddings in embeddings_cache.items():
        for section, ref_embedding in reference_pdf_embeddings.items():
            if section in pdf_embeddings:
                # Calculate cosine similarity
                similarity = cosine_similarity(ref_embedding, pdf_embeddings[section])[0][0]
                similarities[(pdf_name, section)] = round(similarity, 3)

    return similarities


def datermineSimilarity(reference_pdf_path):
    section,embeddings = process_pdf(reference_pdf_path)
    reference_embeddings = embeddings
    # Compare with cached PDFs
    similarities = compare_with_reference(reference_embeddings)

    total_similarity_dict = {}
    
    # Iterate through similarities to calculate total similarity for each PDF
    for (pdf_name, section), similarity in similarities.items():
        similarity_val = float(similarity)

        # Check if the section is one of the relevant sections
        if section in ["ACT", "HEADNOTE", "JUDGMENT"]:
            # Add similarity value to the corresponding PDF in the dictionary
            if pdf_name not in total_similarity_dict:
                total_similarity_dict[pdf_name] = 0
            total_similarity_dict[pdf_name] += round(similarity_val, 3)

        # Print the individual similarity for each section
        # print(f"PDF: {pdf_name}, Section: {section} - Cosine Similarity: {round(similarity_val, 3)}")
    
    # Print the total similarity for each PDF
    # print("\nTotal Similarity for each PDF:")
    # for pdf_name, total_similarity in total_similarity_dict.items():
    #     print(f"PDF: {pdf_name} - Total Similarity: {round(total_similarity/3,2)}")
    return total_similarity_dict


def find_top_citations(reference_pdf_path):
    
    total_similarity_dict = datermineSimilarity(reference_pdf_path)
    # Sort the PDFs by total similarity in descending order and get the top 5
    top_5_judgments = sorted(total_similarity_dict.items(), key=lambda x: x[1], reverse=True)[:5]
    
    top_ranked_citations = []
    # Retrieve the content of the top 5 judgments from the judgment cache
    for rank, (pdf_name, total_similarity) in enumerate(top_5_judgments, 1):
        judgment_content = content_cache[pdf_name]
        top_ranked_citations.append(judgment_content)
        
    return top_ranked_citations


# Define a route for similarity search
@app.route('/process-pdf', methods=['POST'])
def search():
    print("Request arrived")
    query_pdf = request.files['file']
    similar_pdfs = find_top_citations(query_pdf)
    print("Requested sent")
    return jsonify(similar_pdfs)


@app.route('/summary', methods=['POST'])
def find_summary():
    print("Request arrived summary")
    data = request.json
    text = data.get('text')
    para_length = 4
    percentage = int(data.get('percentage'))
    summary = get_summary(text,percentage)
    summary = format_summary_as_paragraphs(summary,para_length)
    print("Request sent summary")
    return summary

# Define a route to serve the application
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True,port=5000)