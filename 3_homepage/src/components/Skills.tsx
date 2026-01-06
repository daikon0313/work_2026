import './Skills.css'

function Skills() {
  const skills = [
    { category: 'Frontend', items: ['React', 'TypeScript', 'HTML/CSS', 'Tailwind CSS'] },
    { category: 'Backend', items: ['Node.js', 'Express', 'PostgreSQL', 'REST APIs'] },
    { category: 'Tools', items: ['Git', 'VS Code', 'Figma', 'Docker'] },
  ]

  return (
    <section id="skills" className="skills">
      <h2 className="section-title">Skills</h2>
      <div className="skills-grid">
        {skills.map((skillGroup) => (
          <div key={skillGroup.category} className="skill-card">
            <h3 className="skill-category">{skillGroup.category}</h3>
            <ul className="skill-list">
              {skillGroup.items.map((skill) => (
                <li key={skill} className="skill-item">{skill}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills
