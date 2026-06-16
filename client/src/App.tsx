import { useState, useEffect } from 'react'

const GOOGLE_REVIEWS = [
  {
    id: 1,
    name: "manoj menon",
    avatar: "M",
    date: "8 months ago",
    stars: 5,
    text: "This is one of the best farm stays ever compared to any other place around bangalore. No matter how u go there,either couple or with friends or family.....you will for sure get ur weekend fulfilled with peacefulness and happiness as the place is surrounded with full of different plants and trees and various animals to enjoy with. I especially have to mention about the warm welcome and the way there treated us with full care and in a most friendly manner and the owner guided us with all the activities present there and he made us realize that its our own home for that day.Even he stood by our side on helping find auto and arranging while we were returning to our home. I will be giving 10 star to this place but unfortunately only 5 is present. The place reminds u of a old vibe with well maintained place and it was really mind blowing surprise for us after seeing the place.we enjoyed a lot there and we really appreciate the way they carry forward the place and maintain it so well.😊"
  },
  {
    id: 2,
    name: "ananya sharma",
    avatar: "A",
    date: "3 months ago",
    stars: 5,
    text: "A truly magical getaway. The farmhouse is clean, beautifully furnished, and the attention to detail is remarkable. The children had a wonderful time learning about organic vegetable farming and feeding the white horse. The host cooked us traditional organic food that was absolutely mouth-watering. 10/10 highly recommended for families looking to detox from screen time!"
  },
  {
    id: 3,
    name: "david miller",
    avatar: "D",
    date: "1 year ago",
    stars: 5,
    text: "Exceeded all expectations. Sitting on the vine-covered terrace at sunset with a cup of fresh tea was worth the trip alone. The rooms were spotless, comfortable, and had a lovely vintage aesthetic with modern facilities. The staff treats you like family. Will definitely return next winter!"
  }
];

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)

  const nextReview = () => {
    setActiveReviewIndex((prevIndex) => (prevIndex + 1) % GOOGLE_REVIEWS.length)
  }

  const prevReview = () => {
    setActiveReviewIndex((prevIndex) => (prevIndex - 1 + GOOGLE_REVIEWS.length) % GOOGLE_REVIEWS.length)
  }

  // Track page scroll to shrink the navigation bar slightly
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      {/* Header & Sticky Navbar */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo-container">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22h20" />
            <path d="M19 22V11l-7-5-7 5v11" />
            <path d="M12 2a15 15 0 0 1 5 10c0 4-3 6-5 6s-5-2-5-6A15 15 0 0 1 12 2z" fill="currentColor" opacity="0.15" />
            <path d="M12 2v16" />
          </svg>
          <div>
            <span className="logo-text">Cocopreeth</span>
            <span className="logo-subtext">Farm House</span>
          </div>
        </div>

        <nav>
          <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
            <li><a href="#home" className="nav-link active" onClick={() => setIsMenuOpen(false)}>Home</a></li>
            <li><a href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</a></li>
            <li><a href="#stay" className="nav-link" onClick={() => setIsMenuOpen(false)}>Stay</a></li>
            <li><a href="#gallery" className="nav-link" onClick={() => setIsMenuOpen(false)}>Gallery</a></li>
            <li><a href="#experiences" className="nav-link" onClick={() => setIsMenuOpen(false)}>Experiences</a></li>
            <li><a href="#blog" className="nav-link" onClick={() => setIsMenuOpen(false)}>Blog</a></li>
            <li><a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
          </ul>
        </nav>

        <button className="btn-book">BOOK NOW</button>

        <div className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Escape. Relax. Reconnect.</h1>
          <p>
            Experience the perfect blend of nature, comfort and tranquility at Cocopreeth farmhouse. Slow down, breathe the clean air, and rediscover rural serenity.
          </p>
          <button className="btn-hero">
            BOOK YOUR STAY
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </section>

      {/* Highlights / Features Section */}
      <section className="highlights">
        <div className="highlight-card">
          <svg className="highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z" />
            <path d="M9.8 6.1C12 8 15 11 15 16" />
          </svg>
          <h3 className="highlight-title">Natural Beauty</h3>
          <p className="highlight-desc">Peaceful surroundings and lush green orchard views.</p>
        </div>

        <div className="highlight-card">
          <svg className="highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <h3 className="highlight-title">Comfortable Stay</h3>
          <p className="highlight-desc">Well-furnished rooms combining rustic charm and modern amenities.</p>
        </div>

        <div className="highlight-card">
          <svg className="highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18M3 12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2M3 12l2-6h14l2 6" />
            <path d="M14 6a4 4 0 0 0-8 0" />
            <path d="M8 14v4M12 14v4M16 14v4" />
          </svg>
          <h3 className="highlight-title">Farm Fresh Food</h3>
          <p className="highlight-desc">Savor healthy, home-cooked organic meals harvested from our fields.</p>
        </div>

        <div className="highlight-card">
          <svg className="highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 22h14" />
            <path d="M17 18a5 5 0 0 0-10 0" />
            <path d="M12 2c0 4-3 5-3 9a3 3 0 0 0 6 0c0-4-3-5-3-9z" />
          </svg>
          <h3 className="highlight-title">Memorable Experiences</h3>
          <p className="highlight-desc">Enjoy nature trails, bird watching, and bonfires with loved ones.</p>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about">
        <div className="about-image-wrapper">
          <img src="/images/about_terrace.png" alt="Cocopreeth Patio Terrace" className="about-image" />
        </div>
        <div className="about-content">
          <span className="section-subtitle">About Us</span>
          <h2 className="section-title">A Farm House Like No Other</h2>
          <p className="about-text">
            At Cocopreeth Farm House, we offer more than just a getaway. It's a sanctuary where you can escape the noise of city life, breathe pure mountain air, and engage with the peaceful rhythms of agricultural life. Whether you are strolling in our organic plantation, reading on our scenic terrace, or tasting pure farm-fresh ingredients, Cocopreeth is where lasting memories are grown.
          </p>
        </div>
      </section>

      {/* Experiences / Activities Section */}
      <section id="experiences" className="experiences-section">
        <span className="section-subtitle">Experiences</span>
        <h2 className="section-title">Adventure. Fun. Memories.</h2>

        <div className="experiences-grid">
          {/* Card 1 */}
          <div className="experience-card" style={{ backgroundImage: "url('/images/activity_barbecue.png')" }}>
            <div className="experience-overlay">
              <div className="experience-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/>
                </svg>
              </div>
              <div className="experience-content">
                <h3 className="experience-title">Barbaque & Camp Fire</h3>
                <p className="experience-desc">Delicious barbeque, cozy conversations and warm campfire nights.</p>
                <a href="#booking" className="btn-experience-learn">
                  LEARN MORE
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="experience-card" style={{ backgroundImage: "url('/images/activity_biking.png')" }}>
            <div className="experience-overlay">
              <div className="experience-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="5.5" cy="17.5" r="2.5" />
                  <circle cx="18.5" cy="17.5" r="2.5" />
                  <path d="M15 12.5 12 9 8.5 12H5" />
                  <path d="M12 9V5h3" />
                  <path d="m12 9-2.5 6" />
                </svg>
              </div>
              <div className="experience-content">
                <h3 className="experience-title">Mountain Biking</h3>
                <p className="experience-desc">Hit the trails and feel the thrill of mountain biking through scenic routes.</p>
                <a href="#booking" className="btn-experience-learn">
                  LEARN MORE
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="experience-card" style={{ backgroundImage: "url('/images/activity_plantation.png')" }}>
            <div className="experience-overlay">
              <div className="experience-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z" />
                  <path d="M9.8 6.1C12 8 15 11 15 16" />
                </svg>
              </div>
              <div className="experience-content">
                <h3 className="experience-title">Plantation Tour</h3>
                <p className="experience-desc">Explore our lush organic plantations and learn about sustainable farming.</p>
                <a href="#booking" className="btn-experience-learn">
                  LEARN MORE
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="experience-card" style={{ backgroundImage: "url('/images/activity_nature_walk.png')" }}>
            <div className="experience-overlay">
              <div className="experience-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <div className="experience-content">
                <h3 className="experience-title">Nature Walks</h3>
                <p className="experience-desc">Discover local wildlife and bird species on guided walking trails.</p>
                <a href="#booking" className="btn-experience-learn">
                  LEARN MORE
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="gallery-section">
        <span className="section-subtitle">Our Gallery</span>
        <h2 className="section-title">Moments from Our Farm House</h2>

        <div className="gallery-grid">
          <div className="gallery-item">
            <img src="/images/gallery_farmhouse.png" alt="Scenic Farmhouse" className="gallery-img" />
            <div className="gallery-overlay">
              <h4 className="gallery-caption">The Main House</h4>
              <span className="gallery-sub">Rustic Architecture</span>
            </div>
          </div>

          <div className="gallery-item">
            <img src="/images/gallery_farming.png" alt="Organic farming beds" className="gallery-img" />
            <div className="gallery-overlay">
              <h4 className="gallery-caption">Organic Produce</h4>
              <span className="gallery-sub">Farm to Table</span>
            </div>
          </div>

          <div className="gallery-item">
            <img src="/images/gallery_bedroom.png" alt="Cozy bedroom interior" className="gallery-img" />
            <div className="gallery-overlay">
              <h4 className="gallery-caption">Comfortable Rooms</h4>
              <span className="gallery-sub">Modern Cozy Stay</span>
            </div>
          </div>

          <div className="gallery-item">
            <img src="/images/gallery_tea.png" alt="Outdoor table setup" className="gallery-img" />
            <div className="gallery-overlay">
              <h4 className="gallery-caption">Sunrise Breakfast</h4>
              <span className="gallery-sub">Scenic Dining</span>
            </div>
          </div>

          <div className="gallery-item">
            <img src="/images/gallery_horse.png" alt="White horse pasture" className="gallery-img" />
            <div className="gallery-overlay">
              <h4 className="gallery-caption">Meadow Companions</h4>
              <span className="gallery-sub">Horse Stable</span>
            </div>
          </div>
        </div>

        <button className="btn-gallery">VIEW MORE PHOTOS</button>
      </section>

      {/* Google Reviews Section */}
      <section className="reviews-section">
        <div className="reviews-header">
          <div className="google-title-container">
            <svg className="google-g-icon" viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <h2 className="google-title">Google Reviews</h2>
          </div>
          
          <div className="rating-summary">
            <div className="stars-container">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="rating-number">4.9</span>
            <span className="rating-count">(2303 reviews)</span>
          </div>

          <p className="recent-reviews-subtitle">
            Recent reviews shown below. <a href="https://google.com" target="_blank" rel="noopener noreferrer">Click here for more reviews</a>
          </p>
        </div>

        <div className="reviews-carousel-container">
          <button className="carousel-arrow" onClick={prevReview} aria-label="Previous review">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div key={activeReviewIndex} className="review-card animate-fade">
            <div className="review-user">
              <div className="user-avatar">{GOOGLE_REVIEWS[activeReviewIndex].avatar}</div>
              <div className="user-meta">
                <span className="user-name">{GOOGLE_REVIEWS[activeReviewIndex].name}</span>
                <span className="review-date">{GOOGLE_REVIEWS[activeReviewIndex].date}</span>
              </div>
            </div>
            
            <div className="review-stars">
              {[...Array(GOOGLE_REVIEWS[activeReviewIndex].stars)].map((_, i) => (
                <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>

            <p className="review-text">
              "{GOOGLE_REVIEWS[activeReviewIndex].text}"
            </p>
          </div>

          <button className="carousel-arrow" onClick={nextReview} aria-label="Next review">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Location / Getting Here Section */}
      <section id="location" className="location-section">
        <div className="location-content">
          <span className="location-subtitle">Farm Location</span>
          <h2 className="location-title">Getting here</h2>
          <p className="location-text">
            Cocopreeth Farm House, Near Green Hills, Countryside Road, Wayallur, India - 123456
          </p>
          <a
            href="https://www.google.com/maps?q=10.945198,76.785408"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-direction"
          >
            <span className="direction-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
            <span className="direction-text">Get Direction</span>
          </a>
        </div>
        <div className="location-map">
          <iframe
            src="https://maps.google.com/maps?q=10.945198,76.785408&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Cocopreeth Farm House Location Map"
          ></iframe>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="contact" className="footer">
        <div className="footer-grid">
          <div className="footer-col-about">
            <div className="logo-container">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 22h20" />
                <path d="M19 22V11l-7-5-7 5v11" />
                <path d="M12 2a15 15 0 0 1 5 10c0 4-3 6-5 6s-5-2-5-6A15 15 0 0 1 12 2z" fill="currentColor" opacity="0.15" />
                <path d="M12 2v16" />
              </svg>
              <div>
                <span className="logo-text">Cocopreeth</span>
                <span className="logo-subtext">Farm House</span>
              </div>
            </div>
            <p>
              A peaceful farmhouse getaway surrounded by nature, offering ultimate relaxation, plantation tours, organic culinary delights, and unforgettable experiences.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://instagram.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://youtube.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home" className="footer-link">Home</a></li>
              <li><a href="#about" className="footer-link">About Us</a></li>
              <li><a href="#stay" className="footer-link">Stay</a></li>
              <li><a href="#experiences" className="footer-link">Experiences</a></li>
              <li><a href="#gallery" className="footer-link">Gallery</a></li>
              <li><a href="#contact" className="footer-link">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Experiences</h4>
            <ul className="footer-links">
              <li><a href="#experiences" className="footer-link">Plantation Tour</a></li>
              <li><a href="#experiences" className="footer-link">Nature Walks</a></li>
              <li><a href="#experiences" className="footer-link">Bonfire Nights</a></li>
              <li><a href="#experiences" className="footer-link">Outdoor Games</a></li>
              <li><a href="#experiences" className="footer-link">Organic Farming</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Contact Us</h4>
            <div className="contact-info">
              <div className="contact-item">
                <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="contact-text">+91 98765 43210</span>
              </div>
              <div className="contact-item">
                <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="contact-text">info@cocopreeth.com</span>
              </div>
              <div className="contact-item">
                <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="contact-text">
                  Cocopreeth Farm House,<br />
                  Near Green Hills, Countryside Road,<br />
                  Wayallur, India - 123456
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="copyright">© 2026 Cocopreeth Farm House. All rights reserved.</span>
        </div>

        {/* Decorative corner leaves SVG */}
        <svg className="decorative-leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 3 1.5 6 4 8l6-6 6 6c2.5-2 4-5 4-8 0-5.5-4.5-10-10-10z" />
          <path d="M12 2v10" />
          <path d="M12 8c1-1 3-2 3-2M12 6c-1-1-3-2-3-2M12 10c2-1.5 4-1.5 4-1.5" />
        </svg>
      </footer>
    </>
  )
}

export default App
