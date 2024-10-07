import React from 'react';
import '../css/LegalPage.css';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../Assets/Logo.svg'
import hlogo from '../Assets/head logo.png'
import judge1 from '../Assets/judge1.jpg'
import judge2 from '../Assets/judge2.jpg'
import judge3 from '../Assets/judge3.jpg'
import judge4 from '../Assets/judge4.jpg'
import LegalNews from './LegalNews'

function LegalPage() {
  const navigate = useNavigate();
  const handleSub = async () => {
    navigate('/legalnews')
  };
  return (
    <div className="container">
      <header className="header">
        <div>
        <img src={hlogo} alt="Supreme Court Emblem" className="head-logo" />
        </div>
        <div className="webName">Legal Cite</div>
        
        <nav className="nav">
          <a href="#">Legal News</a>
          <a href="#">Judge Panel</a>
          <a href="#">Citation Predictions</a>
          <div className="dropdown">
            <button className="dropbtn">More</button>
            <div className="dropdown-content">
              <a href="#">Option 1</a>
              <a href="#">Option 2</a>
              <a href="#">Option 3</a>
            </div>
          </div>
        </nav>
      </header>




      <main className="main-content">
        <div className="content-box">
          <h1>Empowering Lawyers with the Latest Legal Insights</h1>
          <p>Stay ahead of the game with our comprehensive legal news and judge panel information.</p>
          <div className="cta-buttons">
            <button className="button learn-more">Learn More</button>
            <button className="button sign-up">Sign Up</button>
          </div>
          {/* <img src={spi} alt="SPI" className="hero-image" /> */}
        </div>
      </main>

      {/* New Section - Adding the content from your image */}
      <section className="info-section">
        <div class="center-container">
          <h2>Stay Informed</h2>
          <h3>Latest News and Updates for Lawyers</h3>
          <p>Get the most recent news and updates relevant to lawyers. Stay up-to-date with the latest developments in the legal field.</p>

          <div class="info-boxes">
            <div class="info-box">
              <h4>Recent Cases</h4>
              <p>Explore the latest court decisions and their implications for legal professionals.</p>
            </div>
            <div class="info-box">
              <h4>Legal Insights</h4>
              <p>Gain valuable insights from industry experts and thought leaders in the legal community.</p>
            </div>
          </div>

          <div class="cta-buttons">
            <button onClick={handleSub} class="learn-more1">Learn More</button>
          </div>
        </div>
      </section>
      <section class="news">
        <LegalNews />
      </section>
      <section className="prediction-section">
        <div className="prediction-container">
          <h1 className="headline">Find Accurate Citation Predictions Fast</h1>
          <p className="subheading">Input the petetion details and receive accurate citations for your petetions.</p>

          <br />

          <div className="button-container">
            <button className="learn-more" onClick={() => window.location.href = 'CitationsPage'}>Get Citations</button>
          </div>

        </div>
      </section>

      <section className="team-section">
        <h2>Hon CJI and Judges</h2>
        <div className="team-container">
          <div className="team-member">
           <img src={judge1} alt="Judge1" className="team-image" />
            <div className="team-info">
              <h4>Hon'ble Dr. Justice D.Y. Chandrachud</h4><br></br>
              <p>Chief Justice of India</p>
            </div>
          </div>
          <div className="team-member">
          <img src={judge2} alt="Judge1" className="team-image" />
            <div className="team-info">
              <h4>Justice Sanjiv Khanna</h4><br></br>
              <p>Judge</p>
            </div>
          </div>
          <div className="team-member">
          <img src={judge3} alt="Judge1" className="team-image" />
            <div className="team-info">
              <h4>Justice Bhushan Ramkrishna Gavai</h4><br></br>
              <p>Judge</p>
            </div>
          </div>
          <div className="team-member">
          <img src={judge4} alt="Judge1" className="team-image" />
            <div className="team-info"><br></br>
              <h4>Justice Surya Kant</h4><br></br>
              <p>Judge</p>
            </div>
          </div>
        </div>
        <br />
        <button className="judgeb">View all</button>
      </section>
      <br />
      <h2 className="contacthead">Contact Us</h2>
      <section className="contact-info">
        <div className="contact-quadrant">
          <div className="contact-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="contact-text">
            <h2>Email Us</h2>
            <p>supremecourt[at]nic[dot]in</p>
          </div>
        </div>

        <div className="contact-quadrant">
          <div className="contact-icon">
            <i className="fas fa-phone"></i>
          </div>
          <div className="contact-text">
            <h2>Phone</h2>
            <p>011-23116400, 23116401, 23116402, 23116403</p>
          </div>
        </div>

        <div className="contact-quadrant">
          <div className="contact-icon">
            <i className="fas fa-map-pin"></i>
          </div>
          <div className="contact-text">
            <h2>Address</h2>
            <p>The Registrar Supreme Court of India Tilak Marg, New Delhi-110001</p>
          </div>
        </div>

        <div className="contact-quadrant">
          <div className="contact-icon">
            <i className="fas fa-mobile-alt"></i>
          </div>
          <div className="contact-text">
            <h2>Telephone Directory</h2>
            <p>Telephone List Of Officers, Branches etc.</p>
          </div>
        </div>
      </section>
      <footer className="footer">
  <div className="footer-content">
  <img src={logo} alt="Supreme Court Emblem" className="footer-logo" />
    {/* <img src="https://cdn.s3waas.gov.in/s3ec0490f1f4972d133619a60c30f3559e/uploads/2024/01/2024012288.svg" alt="Supreme Court Emblem" className="footer-logo" /> */}
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

export default LegalPage;
