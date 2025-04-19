'use client';

import { ArrowLeft, ExternalLink, Github, Info, Code, Globe } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

export default function AboutClient() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 text-gray-100">
      <div className="z-10 w-full max-w-6xl">
        <div className="absolute left-4 top-4">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-blue-300 hover:bg-blue-800/30 hover:text-blue-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="mb-4 text-center sm:mb-8">
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                About
              </span>
              <span> NPTEL</span>
              <span className="bg-gradient-to-tr from-[#253EE0] to-[#27BAEC] bg-clip-text text-transparent">
                Prep
              </span>
            </h1>
            <p className="mt-1 px-4 text-base text-blue-200 sm:mt-2 sm:text-lg">
              Free and open-source learning resources for NPTEL courses
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="flex h-full flex-col border-blue-800 bg-blue-950/50 p-4 shadow-xl sm:p-6">
                <div className="mb-3 flex items-center sm:mb-4">
                  <Info className="mr-2 h-5 w-5 text-blue-400 sm:h-6 sm:w-6" />
                  <h2 className="text-lg font-bold text-blue-300 sm:text-xl">Our Mission</h2>
                </div>
                <p className="flex-grow text-sm text-gray-200 sm:text-base">
                  NPTELPrep is dedicated to making NPTEL learning resources accessible to everyone.
                  We provide free practice quizzes, study materials, and resources to help students
                  excel in their NPTEL courses.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="flex h-full flex-col border-blue-800 bg-blue-950/50 p-4 shadow-xl sm:p-6">
                <div className="mb-3 flex items-center sm:mb-4">
                  <Github className="mr-2 h-5 w-5 text-blue-400 sm:h-6 sm:w-6" />
                  <h2 className="text-lg font-bold text-blue-300 sm:text-xl">Open Source</h2>
                </div>
                <p className="mb-3 flex-grow text-sm text-gray-200 sm:mb-4 sm:text-base">
                  NPTELPrep is an open-source project. We believe in community collaboration to
                  create better educational resources.
                </p>
                <Link
                  href="https://github.com/theg1239/nptel-quiz"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="flex w-full items-center justify-center text-xs sm:text-sm">
                    <Github className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" /> View on GitHub
                    <ExternalLink className="ml-1 h-2 w-2 sm:ml-2 sm:h-3 sm:w-3" />
                  </Button>
                </Link>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="flex h-full flex-col border-blue-800 bg-blue-950/50 p-4 shadow-xl sm:p-6">
                <div className="mb-3 flex items-center sm:mb-4">
                  <Code className="mr-2 h-5 w-5 text-blue-400 sm:h-6 sm:w-6" />
                  <h2 className="text-lg font-bold text-blue-300 sm:text-xl">NPTELPrep API</h2>
                </div>
                <p className="mb-2 flex-grow text-sm text-gray-200 sm:mb-3 sm:text-base">
                  Our platform is powered by the open-source NPTELPrep API, providing access to
                  NPTEL course data, questions, and study materials.
                </p>
                <div className="mb-3 rounded-md border border-blue-700 bg-blue-900/50 p-2 sm:p-3">
                  <code className="break-all text-xs text-blue-200 sm:text-sm">
                    https://api.nptelprep.in
                  </code>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <Badge className="bg-blue-600 text-xs sm:text-sm">Free to Use</Badge>
                  <Badge className="bg-blue-600 text-xs sm:text-sm">No API Key Required</Badge>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="h-full border-blue-800 bg-blue-950/50 p-4 shadow-xl sm:p-6">
                <div className="mb-3 flex items-center sm:mb-4">
                  <Globe className="mr-2 h-5 w-5 text-blue-400 sm:h-6 sm:w-6" />
                  <h2 className="text-lg font-bold text-blue-300 sm:text-xl">Features</h2>
                </div>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-200 sm:space-y-2 sm:text-base">
                  <li>Practice quizzes for NPTEL courses</li>
                  <li>Comprehensive study materials</li>
                  <li>Course discussion forums</li>
                  <li>Video lecture access</li>
                  <li>Weekly course content organization</li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="h-full border-blue-800 bg-blue-950/50 p-4 shadow-xl sm:p-6">
                <div className="mb-3 flex items-center sm:mb-4">
                  <Info className="mr-2 h-5 w-5 text-blue-400 sm:h-6 sm:w-6" />
                  <h2 className="text-lg font-bold text-blue-300 sm:text-xl">Contribute</h2>
                </div>
                <p className="mb-3 text-sm text-gray-200 sm:mb-4 sm:text-base">
                  We welcome contributions from the community! Whether you're a developer, content
                  creator, or NPTEL student, there are many ways to help improve NPTELPrep.
                </p>
                <p className="text-xs text-gray-300 sm:text-sm">
                  Submit issues, feature requests, or contribute code through our GitHub repository.
                </p>
              </Card>
            </motion.div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-400 sm:mt-6 sm:text-sm">
            <p>
              © {new Date().getFullYear()} NPTELPrep. This is not affiliated with or endorsed by
              NPTEL or IIT.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
