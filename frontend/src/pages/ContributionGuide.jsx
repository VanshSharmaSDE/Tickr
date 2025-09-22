import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiGithub,
  FiCode,
  FiUsers,
  FiHeart,
  FiStar,
  FiGitPullRequest,
  FiAlertCircle,
  FiZap,
  FiBook,
  FiCheckCircle,
  FiArrowRight,
  FiExternalLink,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const ContributionGuide = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  const contributionTypes = [
    {
      icon: <FiCode className="w-8 h-8" />,
      title: "Code Contributions",
      description: "Submit pull requests, fix bugs, or add new features",
      color: "bg-blue-500",
      items: [
        "Frontend improvements (React.js)",
        "Backend enhancements (Node.js)",
        "Database optimizations",
        "API endpoint additions",
        "UI/UX improvements",
      ],
    },
    {
      icon: <FiAlertCircle className="w-8 h-8" />,
      title: "Bug Reports",
      description: "Help us identify and fix issues",
      color: "bg-red-500",
      items: [
        "Report frontend bugs",
        "Backend error reporting",
        "Performance issues",
        "Security vulnerabilities",
        "Cross-browser compatibility",
      ],
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: "Feature Requests",
      description: "Suggest new features and improvements",
      color: "bg-yellow-500",
      items: [
        "New task management features",
        "Analytics enhancements",
        "Integration suggestions",
        "Mobile app features",
        "Accessibility improvements",
      ],
    },
    {
      icon: <FiBook className="w-8 h-8" />,
      title: "Documentation",
      description: "Improve docs, guides, and tutorials",
      color: "bg-green-500",
      items: [
        "API documentation",
        "Setup guides",
        "User tutorials",
        "Code comments",
        "README improvements",
      ],
    },
  ];

  const stepsByStep = [
    {
      step: 1,
      title: "Fork the Repository",
      description: "Create your own copy of the Tickr repository",
      code: "git clone https://github.com/YOUR_USERNAME/Tickr.git",
      details: [
        'Click the "Fork" button on GitHub',
        "Clone your forked repository",
        "Set up the development environment",
      ],
    },
    {
      step: 2,
      title: "Create a Branch",
      description: "Create a new branch for your contribution",
      code: "git checkout -b feature/your-feature-name",
      details: [
        "Use descriptive branch names",
        "Follow naming conventions",
        "Keep branches focused on single features",
      ],
    },
    {
      step: 3,
      title: "Make Changes",
      description: "Implement your feature or fix",
      code: '# Make your changes\ngit add .\ngit commit -m "Add: your descriptive commit message"',
      details: [
        "Follow coding standards",
        "Write clear commit messages",
        "Test your changes thoroughly",
      ],
    },
    {
      step: 4,
      title: "Submit Pull Request",
      description: "Create a pull request to merge your changes",
      code: "git push origin feature/your-feature-name",
      details: [
        "Create detailed PR description",
        "Reference related issues",
        "Request code review",
      ],
    },
  ];

  const guidelines = [
    {
      title: "Code Style",
      items: [
        "Use ESLint and Prettier for consistent formatting",
        "Follow React best practices and hooks patterns",
        "Write meaningful variable and function names",
        "Add comments for complex logic",
        "Keep functions small and focused",
      ],
    },
    {
      title: "Testing",
      items: [
        "Test your changes locally before submitting",
        "Include unit tests for new features",
        "Ensure existing tests still pass",
        "Test across different browsers",
        "Verify mobile responsiveness",
      ],
    },
    {
      title: "Documentation",
      items: [
        "Update README if adding new features",
        "Document API changes",
        "Add inline code comments",
        "Update installation instructions if needed",
        "Include screenshots for UI changes",
      ],
    },
    {
      title: "Pull Requests",
      items: [
        "Use clear, descriptive PR titles",
        "Explain what changes were made and why",
        "Reference related GitHub issues",
        "Keep PRs focused on a single feature/fix",
        "Be responsive to code review feedback",
      ],
    },
  ];

  const quickLinks = [
    {
      title: "GitHub Repository",
      description: "Main codebase and issue tracking",
      link: "https://github.com/VanshSharmaSDE/Tickr",
      icon: <FiGithub className="w-5 h-5" />,
    },
    {
      title: "Open Issues",
      description: "Current bugs and feature requests",
      link: "https://github.com/VanshSharmaSDE/Tickr/issues",
      icon: <FiAlertCircle className="w-5 h-5" />,
    },
    {
      title: "Pull Requests",
      description: "Active contributions and reviews",
      link: "https://github.com/VanshSharmaSDE/Tickr/pulls",
      icon: <FiGitPullRequest className="w-5 h-5" />,
    },
    {
      title: "Project Board",
      description: "Development roadmap and planning",
      link: "https://github.com/VanshSharmaSDE/Tickr/projects",
      icon: <FiUsers className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src="/logo.png"
                  alt="Tickr Logo"
                  className="w-8 h-8 rounded-lg"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    Tickr
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                    v1.0.0
                  </span>
                </div>
              </Link>
            </div>
            <Link
              to="/"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Contribution Guide
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Help make Tickr better for developers and students worldwide.
              Whether you're a seasoned developer or just starting out, there
              are many ways to contribute to this open-source project!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/VanshSharmaSDE/Tickr"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FiGithub className="w-5 h-5" />
                <span>View on GitHub</span>
              </a>
              <a
                href="https://github.com/VanshSharmaSDE/Tickr/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FiZap className="w-5 h-5" />
                <span>Submit Issue</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ways to Contribute */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ways to Contribute
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Every contribution matters! Here are the main ways you can help
              improve Tickr.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {contributionTypes.map((type, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-primary-500 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 2) }}
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-16 h-16 ${type.color} rounded-lg flex items-center justify-center text-white mr-4`}
                  >
                    {type.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {type.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {type.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-center text-gray-700 dark:text-gray-200"
                    >
                      <FiCheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Step by Step Guide */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Getting Started
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Follow these simple steps to make your first contribution.
            </p>
          </motion.div>

          <div className="space-y-8">
            {stepsByStep.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {step.description}
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                  <ul className="space-y-1">
                    {step.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="flex items-center text-gray-700 dark:text-gray-200 text-sm"
                      >
                        <FiArrowRight className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guidelines */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Contribution Guidelines
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Please follow these guidelines to ensure smooth collaboration.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {guidelines.map((guideline, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {guideline.title}
                </h3>
                <ul className="space-y-3">
                  {guideline.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start text-gray-700 dark:text-gray-200"
                    >
                      <FiCheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Essential links for contributors and collaborators.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 block"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
                    {link.icon}
                  </div>
                  <FiExternalLink className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {link.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {link.description}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Contribute?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join our community of contributors and help make Tickr the best
              task management tool for everyone!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/VanshSharmaSDE/Tickr/fork"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FiGitPullRequest className="w-5 h-5" />
                <span>Fork Repository</span>
              </a>
              <Link
                to="/contact"
                className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FiHeart className="w-5 h-5" />
                <span>Get in Touch</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContributionGuide;
