import './Contact.css'

function Contact() {
  return (
    <section id="contact" className="contact">
      <h2 className="section-title">Get In Touch</h2>
      <div className="contact-content">
        <p className="contact-description">
          I'm always open to new opportunities and interesting projects.
          Feel free to reach out if you'd like to connect!
        </p>
        <div className="contact-links">
          <a href="mailto:your.email@example.com" className="contact-link">
            Email
          </a>
          <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="contact-link">
            GitHub
          </a>
          <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="contact-link">
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  )
}

export default Contact
