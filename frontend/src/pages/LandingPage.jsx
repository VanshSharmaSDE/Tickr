import React from "react";
import { motion } from "framer-motion";
import {
  FiSmartphone,
  FiTarget,
  FiTrendingUp,
  FiCalendar,
  FiBarChart,
  FiCheckCircle,
  FiDownload,
  FiStar,
  FiUsers,
  FiZap,
  FiShield,
  FiClock,
  FiActivity,
  FiAward,
  FiGrid,
  FiGithub,
  FiCode,
  FiHeart,
  FiGitPullRequest,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

const LandingPage = () => {
  const { animationsEnabled } = useSettings();

  // Helper function to conditionally apply animation props
  const getAnimationProps = (animationConfig = {}) => {
    if (!animationsEnabled) {
      return {}; // Return empty object to disable animations
    }
    return animationConfig;
  };

  const features = [
    {
      icon: <FiTarget className="w-8 h-8" />,
      title: "Smart Task Management",
      description:
        "Organize your tasks with intelligent prioritization and custom categories.",
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Progress Analytics",
      description:
        "Track your productivity with detailed analytics and performance insights.",
    },
    {
      icon: <FiCalendar className="w-8 h-8" />,
      title: "Daily Planning",
      description:
        "Plan your day effectively with calendar integration and reminders.",
    },
    {
      icon: <FiBarChart className="w-8 h-8" />,
      title: "Performance Metrics",
      description:
        "Visualize your progress with beautiful charts and completion trends.",
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: "Streak Tracking",
      description:
        "Build momentum with streak counters and achievement badges.",
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Secure & Private",
      description:
        "Your data is encrypted and stored securely with privacy-first approach.",
    },
  ];


  const stats = [
    {
      label: "Project Status",
      value: "Live",
      icon: <FiUsers className="w-6 h-6" />,
    },
    {
      label: "Views",
      value: "Card & List",
      icon: <FiCheckCircle className="w-6 h-6" />,
    },
    {
      label: "Features",
      value: "Analytics",
      icon: <FiStar className="w-6 h-6" />,
    },
    {
      label: "Theme",
      value: "Dark Mode",
      icon: <FiClock className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-2"
              {...getAnimationProps({
                initial: { opacity: 0, x: -20 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: 0.5 },
              })}
            >
              {/* Logo and brand */}
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
            </motion.div>

            <motion.div
              className="flex items-center space-x-4"
              {...getAnimationProps({
                initial: { opacity: 0, x: 20 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: 0.5, delay: 0.2 },
              })}
            >
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              {...getAnimationProps({
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.7 },
              })}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                From Problem To
                <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  {" "}
                Solution
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-6 leading-relaxed">
                Like many developers and students, I struggled with managing
                daily tasks. Existing tools were either too complex, filled with
                unnecessary features, or hard to stay consistent with. So I
                built my own solution.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <motion.button
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl cursor-not-allowed"
                  disabled
                  {...getAnimationProps({
                    whileHover: { scale: 1.02 },
                    whileTap: { scale: 0.98 },
                  })}
                >
                  <FiDownload className="w-5 h-5" />
                  <span>Android App (soon)</span>
                </motion.button>

                <motion.button
                  className="border-2 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 dark:hover:text-gray-900 transition-all"
                  {...getAnimationProps({
                    whileHover: { scale: 1.05 },
                    whileTap: { scale: 0.95 },
                  })}
                >
                  <Link to="/register" className="flex items-center space-x-2">
                    <FiActivity className="w-5 h-5" />
                    <span>Try Web Version</span>
                  </Link>
                </motion.button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    {...getAnimationProps({
                      initial: { opacity: 0, y: 30 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.5, delay: 1 + index * 0.1 },
                    })}
                  >
                    <div className="flex justify-center mb-2 text-blue-500">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* App Preview */}
            <motion.div
              className="relative"
              {...getAnimationProps({
                initial: { opacity: 0, x: 50 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: 0.7, delay: 0.3 },
              })}
            >
              <div className="relative mx-auto w-80 h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-4 shadow-2xl">
                {/* Phone Frame */}
                <div className="w-full h-full bg-white dark:bg-gray-100 rounded-2xl overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-8 flex items-center justify-between px-4">
                    <span className="text-white text-xs font-medium">
                      9:41 AM
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* App Interface */}
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800">
                        Today's Tasks
                      </h3>
                      <FiTarget className="w-5 h-5 text-blue-500" />
                    </div>

                    {/* Sample Tasks */}
                    {[
                      { title: "Review project proposal", completed: true },
                      { title: "Team meeting at 2 PM", completed: false },
                      { title: "Update documentation", completed: false },
                      { title: "Plan weekend trip", completed: true },
                    ].map((task, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          task.completed ? "bg-green-50" : "bg-gray-50"
                        }`}
                        {...getAnimationProps({
                          initial: { opacity: 0, x: -20 },
                          animate: { opacity: 1, x: 0 },
                          transition: {
                            duration: 0.5,
                            delay: 1.5 + index * 0.2,
                          },
                        })}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            task.completed
                              ? "bg-green-500 border-green-500"
                              : "border-gray-300"
                          } flex items-center justify-center`}
                        >
                          {task.completed && (
                            <FiCheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            task.completed
                              ? "line-through text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          {task.title}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg"
                {...getAnimationProps({
                  initial: { opacity: 0, scale: 0 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.5, delay: 1.2 },
                })}
              >
                <FiAward className="w-6 h-6 text-yellow-500" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg"
                {...getAnimationProps({
                  initial: { opacity: 0, scale: 0 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.5, delay: 1.4 },
                })}
              >
                <FiTrendingUp className="w-6 h-6 text-green-500" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            {...getAnimationProps({
              initial: { opacity: 0, y: 30 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.6 },
            })}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
             The Solution: Tickr
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
              A fullstack task management solution built to solve real developer and student productivity challenges.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-primary-200 dark:border-gray-700"
              {...getAnimationProps({
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.7, delay: 0.2 },
              })}
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Key Features
                  </h3>
                  <div className="space-y-4">
                    <motion.div
                      className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                      {...getAnimationProps({
                        initial: { opacity: 0, x: -20 },
                        animate: { opacity: 1, x: 0 },
                        transition: { duration: 0.5, delay: 0.4 },
                      })}
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                        <FiCheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Simple & Minimal Interface</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Clean design without overwhelming features</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      {...getAnimationProps({
                        initial: { opacity: 0, x: -20 },
                        animate: { opacity: 1, x: 0 },
                        transition: { duration: 0.5, delay: 0.5 },
                      })}
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                        <FiGrid className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Card View & List View</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Switch between visual layouts as needed</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                      {...getAnimationProps({
                        initial: { opacity: 0, x: -20 },
                        animate: { opacity: 1, x: 0 },
                        transition: { duration: 0.5, delay: 0.6 },
                      })}
                    >
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                        <FiBarChart className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Built-in Analytics</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Track progress with visual insights</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      {...getAnimationProps({
                        initial: { opacity: 0, x: -20 },
                        animate: { opacity: 1, x: 0 },
                        transition: { duration: 0.5, delay: 0.7 },
                      })}
                    >
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-4">
                        <FiShield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Dark Mode Support</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Modern feel with theme options</p>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Why I Built This
                  </h3>
                  <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <motion.p
                      {...getAnimationProps({
                        initial: { opacity: 0, y: 20 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, delay: 0.8 },
                      })}
                    >
                      <strong className="text-red-500">Problem:</strong> Existing task management tools were either too complex for simple personal use, filled with features I didn't need, or hard to stay consistent with.
                    </motion.p>
                    
                    <motion.p
                      {...getAnimationProps({
                        initial: { opacity: 0, y: 20 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, delay: 0.9 },
                      })}
                    >
                      <strong className="text-green-500">Solution:</strong> "If the existing tools don't fit me, why not create one that does?" So I turned this problem into a project and built my own tool.
                    </motion.p>

                    <motion.div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-lg text-white mt-6"
                      {...getAnimationProps({
                        initial: { opacity: 0, y: 20 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, delay: 1.0 },
                      })}
                    >
                      <p className="font-semibold mb-2">The Result</p>
                      <p className="text-sm">
                        This may not be a huge product, but it represents how we as developers can solve real-life problems with our skills, and sometimes even help others who face the same challenges.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            {...getAnimationProps({
              initial: { opacity: 0, y: 30 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.6 },
            })}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Stay Productive
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powerful features designed to help you manage tasks, track
              progress, and achieve your goals with ease.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-gray-50 dark:bg-gray-700 p-8 rounded-2xl hover:shadow-lg transition-all duration-300"
                {...getAnimationProps({
                  initial: { opacity: 0, y: 50 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.6, delay: index * 0.1 },
                  whileHover: { y: -5 },
                })}
              >
                <div className="text-blue-500 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source & Contribution */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            {...getAnimationProps({
              initial: { opacity: 0, y: 30 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.6 },
            })}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Want to Contribute?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The source is open to everyone! Join the community and help make Tickr even better for developers and students worldwide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center border-2 border-transparent hover:border-primary-500 transition-all duration-300"
              {...getAnimationProps({
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, delay: 0.1 },
                whileHover: { y: -5 }
              })}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiGithub className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Star on GitHub
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Show your support by starring the repository and following the project's progress.
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center border-2 border-transparent hover:border-green-500 transition-all duration-300"
              {...getAnimationProps({
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, delay: 0.2 },
                whileHover: { y: -5 }
              })}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Contribute Code
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Submit pull requests, fix bugs, or add new features. Every contribution counts!
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center border-2 border-transparent hover:border-purple-500 transition-all duration-300"
              {...getAnimationProps({
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, delay: 0.3 },
                whileHover: { y: -5 }
              })}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Join Community
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect with other developers, share ideas, and discuss new features.
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center border-2 border-transparent hover:border-red-500 transition-all duration-300"
              {...getAnimationProps({
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, delay: 0.4 },
                whileHover: { y: -5 }
              })}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Spread the Word
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Help others discover Tickr by sharing your experience and feedback.
              </p>
            </motion.div>
          </div>

          {/* Call to Action for Contributors */}
          <motion.div
            className="mt-16 text-center"
            {...getAnimationProps({
              initial: { opacity: 0, y: 30 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.6, delay: 0.5 },
            })}
          >
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-8 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Make an Impact?
              </h3>
              <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                Whether you're a seasoned developer or just starting out, there's a place for you in the Tickr community. Let's build something amazing together!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://github.com/VanshSharmaSDE/Tickr"
                  className="bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all inline-flex items-center justify-center"
                >
                  <FiGithub className="w-5 h-5 mr-2" />
                  View on GitHub
                </a>
                <Link
                  to="/contribute"
                  className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-all inline-flex items-center justify-center"
                >
                  <FiCode className="w-5 h-5 mr-2" />
                  Contributing Guide
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                  <img
                    src="/logo.png"
                    alt="Tickr Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-bold">Tickr</span>
              </div>
              <p className="text-gray-400 mb-4">
                A fullstack task management solution built to solve real
                developer and student productivity challenges. From personal
                problem to open solution.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Project</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://github.com/VanshSharmaSDE/Tickr" target="_blank" className="hover:text-white transition-colors">
                    Star on GitHub
                  </a>
                </li>
                <li>
                  <Link
                    to="/contribute"
                    className="hover:text-white transition-colors"
                  >
                    Contribution Guide
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="hover:text-white transition-colors"
                  >
                    Try Web Version
                  </Link>
                </li>
                <li>
                  <span className="text-gray-500">
                    Android (In Development)
                  </span>
                </li>
                <li>
                  <span className="text-gray-500">
                    Desktop (Coming Soon)
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Developer</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://www.linkedin.com/in/vansh-vyas-b7792b258/" target="_blank" className="hover:text-white transition-colors">
                    LinkedIn Profile
                  </a>
                </li>
                <li>
                  <a href="https://github.com/VanshSharmaSDE" target="_blank" className="hover:text-white transition-colors">
                    GitHub Profile
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact Me
                  </Link>
                </li>
                <li>
                  <a href="https://www.linkedin.com/feed/update/urn:li:activity:7371928560506392578/" target="_blank" className="hover:text-white transition-colors">
                    Project Story
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <span className="text-green-400">Card & List Views</span>
                </li>
                <li>
                  <span className="text-green-400">Progress Analytics</span>
                </li>
                <li>
                  <span className="text-green-400">Dark Mode</span>
                </li>
                <li>
                  <span className="text-green-400">Minimal Interface</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 Tickr. Built by a developer who faced the same task
              management struggles. Made with ❤️ to help others stay productive.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
