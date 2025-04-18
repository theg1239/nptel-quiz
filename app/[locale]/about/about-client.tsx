"use client";

import { ArrowLeft, ExternalLink, Github, Info, Code, Globe } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-6xl z-10">
        <div className="absolute top-4 left-4">
          <Link href="/">
            <Button variant="ghost" className="text-blue-300 hover:text-blue-100 hover:bg-blue-800/30">
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
          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">About</span>
              <span> NPTEL</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-tr from-[#253EE0] to-[#27BAEC]">
                Prep
              </span>
            </h1>
            <p className="text-base sm:text-lg text-blue-200 mt-1 sm:mt-2 px-4">
              Free and open-source learning resources for NPTEL courses
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-blue-950/50 border-blue-800 p-4 sm:p-6 shadow-xl h-full flex flex-col">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Info className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-bold text-blue-300">Our Mission</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-200 flex-grow">
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
              <Card className="bg-blue-950/50 border-blue-800 p-4 sm:p-6 shadow-xl h-full flex flex-col">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Github className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-bold text-blue-300">Open Source</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-200 mb-3 sm:mb-4 flex-grow">
                  NPTELPrep is an open-source project. We believe in community collaboration 
                  to create better educational resources.
                </p>
                <Link href="https://github.com/theg1239/nptel-quiz" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full flex items-center justify-center text-xs sm:text-sm">
                    <Github className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> View on GitHub
                    <ExternalLink className="ml-1 sm:ml-2 h-2 w-2 sm:h-3 sm:w-3" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-blue-950/50 border-blue-800 p-4 sm:p-6 shadow-xl h-full flex flex-col">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Code className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-bold text-blue-300">NPTELPrep API</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-200 mb-2 sm:mb-3 flex-grow">
                  Our platform is powered by the open-source NPTELPrep API, providing access to NPTEL course data, 
                  questions, and study materials.
                </p>
                <div className="bg-blue-900/50 p-2 sm:p-3 rounded-md border border-blue-700 mb-3">
                  <code className="text-blue-200 text-xs sm:text-sm break-all">https://api.nptelprep.in</code>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <Badge className="bg-blue-600 text-xs sm:text-sm">Free to Use</Badge>
                  <Badge className="bg-blue-600 text-xs sm:text-sm">No API Key Required</Badge>
                </div>
              </Card>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mt-3 sm:mt-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-blue-950/50 border-blue-800 p-4 sm:p-6 shadow-xl h-full">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-bold text-blue-300">Features</h2>
                </div>
                <ul className="list-disc list-inside text-sm sm:text-base text-gray-200 space-y-1 sm:space-y-2">
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
              <Card className="bg-blue-950/50 border-blue-800 p-4 sm:p-6 shadow-xl h-full">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Info className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-bold text-blue-300">Contribute</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-200 mb-3 sm:mb-4">
                  We welcome contributions from the community! Whether you're a developer, 
                  content creator, or NPTEL student, there are many ways to help improve NPTELPrep.
                </p>
                <p className="text-xs sm:text-sm text-gray-300">
                  Submit issues, feature requests, or contribute code through our GitHub repository.
                </p>
              </Card>
            </motion.div>
          </div>
          
          <div className="text-center mt-4 sm:mt-6 text-gray-400 text-xs sm:text-sm">
            <p>© {new Date().getFullYear()} NPTELPrep. This is not affiliated with or endorsed by NPTEL or IIT.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}