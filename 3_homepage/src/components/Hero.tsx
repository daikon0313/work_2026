import './Hero.css'

function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Hello, I'm <span className="highlight">Your Name</span>
        </h1>
        <p className="hero-subtitle">
          Web Developer | Designer | Creator
        </p>
        <p className="hero-description">
          I create beautiful and functional web experiences
        </p>
        <div className="hero-actions">
          <a href="#contact" className="btn btn-primary">Get in Touch</a>
          <a href="#about" className="btn btn-secondary">Learn More</a>
        </div>
      </div>
    </section>
  )
}

export default Hero
