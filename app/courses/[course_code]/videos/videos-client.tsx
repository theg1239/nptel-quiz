'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Calendar, ChevronLeft, ChevronRight, Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import SpaceLoader from '@/components/SpaceLoader'
import { getCourseMaterials, StudyMaterial } from '@/lib/actions'

export default function VideosClient({ courseCode, courseName }: { courseCode: string; courseName: string }) {
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<StudyMaterial[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const videosPerPage = 8

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const allMaterials = await getCourseMaterials(courseCode)
        // Filter to get only video type materials
        const videoMaterials = allMaterials.filter(material => material.type === 'video')
        setVideos(videoMaterials)
        setLoading(false)
      } catch (error) {
        console.error('Error loading videos:', error)
        setLoading(false)
      }
    }
    
    fetchVideos()
  }, [courseCode])

  // Calculate pagination
  const totalPages = Math.ceil(videos.length / videosPerPage)
  const indexOfLastVideo = currentPage * videosPerPage
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo)

  // Page navigation
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

  if (loading) {
    return <SpaceLoader message="Loading course videos" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link href={`/courses/${courseCode}`}>
            <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
          </Link>
        </div>
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{courseName}</h1>
          <p className="text-xl text-indigo-300">Video Lectures</p>
        </motion.div>
        
        {videos.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-indigo-400" />
            <h2 className="text-2xl font-semibold mb-2">No Videos Available</h2>
            <p className="text-gray-400 mb-4">
              There are no video lectures available for this course yet.
            </p>
            <Link href={`/courses/${courseCode}/materials`}>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Browse Other Materials
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {currentVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-gray-800 bg-opacity-50 border-gray-700 overflow-hidden h-full flex flex-col hover:border-indigo-500 transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <div className="flex items-center text-sm text-gray-400 mb-4">
                        {video.weekNumber && (
                          <div className="flex items-center mr-4">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Week {video.weekNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>~45 mins</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <a 
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium transition-colors"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Video
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
