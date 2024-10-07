import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/LegalNews.css'; 

const LegalNews = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/everything?q=law&language=en&apiKey=c7fb063c30b24abea55a86b21153fe70`
        );
        setNews(response.data.articles);
      } catch (error) {
        console.error('Error fetching the news:', error);
      }
    };

    fetchNews();
  }, []);

  return (
    <div>
      <h2>Latest News</h2>
      <div className="news-grid">
        {news.slice(0, 8).map((article, index) => (
          <div key={index} className="news-card">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <h3>{article.title}</h3>
            </a>
            <p>{article.description}</p>
          </div>
        ))}
      </div>

      <a 
        href="https://newsapi.org" 
        target="_blank" 
        rel="noopener noreferrer"
        className="view-more"
        style={{ color: '#1e90ff', fontWeight: 'bold' }}
      >
        View More News
      </a>
    </div>
  );
};

export default LegalNews;