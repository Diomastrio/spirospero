import React from "react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-secondary py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-4">
            About <span className="text-secondary">Me</span>
          </h1>
          <div className="w-24 h-1 bg-secondary mx-auto"></div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Profile Image */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                <img
                  src="/Novsup.jpg"
                  alt="Miguel - Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-2xl">
                ✨
              </div>
            </div>
          </div>

          {/* Bio Content */}
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-primary">
              Hi, I'm <span className="text-secondary">Miguel</span>
            </h2>

            <p className="text-lg text-primary leading-relaxed">
              I'm a passionate developer who loves creating innovative solutions
              and bringing ideas to life through code. With a keen eye for
              detail and a drive for excellence, I specialize in building modern
              web applications that deliver exceptional user experiences.
            </p>

            <p className="text-lg text-primary leading-relaxed">
              When I'm not coding, you'll find me exploring new technologies,
              contributing to open-source projects, or sharing knowledge with
              the developer community. I believe in continuous learning and
              staying at the forefront of technological advancement.
            </p>

            {/* Skills */}
            <div className="pt-4">
              <h3 className="text-xl font-semibold text-secondary mb-4">
                Skills & Technologies
              </h3>
              <div className="flex flex-wrap gap-3">
                {["React", "JavaScript", "Node.js", "Python", "CSS", "Git"].map(
                  (skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-secondary-content text-primary rounded-full text-sm font-medium hover:bg-neutral transition-colors"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "2+", label: "Years Experience" },
            { number: "50+", label: "Projects Completed" },
            { number: "100+", label: "Commits This Year" },
            { number: "24/7", label: "Learning Mode" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-3xl font-bold text-secondary mb-2">
                {stat.number}
              </div>
              <div className="text-primary text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-primary mb-4">
              Let's Work Together!
            </h3>
            <p className="text-secondary mb-6">
              I'm always open to discussing new opportunities and interesting
              projects.
            </p>
            <button className="bg-secondary-content hover:bg-neutral text-primary font-semibold py-3 px-8 rounded-lg transition-colors">
              Get In Touch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
