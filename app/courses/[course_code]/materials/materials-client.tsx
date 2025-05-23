'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  FileText,
  Book,
  Music,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  Search,
  X,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpaceLoader from '@/components/space-loader';
import ReactMarkdown, { Components } from 'react-markdown';
import { getCourseMaterials, StudyMaterial } from '@/lib/actions/actions';

const MarkdownLink = ({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <a href={href} {...props} className="text-blue-500 hover:underline">
      {children}
    </a>
  );
};

const markdownComponents: Components = {
  a: MarkdownLink,
};

export default function MaterialsClient({
  courseCode,
  courseName,
}: {
  courseCode: string;
  courseName: string;
}) {
  const router = useRouter();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const fetchedMaterials = await getCourseMaterials(courseCode);
        setMaterials(fetchedMaterials);

        const savedBookmarks = localStorage.getItem(`bookmarks_${courseCode}`);
        if (savedBookmarks) {
          setBookmarks(JSON.parse(savedBookmarks));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading materials:', error);
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [courseCode]);

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-blue-300" />;
      case 'transcript':
        return <FileText className="h-5 w-5 text-green-300" />;
      case 'book':
        return <Book className="h-5 w-5 text-purple-300" />;
      case 'audio':
        return <Music className="h-5 w-5 text-pink-300" />;
      default:
        return <FileText className="h-5 w-5 text-blue-300" />;
    }
  };

  const toggleBookmark = (materialId: number) => {
    setBookmarks(prev => {
      const newBookmarks = prev.includes(materialId.toString())
        ? prev.filter(id => id !== materialId.toString())
        : [...prev, materialId.toString()];

      localStorage.setItem(`bookmarks_${courseCode}`, JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  // Updated download section; button rendered in blue.
  const renderDownloadSection = (material: StudyMaterial) => {
    const downloads = [];

    if (material.url) {
      downloads.push({
        type: material.type,
        url: material.url,
        label: material.type === 'video' ? 'Download Video' : 'Download Book',
      });
    }

    if (material.languages) {
      material.languages.forEach(lang => {
        if (lang.url) {
          downloads.push({
            type: material.type,
            url: lang.url,
            label: `Download ${material.type === 'transcript' ? 'Transcript' : 'Audio'} (${lang.language})`,
          });
        }
      });
    }

    if (downloads.length === 0) return null;

    return (
      <div className="mt-6 rounded-lg bg-gray-800 bg-opacity-40 p-4">
        <h3 className="mb-3 text-lg font-semibold text-indigo-300">Downloads</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {downloads.map((download, index) => (
            <Button
              key={index}
              variant="default"
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
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

  const filteredMaterials = materials
    .filter(material => {
      const matchesSearch =
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.type.toLowerCase().includes(searchTerm.toLowerCase());

      if (filter === 'bookmarked') {
        return matchesSearch && bookmarks.includes(material.id.toString());
      }
      if (filter === 'videos') {
        return matchesSearch && material.type === 'video';
      }
      if (filter === 'documents') {
        return matchesSearch && (material.type === 'book' || material.type === 'transcript');
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (a.weekNumber === b.weekNumber) {
        return a.title.localeCompare(b.title);
      }
      return (a.weekNumber || 0) - (b.weekNumber || 0);
    });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <SpaceLoader size={100} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 text-gray-100">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push(`/courses/${courseCode}`)}
              className="flex items-center text-indigo-300 transition-colors hover:bg-indigo-900 hover:text-indigo-100"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
          </div>

          <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border-gray-700 bg-gray-800 bg-opacity-50 pl-10 text-gray-100 placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'bookmarked', 'videos', 'documents'].map(filterType => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? 'default' : 'outline'}
                  onClick={() => setFilter(filterType)}
                  className={
                    filter === filterType
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'border-indigo-600 text-indigo-300 hover:bg-indigo-900'
                  }
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-6">
            <div
              className={`flex-1 transition-all duration-300 ${selectedMaterial ? 'md:w-1/2' : 'w-full'}`}
            >
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="grid grid-cols-1 gap-4">
                  {filteredMaterials.map(material => (
                    <Card
                      key={material.id}
                      className={`group cursor-pointer border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-md transition-colors hover:border-indigo-500 ${selectedMaterial?.id === material.id ? 'border-indigo-500' : ''}`}
                      onClick={() => setSelectedMaterial(material)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">{getMaterialTypeIcon(material.type)}</div>
                            <div>
                              <h3 className="mb-1 font-semibold text-indigo-300 group-hover:text-indigo-200">
                                {material.title}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {material.weekNumber && `Week ${material.weekNumber} • `}
                                {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => {
                                e.stopPropagation();
                                toggleBookmark(Number(material.id));
                              }}
                              className="text-gray-400 hover:text-yellow-400"
                            >
                              {bookmarks.includes(material.id.toString()) ? (
                                <BookmarkCheck className="h-4 w-4 text-yellow-400" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </Button>
                            <ChevronRight className="h-4 w-4 text-gray-500 transition-colors group-hover:text-indigo-300" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {filteredMaterials.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-400">
                    {searchTerm
                      ? 'No materials found matching your search.'
                      : filter === 'bookmarked'
                        ? 'No bookmarked materials yet.'
                        : 'No materials available.'}
                  </p>
                </div>
              )}
            </div>

            {/* Desktop inline details panel */}
            {!isMobile && selectedMaterial && (
              <AnimatePresence>
                <motion.div
                  key="desktop-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-1/2 md:block"
                >
                  <Card className="sticky top-4 border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-md">
                    <div className="p-4">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-900">
                            {getMaterialTypeIcon(selectedMaterial.type)}
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-indigo-300">
                              {selectedMaterial.title}
                            </h2>
                            <p className="text-sm text-gray-400">
                              {selectedMaterial.weekNumber &&
                                `Week ${selectedMaterial.weekNumber} • `}
                              {selectedMaterial.type.charAt(0).toUpperCase() +
                                selectedMaterial.type.slice(1)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMaterial(null)}
                          className="text-gray-400 hover:text-gray-200"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>

                      <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-900 bg-opacity-50">
                          <TabsTrigger value="content">Content</TabsTrigger>
                          <TabsTrigger value="resources">Downloads</TabsTrigger>
                        </TabsList>
                        <TabsContent value="content">
                          <ScrollArea className="h-[60vh] rounded-md bg-gray-900 bg-opacity-50 p-6">
                            <div className="prose prose-invert max-w-none">
                              <div className="space-y-4">
                                {selectedMaterial.type === 'video' && selectedMaterial.url && (
                                  <div className="mb-6 aspect-video w-full">
                                    <iframe
                                      src={selectedMaterial.url}
                                      className="h-full w-full rounded-md"
                                      allowFullScreen
                                    />
                                  </div>
                                )}
                                <ReactMarkdown components={markdownComponents}>
                                  {selectedMaterial.content}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </ScrollArea>
                        </TabsContent>
                        <TabsContent value="resources">
                          <div className="rounded-md bg-gray-900 bg-opacity-50 p-6">
                            {renderDownloadSection(selectedMaterial)}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isMobile && selectedMaterial && (
          <motion.div
            key="mobile-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-opacity-90 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4"
          >
            <Card className="mx-auto w-full max-w-2xl border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-md">
              <div className="p-4">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-900">
                      {getMaterialTypeIcon(selectedMaterial.type)}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-indigo-300">
                        {selectedMaterial.title}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {selectedMaterial.weekNumber && `Week ${selectedMaterial.weekNumber} • `}
                        {selectedMaterial.type.charAt(0).toUpperCase() +
                          selectedMaterial.type.slice(1)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMaterial(null)}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-900 bg-opacity-50">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="resources">Downloads</TabsTrigger>
                  </TabsList>
                  <TabsContent value="content">
                    <ScrollArea className="h-[60vh] rounded-md bg-gray-900 bg-opacity-50 p-6">
                      <div className="prose prose-invert max-w-none">
                        <div className="space-y-4">
                          {selectedMaterial.type === 'video' && selectedMaterial.url && (
                            <div className="mb-6 aspect-video w-full">
                              <iframe
                                src={selectedMaterial.url}
                                className="h-full w-full rounded-md"
                                allowFullScreen
                              />
                            </div>
                          )}
                          <ReactMarkdown components={markdownComponents}>
                            {selectedMaterial.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="resources">
                    <div className="rounded-md bg-gray-900 bg-opacity-50 p-6">
                      {renderDownloadSection(selectedMaterial)}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
