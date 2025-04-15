'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Download, Bookmark, BookmarkCheck, ExternalLink, Video, FileText, Book, Music, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import SpaceLoader from '@/components/SpaceLoader'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { getCourseMaterials, StudyMaterial } from '@/lib/actions'

export default function MaterialViewClient({ courseCode, materialId }: { courseCode: string; materialId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [material, setMaterial] = useState<StudyMaterial | null>(null)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setLoading(true)
        
        // Use the server action to fetch all materials for the course
        const materials = await getCourseMaterials(courseCode)
        
        // Find the specific material by ID
        const foundMaterial = materials.find(m => m.id === materialId)
        
        if (!foundMaterial) {
          throw new Error('Material not found')
        }
        
        setMaterial(foundMaterial)
        
        // Check if this material is bookmarked
        const savedBookmarks = localStorage.getItem(`bookmarks_${courseCode}`)
        let bookmarks: string[] = []
        if (savedBookmarks) {
          bookmarks = JSON.parse(savedBookmarks)
          setBookmarked(bookmarks.includes(materialId))
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading material:', error)
        // Redirect to materials page if material not found
        router.push(`/courses/${courseCode}/materials`)
      }
    }
    
    fetchMaterial()
  }, [courseCode, materialId, router])
  
  const toggleBookmark = () => {
    if (!material) return
    
    // Update bookmarked state
    setBookmarked(prev => {
      const newState = !prev
      
      // Update localStorage
      const savedBookmarks = localStorage.getItem(`bookmarks_${courseCode}`)
      let bookmarks: string[] = savedBookmarks ? JSON.parse(savedBookmarks) : []
      
      if (newState) {
        // Add bookmark
        if (!bookmarks.includes(material.id)) {
          bookmarks.push(material.id)
        }
      } else {
        // Remove bookmark
        bookmarks = bookmarks.filter(id => id !== material.id)
      }
      
      localStorage.setItem(`bookmarks_${courseCode}`, JSON.stringify(bookmarks))
      return newState
    })
  }

  const renderMaterialTypeIcon = () => {
    if (!material) return null
    
    switch (material.type) {
      case 'video':
        return <Video className="h-6 w-6 text-blue-300" />
      case 'transcript':
        return <FileText className="h-6 w-6 text-green-300" />
      case 'book':
        return <Book className="h-6 w-6 text-purple-300" />
      case 'audio':
        return <Music className="h-6 w-6 text-pink-300" />
      default:
        return <FileText className="h-6 w-6 text-blue-300" />
    }
  }

  const renderDownloadButton = () => {
    if (!material) return null
    
    if (material.type === 'video' && material.url) {
      return (
        <Button
          variant="outline"
          className="text-indigo-300 border-indigo-600 hover:bg-indigo-900"
          onClick={() => window.open(material.url, '_blank')}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Video
        </Button>
      )
    } else if (material.type === 'book' && material.url) {
      return (
        <Button
          variant="outline"
          className="text-indigo-300 border-indigo-600 hover:bg-indigo-900"
          onClick={() => window.open(material.url, '_blank')}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Book
        </Button>
      )
    } else if ((material.type === 'transcript' || material.type === 'audio') && material.languages && material.languages.length > 0) {
      // Show a download button for the first available language
      const firstLanguage = material.languages.find(lang => lang.url)
      if (firstLanguage) {
        return (
          <Button
            variant="outline"
            className="text-indigo-300 border-indigo-600 hover:bg-indigo-900"
            onClick={() => window.open(firstLanguage.url, '_blank')}
          >
            <Download className="mr-2 h-4 w-4" />
            Download {material.type === 'transcript' ? 'Transcript' : 'Audio'}
          </Button>
        )
      }
    }
    
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <SpaceLoader size={100} />
      </div>
    )
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-indigo-300 mb-4">Material Not Found</h1>
          <p className="text-gray-300 mb-6">We couldn't find the requested study material.</p>
          <Button
            onClick={() => router.push(`/courses/${courseCode}/materials`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Materials
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-gray-100">
      <div className="container mx-auto p-4 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/courses/${courseCode}/materials`)}
            className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900 transition-colors flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Materials
          </Button>
          <div className="w-[100px]"></div>
        </div>

        <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-gray-700 mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center">
                  {renderMaterialTypeIcon()}
                </div>
                <div>
                  <CardTitle className="text-2xl text-indigo-300">{material.title}</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">
                    {material.weekNumber && `Week ${material.weekNumber} • `}
                    {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBookmark}
                className="text-gray-400 hover:text-yellow-400"
              >
                {bookmarked ? (
                  <BookmarkCheck className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 bg-opacity-50 rounded-md p-6 prose prose-invert max-w-none">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-300 hover:text-indigo-200 underline flex items-center"
                    >
                      {props.children}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  ),
                  iframe: ({ node, ...props }) => (
                    <div className="my-6 aspect-video w-full">
                      <iframe
                        {...props}
                        className="w-full h-full rounded-md"
                        allowFullScreen
                      />
                    </div>
                  ),
                }}
              >
                {material.content}
              </ReactMarkdown>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                className="text-indigo-300 border-indigo-600 hover:bg-indigo-900"
                onClick={() => router.push(`/courses/${courseCode}/discussions`)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Discuss This Material
              </Button>
              {renderDownloadButton()}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}