'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, FileText, Download, Search, Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SpaceLoader from '@/components/SpaceLoader'
import { getCourseMaterials, StudyMaterial } from '@/lib/actions'

export default function StudyMaterialsClient({ courseCode, courseName }: { courseCode: string; courseName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState<string[]>([])
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    // Fetch course materials using the server action
    const fetchCourseMaterials = async () => {
      try {
        setLoading(true);
        
        // Use the server action instead of fetch
        const apiMaterials = await getCourseMaterials(courseCode);
        
        setMaterials(apiMaterials);
        
        // Load bookmarks from localStorage
        const savedBookmarks = localStorage.getItem(`bookmarks_${courseCode}`);
        if (savedBookmarks) {
          setBookmarkedMaterials(JSON.parse(savedBookmarks));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course materials:', error);
        setMaterials([]);
        setLoading(false);
      }
    };
    
    fetchCourseMaterials();
  }, [courseCode]);

  const toggleBookmark = (materialId: string) => {
    setBookmarkedMaterials(prev => {
      const newBookmarks = prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
      
      // Save to localStorage
      localStorage.setItem(`bookmarks_${courseCode}`, JSON.stringify(newBookmarks))
      return newBookmarks
    })
  }

  const weeks = Array.from(new Set(materials.map(material => material.weekNumber))).sort()
  
  // Filter materials based on search, week selection, and active tab
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         material.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesWeek = selectedWeek === null || material.weekNumber === selectedWeek
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'bookmarked' && bookmarkedMaterials.includes(material.id))
    
    return matchesSearch && matchesWeek && matchesTab
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <SpaceLoader size={100} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-gray-100">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/courses/${courseCode}`)}
            className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900 transition-colors flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
          <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
            Study Materials
          </h1>
          <div className="w-[100px]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-indigo-300">Filter by Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={selectedWeek === null ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedWeek(null)}
                  >
                    All Weeks
                  </Button>
                  
                  {weeks.map(week => (
                    <Button
                      key={week}
                      variant={selectedWeek === week ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedWeek(week)}
                    >
                      Week {week}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search study materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 bg-opacity-50 text-gray-100 border-gray-700 focus:border-indigo-500"
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-gray-800 bg-opacity-50">
                <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600">All Materials</TabsTrigger>
                <TabsTrigger value="bookmarked" className="data-[state=active]:bg-indigo-600">Bookmarked</TabsTrigger>
              </TabsList>
            </Tabs>

            {filteredMaterials.length === 0 ? (
              <div className="text-center py-10 bg-gray-800 bg-opacity-50 rounded-lg">
                <p className="text-gray-400">No study materials found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredMaterials.map((material) => (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-gray-700 hover:bg-opacity-70 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl text-indigo-300">{material.title}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(material.id)}
                            className="text-gray-400 hover:text-yellow-400"
                          >
                            {bookmarkedMaterials.includes(material.id) ? (
                              <BookmarkCheck className="h-5 w-5 text-yellow-400" />
                            ) : (
                              <Bookmark className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-400">Week {material.weekNumber} • {material.type.charAt(0).toUpperCase() + material.type.slice(1)}</p>
                        <p className="text-sm text-gray-300">{material.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 bg-opacity-50 rounded-md p-4 max-h-60 overflow-hidden relative">
                          <ScrollArea className="h-40">
                            <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                              {material.content.substring(0, 300)}...
                            </pre>
                          </ScrollArea>
                          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent"></div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex justify-between w-full">
                          <Button
                            variant="outline"
                            className="text-indigo-300 border-indigo-600 hover:bg-indigo-900"
                            onClick={() => router.push(`/courses/${courseCode}/materials/${material.id}`)}
                          >
                            Read Full Content
                          </Button>
                          <Button variant="outline" className="text-indigo-300 border-indigo-600 hover:bg-indigo-900">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}