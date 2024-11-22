from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.metrics.pairwise import cosine_similarity
import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np

# Load a pre-trained model and tokenizer
tokenizer = AutoTokenizer.from_pretrained('Backend/legal_bert_tokenizer')
model = AutoModel.from_pretrained('Backend/legal_bert_model')


from nltk.tokenize import sent_tokenize

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

def extractive_summary(text, max_sentences):
    # Split the text into sentences
    sentences = text.split('. ')
    if len(sentences) <= max_sentences:
        return text  # No summarization needed

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

# Example usage
text = (
    "In 1951, several State legislative measures passed for giving effect to a policy of agrarian reform faced a serious challenge in the Courts. In order to assist the State Legislatures to give effect to the policy, Arts. 31A and 31B were added to the Constitution by the Constitution (First.Amendment) Act, 1951. Article 31B provided that none of the Acts specified in the Ninth Schedule to the Constitution shall be deemed to be void or ever to have become void. In 1.955, by the Constitution- (Fourth Amendment) Act, Art. 31A was amended."
)

summary = extractive_summary(text,5)
print("\nExtractive Summary:", summary)
