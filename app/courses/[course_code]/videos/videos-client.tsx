'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Calendar, ChevronLeft, ChevronRight, Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { getCourseMaterials, StudyMaterial } from '@/lib/actions'

const scrollbarHideStyles = `
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer and Edge */
  scrollbar-width: none;     /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;             /* Chrome, Safari and Opera */
}
`

const placeholderThumbnail = "https://sdmntprwestus.oaiusercontent.com/files/00000000-7e38-6230-a298-8c91b4a8a7d4/raw?se=2025-04-16T02%3A34%3A55Z&sp=r&sv=2024-08-04&sr=b&scid=217b454a-87e5-5b0c-a27d-80dca3c00ea5&skoid=51916beb-8d6a-49b8-8b29-ca48ed86557e&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-15T08%3A46%3A43Z&ske=2025-04-16T08%3A46%3A43Z&sks=b&skv=2024-08-04&sig=PLI8r1cHOW8hIh%2BfNmbnpxrvfl2IN0U9CgV5nzXMoUA%3D";

export default function VideosClient({ courseCode, courseName }: { courseCode: string; courseName: string }) {
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<StudyMaterial[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedVideo, setSelectedVideo] = useState<StudyMaterial | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const videosPerPage = 5

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const allMaterials = await getCourseMaterials(courseCode)
        // Filter for video materials
        const videoMaterials = allMaterials.filter(material => material.type === 'video')
        // Sort videos by week number (if weekNumber is null, place them at the end)
        videoMaterials.sort((a, b) => {
          if (a.weekNumber != null && b.weekNumber != null) {
            return a.weekNumber - b.weekNumber
          }
          if (a.weekNumber == null) return 1
          if (b.weekNumber == null) return -1
          return 0
        })

        setVideos(videoMaterials)
        if (videoMaterials.length > 0) {
          setSelectedVideo(videoMaterials[0])
        }
        setLoading(false)
      } catch (error) {
        console.error('Error loading videos:', error)
        setLoading(false)
      }
    }
    
    fetchVideos()
  }, [courseCode])

  const totalPages = Math.ceil(videos.length / videosPerPage)
  const indexOfLastVideo = currentPage * videosPerPage
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setIsAnimating(true)
      setCurrentPage(prev => prev + 1)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setIsAnimating(true)
      setCurrentPage(prev => prev - 1)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  const getVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
      /(?:youtu\.be\/)([^"&?\/\s]{11})/i,
      /(?:youtube\.com\/embed\/)([^"&?\/\s]{11})/i
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const getVideoEmbedUrl = (url: string) => {
    const videoId = getVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getVideoThumbnail = (url: string) => {
    const videoId = getVideoId(url);
    return videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : placeholderThumbnail;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyles }} />
      <div className="h-screen flex flex-col">
        <div className="flex-none px-4 py-3 md:px-6 md:py-4">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between gap-4">
              <Link href={`/courses/${courseCode}`}>
                <Button variant="ghost" className="text-gray-300 hover:bg-gray-800">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {/* On mobile, hide the text and only show the icon */}
                  <span className="hidden md:inline">Back to Course</span>
                </Button>
              </Link>
              <h1 className="text-xl md:text-2xl font-bold truncate">{courseName}</h1>
              <div className="w-[88px]" />
            </div>
          </div>
        </div>

        {/* Changed overflow-hidden to overflow-y-auto to enable scrolling */}
        <div className="flex-1 overflow-y-auto">
          <div className="h-full max-w-[1400px] mx-auto">
            {videos.length === 0 ? (
              <div className="h-full flex items-center justify-center p-4">
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-8 text-center max-w-md">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-indigo-400" />
                  <h2 className="text-2xl font-semibold mb-2">No Videos Available</h2>
                  <p className="text-gray-400 mb-4">
                    They may just be loading so hang on
                  </p>
                  <Link href={`/courses/${courseCode}/materials`}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Browse Other Materials
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col lg:flex-row pb-0">
                <div className="flex-1 p-4 md:p-6 pb-0 md:pb-6 flex flex-col">
                  {selectedVideo && (
                    <div className="flex flex-col flex-grow">
                      <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg">
                        <div className="aspect-video">
                          <iframe
                            src={getVideoEmbedUrl(selectedVideo.url || '')}
                            className="absolute inset-0 w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            style={{ border: 0 }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 bg-gray-800/50 p-4 rounded-lg flex-grow">
                        <h2 className="text-lg md:text-xl font-semibold mb-2">{selectedVideo.title}</h2>
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          {selectedVideo.weekNumber && (
                            <div className="flex items-center mr-4">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Week {selectedVideo.weekNumber}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm">{selectedVideo.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full lg:w-[400px] flex-none border-3 border-gray-700/50">
                  <div className="h-3/2 pb-4 flex flex-col bg-gray-800/50">
                    <div className="flex-none p-4 border-b border-gray-700/50">
                      <h3 className="text-lg font-semibold">Course Videos</h3>
                    </div>
                    <div className={`flex-1 overflow-y-auto ${isAnimating ? 'overflow-hidden' : 'scrollbar-hide'}`}>
                      <div className="p-3 space-y-2">
                        {currentVideos.map((video, index) => {
                          const thumbnail = getVideoThumbnail(video.url || '')
                          const isSelected = selectedVideo?.id === video.id
                          
                          return (
                            <motion.div
                              key={video.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <div 
                                className={`w-full rounded-lg overflow-hidden ${
                                  isSelected ? 'ring-2 ring-indigo-500 bg-indigo-600/20' : 'hover:bg-gray-700/50'
                                }`}
                              >
                                <button
                                  className="w-full text-left p-2 focus:outline-none"
                                  onClick={() => setSelectedVideo(video)}
                                >
                                  <div className="flex items-start">
                                    <div className="w-32 h-20 flex-shrink-0 bg-gray-900 rounded overflow-hidden relative group">
                                      <img 
                                        src={thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="h-6 w-6 text-white" />
                                      </div>
                                    </div>
                                    <div className="flex-grow min-w-0 ml-3 py-1">
                                      <h4 className="font-medium text-sm mb-1 line-clamp-2">{video.title}</h4>
                                      <div className="flex items-center text-xs text-gray-400">
                                        {video.weekNumber && (
                                          <div className="flex items-center mr-2">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            <span>Week {video.weekNumber}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex-none p-5 border-t border-gray-700/50">
                        <div className="flex justify-between items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className="border-gray-700 text-gray-300 hover:bg-gray-700"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <span className="text-sm text-gray-400">
                            {currentPage} / {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="border-gray-700 text-gray-300 hover:bg-gray-700"
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
