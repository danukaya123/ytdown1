import { useState, useEffect } from "react";
import Head from "next/head";

export default function YouTubeDownloader() {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("mp3");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

const handleDownload = async () => {
  if (!url) return;

  setIsLoading(true);

  try {
    const response = await fetch("/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, type }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert("Error: " + (errorData.error || "Failed to download"));
      setIsLoading(false);
      return;
    }

    // Get filename from content-disposition header
    const disposition = response.headers.get("Content-Disposition");
    let filename = "download";
    if (disposition && disposition.includes("filename=")) {
      filename = disposition
        .split("filename=")[1]
        .replace(/['"]/g, "");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    // Create temporary link to trigger download
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error(err);
    alert("Download failed. Try again later.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <>
      <Head>
        <title>YTConverter Pro - Download YouTube Videos</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="main-container">
        {/* Animated Background */}
        <div className="background-design">
          <div className="blue-gradient-bg"></div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
          <div className="grid-pattern"></div>
        </div>

        {/* Navigation */}
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <div className="logo-icon">
                <i className="fab fa-youtube"></i>
              </div>
              <span>YTConverter Pro</span>
            </div>
            <div className="nav-menu">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#support">Support</a>
              <button className="nav-cta">
                <i className="fas fa-download"></i>
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className={`hero ${isVisible ? 'visible' : ''}`}>
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-badge fade-up">
                <i className="fas fa-bolt"></i>
                <span>Fast & Free Downloads</span>
              </div>
              
              <h1 className="hero-title fade-up">
                Download & Convert
                <span className="blue-gradient-text"> YouTube Videos</span>
                in Seconds
              </h1>
              
              <p className="hero-description fade-up">
                Transform any YouTube video into MP3 audio or MP4 video files instantly. 
                Fast, free, and incredibly easy to use. No registration required.
              </p>

              {/* Stats */}
              <div className="hero-stats fade-up">
                <div className="stat-item">
                  <div className="stat-icon blue-bg">
                    <i className="fas fa-download"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">10M+</div>
                    <div className="stat-label">Downloads</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon blue-bg">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">100%</div>
                    <div className="stat-label">Safe & Secure</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon blue-bg">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">Fast</div>
                    <div className="stat-label">Processing</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Card */}
            <div className="download-card fade-left">
              <div className="card-header">
                <div className="card-icon blue-gradient-bg">
                  <i className="fab fa-youtube"></i>
                </div>
                <h3>Start Downloading Now</h3>
                <p>Convert videos in seconds with our powerful tool</p>
              </div>

              <div className="card-body">
                <div className="input-group">
                  <div className="input-field">
                    <i className="fas fa-link input-icon"></i>
                    <input
                      type="text"
                      placeholder="Paste YouTube URL here..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="url-input"
                    />
                  </div>

                  <div className="format-selector">
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value)}
                      className="format-select"
                    >
                      <option value="mp3">
                        <i className="fas fa-music"></i>
                        MP3 Audio (High Quality)
                      </option>
                      <option value="mp4">
                        <i className="fas fa-video"></i>
                        MP4 Video (360p HD)
                      </option>
                      <option value="mp4-hd">
                        <i className="fas fa-hd-video"></i>
                        MP4 Video (720p HD)
                      </option>
                    </select>
                    <i className="fas fa-chevron-down select-arrow"></i>
                  </div>

                  <button 
                    onClick={handleDownload}
                    disabled={!url || isLoading}
                    className={`download-btn blue-gradient-bg ${isLoading ? 'loading' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-download"></i>
                        Download Now
                        <i className="fas fa-arrow-right btn-arrow"></i>
                      </>
                    )}
                  </button>
                </div>

                {/* Features */}
                <div className="features-list">
                  <div className="feature">
                    <i className="fas fa-check blue-text"></i>
                    <span>No Registration Required</span>
                  </div>
                  <div className="feature">
                    <i className="fas fa-check blue-text"></i>
                    <span>High Quality Output</span>
                  </div>
                  <div className="feature">
                    <i className="fas fa-check blue-text"></i>
                    <span>Fast Conversion Speed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="container">
            <div className="section-header">
              <h2>Why Choose Our Downloader?</h2>
              <p>Experience premium features for all your download needs</p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon blue-gradient-bg">
                  <i className="fas fa-rocket"></i>
                </div>
                <h3>Lightning Fast</h3>
                <p>Download videos at incredible speeds with our optimized servers and advanced technology.</p>
                <div className="feature-border"></div>
              </div>

              <div className="feature-card">
                <div className="feature-icon blue-gradient-bg">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3>100% Secure</h3>
                <p>Your privacy is our priority. We don't store any personal data or download history.</p>
                <div className="feature-border"></div>
              </div>

              <div className="feature-card">
                <div className="feature-icon blue-gradient-bg">
                  <i className="fas fa-infinity"></i>
                </div>
                <h3>Unlimited Downloads</h3>
                <p>No limits on downloads. Convert as many videos as you want, completely free.</p>
                <div className="feature-border"></div>
              </div>

              <div className="feature-card">
                <div className="feature-icon blue-gradient-bg">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h3>All Devices</h3>
                <p>Works perfectly on all devices - desktop, tablet, and mobile phones seamlessly.</p>
                <div className="feature-border"></div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="how-it-works">
          <div className="container">
            <div className="section-header">
              <h2>How To Download Videos</h2>
              <p>Simple steps to get your content in minutes</p>
            </div>

            <div className="steps-container">
              <div className="step">
                <div className="step-number blue-gradient-bg">1</div>
                <div className="step-content">
                  <i className="fas fa-copy blue-text"></i>
                  <h3>Copy URL</h3>
                  <p>Copy the YouTube video URL from your browser address bar</p>
                </div>
                <div className="step-connector"></div>
              </div>

              <div className="step">
                <div className="step-number blue-gradient-bg">2</div>
                <div className="step-content">
                  <i className="fas fa-paste blue-text"></i>
                  <h3>Paste & Select</h3>
                  <p>Paste the URL and choose your preferred format (MP3/MP4)</p>
                </div>
                <div className="step-connector"></div>
              </div>

              <div className="step">
                <div className="step-number blue-gradient-bg">3</div>
                <div className="step-content">
                  <i className="fas fa-download blue-text"></i>
                  <h3>Download</h3>
                  <p>Click download and save your file instantly to your device</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-card blue-gradient-bg">
              <div className="cta-content">
                <h2>Ready to Start Downloading?</h2>
                <p>Join millions of users who trust our platform for their video downloads</p>
                <button className="cta-btn">
                  <i className="fas fa-download"></i>
                  Start Downloading Now
                </button>
              </div>
              <div className="cta-graphic">
                <i className="fas fa-play-circle"></i>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand">
                <i className="fab fa-youtube blue-text"></i>
                <span>YTConverter Pro</span>
              </div>
              <p>© 2024 YTConverter Pro. All rights reserved. | Fast, Free & Secure YouTube Downloads</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .main-container {
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: #ffffff;
          position: relative;
          overflow-x: hidden;
        }

        /* Background Design */
        .background-design {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }

        .blue-gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
          animation: float 8s ease-in-out infinite;
        }

        .shape-1 {
          width: 200px;
          height: 200px;
          top: 10%;
          left: 5%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          top: 60%;
          right: 10%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 100px;
          height: 100px;
          bottom: 20%;
          left: 15%;
          animation-delay: 4s;
        }

        .shape-4 {
          width: 120px;
          height: 120px;
          top: 30%;
          right: 20%;
          animation-delay: 6s;
        }

        .grid-pattern {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(102, 126, 234, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(102, 126, 234, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }

        /* Blue Text Utility */
        .blue-text {
          color: #667eea;
        }

        .blue-gradient-text {
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Navigation */
        .navbar {
          position: fixed;
          top: 0;
          width: 100%;
          padding: 1rem 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(102, 126, 234, 0.1);
          z-index: 1000;
          box-shadow: 0 2px 20px rgba(102, 126, 234, 0.1);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
        }

        .nav-brand .logo-icon {
          color: #ff0000;
          font-size: 2rem;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-menu a {
          color: #4a5568;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .nav-menu a:hover {
          color: #667eea;
        }

        .nav-cta {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.3s ease;
        }

        .nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        /* Hero Section */
        .hero {
          padding: 140px 2rem 80px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          opacity: 0;
          transform: translateY(30px);
          transition: all 1s ease;
        }

        .hero.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-content {
          color: #2d3748;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(102, 126, 234, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          margin-bottom: 2rem;
          border: 1px solid rgba(102, 126, 234, 0.2);
          font-size: 0.9rem;
          font-weight: 500;
          color: #667eea;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: #2d3748;
        }

        .hero-description {
          font-size: 1.2rem;
          line-height: 1.6;
          color: #4a5568;
          margin-bottom: 2rem;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.8);
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.1);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: white;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #718096;
        }

        /* Download Card */
        .download-card {
          background: white;
          border-radius: 24px;
          border: 1px solid rgba(102, 126, 234, 0.2);
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
          transition: transform 0.3s ease;
        }

        .download-card:hover {
          transform: translateY(-5px);
        }

        .card-header {
          padding: 2.5rem 2rem 1.5rem;
          text-align: center;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-bottom: 1px solid rgba(102, 126, 234, 0.1);
        }

        .card-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 2rem;
          color: white;
        }

        .card-header h3 {
          color: #2d3748;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .card-header p {
          color: #718096;
        }

        .card-body {
          padding: 2.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-field {
          position: relative;
        }

        .url-input {
          width: 100%;
          padding: 1.25rem 1rem 1.25rem 3rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .url-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
        }

        .format-selector {
          position: relative;
        }

        .format-select {
          width: 100%;
          padding: 1.25rem 3rem 1.25rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          font-size: 1rem;
          outline: none;
          cursor: pointer;
          appearance: none;
          transition: border-color 0.3s ease;
        }

        .format-select:focus {
          border-color: #667eea;
        }

        .select-arrow {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
          pointer-events: none;
        }

        .download-btn {
          padding: 1.25rem 2rem;
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .download-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .download-btn:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        .download-btn.loading {
          background: #cbd5e0;
        }

        .btn-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4a5568;
          font-size: 0.9rem;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 0;
          background: #f7fafc;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1rem;
        }

        .section-header p {
          font-size: 1.2rem;
          color: #718096;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: white;
          padding: 3rem 2rem;
          border-radius: 20px;
          text-align: center;
          color: #2d3748;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(102, 126, 234, 0.1);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
          color: white;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: #718096;
          line-height: 1.6;
        }

        .feature-border {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-border {
          transform: scaleX(1);
        }

        /* How It Works */
        .how-it-works {
          padding: 6rem 0;
          background: white;
        }

        .steps-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          position: relative;
        }

        .step {
          text-align: center;
          color: #2d3748;
          position: relative;
        }

        .step-number {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0 auto 1.5rem;
          position: relative;
          z-index: 2;
        }

        .step-content {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          border: 1px solid rgba(102, 126, 234, 0.1);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
        }

        .step-content i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .step-content h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .step-content p {
          color: #718096;
          line-height: 1.6;
        }

        .step-connector {
          position: absolute;
          top: 30px;
          right: -1rem;
          width: 2rem;
          height: 2px;
          background: #667eea;
          z-index: 1;
        }

        /* CTA Section */
        .cta-section {
          padding: 6rem 0;
          background: #f7fafc;
        }

        .cta-card {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 24px;
          padding: 4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
        }

        .cta-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .cta-btn {
          background: white;
          color: #667eea;
          border: none;
          padding: 1.25rem 2.5rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.3);
        }

        .cta-graphic {
          font-size: 6rem;
          opacity: 0.8;
        }

        /* Footer */
        .footer {
          padding: 3rem 0;
          background: #2d3748;
          color: white;
          text-align: center;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .footer p {
          color: #a0aec0;
        }

        /* Animations */
        .fade-up {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease;
        }

        .fade-left {
          opacity: 0;
          transform: translateX(30px);
          transition: all 0.6s ease;
        }

        .visible .fade-up,
        .visible .fade-left {
          opacity: 1;
          transform: translate(0);
        }

        /* Responsive Design */
        @media (max-width: 968px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }

          .hero-title {
            font-size: 2.8rem;
          }

          .hero-stats {
            grid-template-columns: 1fr;
          }

          .steps-container {
            grid-template-columns: 1fr;
          }

          .step-connector {
            display: none;
          }

          .cta-card {
            flex-direction: column;
            text-align: center;
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .nav-menu {
            display: none;
          }

          .hero-title {
            font-size: 2.2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .hero {
            padding: 120px 1rem 60px;
          }

          .card-body {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.8rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .section-header h2 {
            font-size: 2rem;
          }

          .cta-card {
            padding: 2rem;
          }

          .cta-content h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  );
}
