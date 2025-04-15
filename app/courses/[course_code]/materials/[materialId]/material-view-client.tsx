'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Download, Bookmark, BookmarkCheck, ExternalLink, Video, FileText, Book, Music, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import SpaceLoader from '@/components/SpaceLoader'
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
        
        const materials = await getCourseMaterials(courseCode)
        const foundMaterial = materials.find(m => m.id === materialId)
        
        if (!foundMaterial) {
          setMaterial(null)
          setLoading(false)
          return
        }
        
        setMaterial(foundMaterial)
        
        const savedBookmarks = localStorage.getItem(`bookmarks_${courseCode}`)
        let bookmarks: string[] = []
        if (savedBookmarks) {
          bookmarks = JSON.parse(savedBookmarks)
          setBookmarked(bookmarks.includes(materialId))
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading material:', error)
        setMaterial(null)
        setLoading(false)
      }
    }
    
    fetchMaterial()
  }, [courseCode, materialId])
  
  const toggleBookmark = () => {
    if (!material) return
    
    setBookmarked(prev => {
      const newState = !prev
      
      const savedBookmarks = localStorage.getItem(`bookmarks_${courseCode}`)
      let bookmarks: string[] = savedBookmarks ? JSON.parse(savedBookmarks) : []
      
      if (newState) {
        if (!bookmarks.includes(material.id)) {
          bookmarks.push(material.id)
        }
      } else {
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

  const renderDownloadSection = () => {
    if (!material) return null;

    const downloads = [];

    if (material.url) {
      downloads.push({
        type: material.type,
        url: material.url,
        label: material.type === 'video' ? 'Download Video' : 'Download Book'
      });
    }

    if (material.languages) {
      material.languages.forEach(lang => {
        if (lang.url) {
          downloads.push({
            type: material.type,
            url: lang.url,
            label: `Download ${material.type === 'transcript' ? 'Transcript' : 'Audio'} (${lang.language})`
          });
        }
      });
    }

    if (downloads.length === 0) return null;

    return (
      <div className="bg-gray-800 bg-opacity-40 rounded-lg p-4 mt-6">
        <h3 className="text-lg font-semibold text-indigo-300 mb-3">Downloads</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {downloads.map((download, index) => (
            <Button
              key={index}
              variant="outline"
              className="text-indigo-300 border-indigo-600 hover:bg-indigo-900 w-full"
              onClick={() => window.open(download.url, '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              {download.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push(`/courses/${courseCode}/materials`)}
              className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900 transition-colors flex items-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Materials
            </Button>
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

          <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-gray-700">
            <CardHeader className="pb-3">
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
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-900 bg-opacity-50">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="resources">Resources & Downloads</TabsTrigger>
                </TabsList>
                <TabsContent value="content">
                  <ScrollArea className="bg-gray-900 bg-opacity-50 rounded-md p-6 h-[60vh]">
                    <div className="prose prose-invert max-w-none">
                      <div className="space-y-4">
                        {material.type === 'video' && material.url && (
                          <div className="aspect-video w-full mb-6">
                            <iframe
                              src={material.url}
                              className="w-full h-full rounded-md"
                              allowFullScreen
                            />
                          </div>
                        )}
                        <div dangerouslySetInnerHTML={{ __html: material.content }} />
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="resources">
                  <div className="bg-gray-900 bg-opacity-50 rounded-md p-6">
                    {renderDownloadSection()}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-indigo-300 mb-3">Related Resources</h3>
                      <Button
                        variant="outline"
                        className="text-indigo-300 border-indigo-600 hover:bg-indigo-900 w-full mb-3"
                        onClick={() => router.push(`/courses/${courseCode}/discussions`)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Join Discussion
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}