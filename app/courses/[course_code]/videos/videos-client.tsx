'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Calendar, ChevronLeft, ChevronRight, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getCourseMaterials, StudyMaterial } from '@/lib/actions';

const scrollbarHideStyles = `
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer and Edge */
  scrollbar-width: none;     /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;             /* Chrome, Safari and Opera */
}
`;

const placeholderThumbnail = 'https://nptelprep.in/assets/thumbnail.png';

export default function VideosClient({
  courseCode,
  courseName,
}: {
  courseCode: string;
  courseName: string;
}) {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<StudyMaterial[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<StudyMaterial | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const videosPerPage = 5;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const allMaterials = await getCourseMaterials(courseCode);
        // Filter for video materials
        const videoMaterials = allMaterials.filter(material => material.type === 'video');
        // Sort videos by week number (if weekNumber is null, place them at the end)
        videoMaterials.sort((a, b) => {
          if (a.weekNumber != null && b.weekNumber != null) {
            return a.weekNumber - b.weekNumber;
          }
          if (a.weekNumber == null) return 1;
          if (b.weekNumber == null) return -1;
          return 0;
        });

        setVideos(videoMaterials);
        if (videoMaterials.length > 0) {
          setSelectedVideo(videoMaterials[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading videos:', error);
        setLoading(false);
      }
    };

    fetchVideos();
  }, [courseCode]);

  const totalPages = Math.ceil(videos.length / videosPerPage);
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setIsAnimating(true);
      setCurrentPage(prev => prev + 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setIsAnimating(true);
      setCurrentPage(prev => prev - 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const getVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
      /(?:youtu\.be\/)([^"&?\/\s]{11})/i,
      /(?:youtube\.com\/embed\/)([^"&?\/\s]{11})/i,
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
      <div className="flex h-screen flex-col">
        <div className="flex-none px-4 py-3 md:px-6 md:py-4">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex items-center justify-between gap-4">
              <Link href={`/courses/${courseCode}`}>
                <Button variant="ghost" className="text-gray-300 hover:bg-gray-800">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {/* On mobile, hide the text and only show the icon */}
                  <span className="hidden md:inline">Back to Course</span>
                </Button>
              </Link>
              <h1 className="truncate text-xl font-bold md:text-2xl">{courseName}</h1>
              <div className="w-[88px]" />
            </div>
          </div>
        </div>

        {/* Changed overflow-hidden to overflow-y-auto to enable scrolling */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto h-full max-w-[1400px]">
            {videos.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4">
                <div className="max-w-md rounded-lg bg-gray-800 bg-opacity-50 p-8 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-indigo-400" />
                  <h2 className="mb-2 text-2xl font-semibold">No Videos Available</h2>
                  <p className="mb-4 text-gray-400">They may just be loading so hang on</p>
                  <Link href={`/courses/${courseCode}/materials`}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Browse Other Materials
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col pb-0 lg:flex-row">
                <div className="flex flex-1 flex-col p-4 pb-0 md:p-6 md:pb-6">
                  {selectedVideo && (
                    <div className="flex flex-grow flex-col">
                      <div className="relative w-full overflow-hidden rounded-lg bg-black shadow-lg">
                        <div className="aspect-video">
                          <iframe
                            src={getVideoEmbedUrl(selectedVideo.url || '')}
                            className="absolute inset-0 h-full w-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            style={{ border: 0 }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex-grow rounded-lg bg-gray-800/50 p-4">
                        <h2 className="mb-2 text-lg font-semibold md:text-xl">
                          {selectedVideo.title}
                        </h2>
                        <div className="mb-2 flex items-center text-sm text-gray-400">
                          {selectedVideo.weekNumber && (
                            <div className="mr-4 flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              <span>Week {selectedVideo.weekNumber}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">{selectedVideo.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-3 w-full flex-none border-gray-700/50 lg:w-[400px]">
                  <div className="h-3/2 flex flex-col bg-gray-800/50 pb-4">
                    <div className="flex-none border-b border-gray-700/50 p-4">
                      <h3 className="text-lg font-semibold">Course Videos</h3>
                    </div>
                    <div
                      className={`flex-1 overflow-y-auto ${isAnimating ? 'overflow-hidden' : 'scrollbar-hide'}`}
                    >
                      <div className="space-y-2 p-3">
                        {currentVideos.map((video, index) => {
                          const thumbnail = getVideoThumbnail(video.url || '');
                          const isSelected = selectedVideo?.id === video.id;

                          return (
                            <motion.div
                              key={video.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <div
                                className={`w-full overflow-hidden rounded-lg ${
                                  isSelected
                                    ? 'bg-indigo-600/20 ring-2 ring-indigo-500'
                                    : 'hover:bg-gray-700/50'
                                }`}
                              >
                                <button
                                  className="w-full p-2 text-left focus:outline-none"
                                  onClick={() => setSelectedVideo(video)}
                                >
                                  <div className="flex items-start">
                                    <div className="group relative h-20 w-32 flex-shrink-0 overflow-hidden rounded bg-gray-900">
                                      <Image
                                        src={thumbnail}
                                        alt={video.title}
                                        width={128}
                                        height={80}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Play className="h-6 w-6 text-white" />
                                      </div>
                                    </div>
                                    <div className="ml-3 min-w-0 flex-grow py-1">
                                      <h4 className="mb-1 line-clamp-2 text-sm font-medium">
                                        {video.title}
                                      </h4>
                                      <div className="flex items-center text-xs text-gray-400">
                                        {video.weekNumber && (
                                          <div className="mr-2 flex items-center">
                                            <Calendar className="mr-1 h-3 w-3" />
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
                      <div className="flex-none border-t border-gray-700/50 p-5">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className="border-gray-700 text-gray-300 hover:bg-gray-700"
                          >
                            <ChevronLeft className="mr-1 h-4 w-4" />
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
                            <ChevronRight className="ml-1 h-4 w-4" />
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
