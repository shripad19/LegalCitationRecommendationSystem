from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

import os
import pickle
from transformers import AutoTokenizer, AutoModel
from sklearn.metrics.pairwise import cosine_similarity
import torch
import pdfplumber
import re

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

app = Flask(__name__)
CORS(app)

with open('content_cache.pkl', 'rb') as f:
    content_cache = pickle.load(f)

with open('embeddings_cache.pkl', 'rb') as f:
    embeddings_cache = pickle.load(f)
    
# Load the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained('legal_bert_tokenizer')
model = AutoModel.from_pretrained('legal_bert_model')

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
# reference_pdf_path = "/kaggle/input/judgement-dataset/sankari_prasad.pdf"
# printSimilarity(reference_pdf_path)


def find_top_citations(reference_pdf_path):
    
    total_similarity_dict = datermineSimilarity(reference_pdf_path)
    # Sort the PDFs by total similarity in descending order and get the top 5
    top_5_judgments = sorted(total_similarity_dict.items(), key=lambda x: x[1], reverse=True)[:5]
    
    top_ranked_citations = []
    # Retrieve the content of the top 5 judgments from the judgment cache
    for rank, (pdf_name, total_similarity) in enumerate(top_5_judgments, 1):
        # print(f"\nTop {rank} Judgment: {pdf_name}")
        # print(f"Total Similarity Score: {round(total_similarity/3, 3)}")
        
        # Load and print the split sections of the judgment from the cache
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

# Define a route to serve the application
@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)




