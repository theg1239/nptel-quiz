'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, MessageSquare, ThumbsUp, Send, Filter, Clock, ArrowUp, ArrowDown, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import SpaceLoader from '@/components/SpaceLoader'
import { createPost, createReply, togglePostLike, toggleReplyLike, deletePost, deleteReply, updatePost, updateReply } from '@/lib/actions/discussions'
import { useSession, signIn } from 'next-auth/react'
import { getCourse } from '@/lib/actions'

interface Course {
  course_code: string
  course_name: string
  title: string
  weeks: {
    name: string
    questions: any[]
  }[]
}

interface Post {
  id: string
  title: string
  content: string
  weekNumber: number | null
  courseCode: string
  tags: string[]
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
  replies: {
    id: string
    content: string
    createdAt: Date
    user: {
      id: string
      name: string | null
      image: string | null
    }
    likes: any[]
  }[]
  likes: any[]
}

interface Props {
  courseCode: string
  initialPosts: Post[]
}

export default function DiscussionForumClient({ 
  courseCode, 
  initialPosts = [] // Provide default empty array
}: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [sortMethod, setSortMethod] = useState<'recent' | 'popular'>('recent')
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostWeek, setNewPostWeek] = useState<number | null>(null)
  const [newPostTags, setNewPostTags] = useState<string[]>([])
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [replyContent, setReplyContent] = useState<{[key: string]: string}>({})
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editingReply, setEditingReply] = useState<string | null>(null)
  const [editPostTitle, setEditPostTitle] = useState('')
  const [editPostContent, setEditPostContent] = useState('')
  const [editReplyContent, setEditReplyContent] = useState('')
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []

  const isAdmin = useMemo(() => {
    return adminEmails.includes(session?.user?.email || '')
  }, [session?.user?.email])

  const canModifyPost = (post: Post) => {
    return isAdmin || post.user.id === session?.user?.id
  }

  const canModifyReply = (reply: any) => {
    return isAdmin || reply.user.id === session?.user?.id
  }

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const courseData = await getCourse(courseCode)
        setCourse(courseData)
      } catch (error) {
        console.error('Failed to load course:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCourse()
  }, [courseCode])

  const handleCreatePost = async () => {
    if (!session?.user?.name) {
      signIn('google')
      return
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) return

    try {
      // Create optimistic post
      const optimisticPost: Post = {
        id: `temp-${Math.random()}`,
        title: newPostTitle,
        content: newPostContent,
        weekNumber: newPostWeek,
        courseCode,
        tags: newPostTags,
        createdAt: new Date(),
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image || null,
        },
        replies: [],
        likes: [],
      }

      setPosts(prevPosts => [optimisticPost, ...prevPosts])

      setNewPostTitle('')
      setNewPostContent('')
      setNewPostWeek(null)
      setNewPostTags([])
      setShowNewPostForm(false)

      await createPost({
        title: newPostTitle,
        content: newPostContent,
        weekNumber: newPostWeek,
        courseCode,
        tags: newPostTags,
      })

      router.refresh()
    } catch (error) {
      console.error('Failed to create post:', error)
      setPosts(prevPosts => prevPosts.filter(post => !post.id.startsWith('temp-')))
    }
  }

  const handleAddReply = async (postId: string) => {
    if (!session?.user?.name) {
      signIn('google')
      return
    }

    const content = replyContent[postId]
    if (!content?.trim()) return

    try {
      const optimisticReply = {
        id: `temp-${Math.random()}`,
        content,
        createdAt: new Date(),
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image || null,
        },
        likes: [],
      }

      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              replies: [...post.replies, optimisticReply],
            }
          }
          return post
        })
      )

      // Clear input
      setReplyContent({...replyContent, [postId]: ''})

      // Make API call
      await createReply({
        content,
        postId,
        courseCode,
      })

      router.refresh()
    } catch (error) {
      console.error('Failed to add reply:', error)
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              replies: post.replies.filter(reply => !reply.id.startsWith('temp-')),
            }
          }
          return post
        })
      )
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!session?.user?.id) {
      signIn('google')
      return
    }

    try {
      // Update UI optimistically
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const hasLiked = post.likes.some(like => like.userId === session.user.id)
            return {
              ...post,
              likes: hasLiked 
                ? post.likes.filter(like => like.userId !== session.user.id)
                : [...post.likes, { userId: session.user.id }],
            }
          }
          return post
        })
      )

      await togglePostLike(postId, courseCode)
      router.refresh()
    } catch (error) {
      console.error('Failed to toggle post like:', error)
      router.refresh() // Refresh to get correct state
    }
  }

  const handleLikeReply = async (replyId: string) => {
    if (!session) {
      signIn('google')
      return
    }

    try {
      await toggleReplyLike(replyId, courseCode)
      router.refresh()
    } catch (error) {
      console.error('Failed to toggle reply like:', error)
    }
  }

  const handleAddTag = (tag: string) => {
    if (tag && !newPostTags.includes(tag)) {
      setNewPostTags([...newPostTags, tag])
    }
  }

  const handleRemoveTag = (tag: string) => {
    setNewPostTags(newPostTags.filter(t => t !== tag))
  }

  const handleEditPost = async (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    setEditingPost(postId)
    setEditPostTitle(post.title)
    setEditPostContent(post.content)
  }

  const handleSavePost = async (postId: string) => {
    if (!editPostTitle.trim() || !editPostContent.trim()) return

    try {
      // Update UI optimistically
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              title: editPostTitle,
              content: editPostContent,
            }
          }
          return post
        })
      )

      // Make API call
      await updatePost({
        postId,
        title: editPostTitle,
        content: editPostContent,
        courseCode,
      })

      setEditingPost(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to update post:', error)
      router.refresh() // Refresh to get correct state
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      // Update UI optimistically
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))

      // Make API call
      await deletePost(postId, courseCode)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete post:', error)
      router.refresh() // Refresh to get correct state
    }
  }

  const handleEditReply = async (replyId: string, content: string) => {
    setEditingReply(replyId)
    setEditReplyContent(content)
  }

  const handleSaveReply = async (postId: string, replyId: string) => {
    if (!editReplyContent.trim()) return

    try {
      // Update UI optimistically
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              replies: post.replies.map(reply => {
                if (reply.id === replyId) {
                  return {
                    ...reply,
                    content: editReplyContent,
                  }
                }
                return reply
              }),
            }
          }
          return post
        })
      )

      // Make API call
      await updateReply({
        replyId,
        content: editReplyContent,
        courseCode,
      })

      setEditingReply(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to update reply:', error)
      router.refresh() // Refresh to get correct state
    }
  }

  const handleDeleteReply = async (postId: string, replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return

    try {
      // Update UI optimistically
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              replies: post.replies.filter(reply => reply.id !== replyId),
            }
          }
          return post
        })
      )

      // Make API call
      await deleteReply(replyId, courseCode)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete reply:', error)
      router.refresh() // Refresh to get correct state
    }
  }

  // Filter and sort posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesWeek = selectedWeek === null || post.weekNumber === selectedWeek
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'my-posts' && post.user.id === session?.user?.id) ||
                      (activeTab === 'no-replies' && post.replies.length === 0)
    
    return matchesSearch && matchesWeek && matchesTab
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortMethod === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      return b.likes.length - a.likes.length
    }
  })

  const availableWeeks = useMemo(() => {
    const weekNumbers = new Set<number>();
    
    if (course?.weeks) {
      course.weeks.forEach(week => {
        const match = week.name.match(/Week (\d+)/);
        if (match) {
          const weekNumber = parseInt(match[1]);
          if (!isNaN(weekNumber)) {
            weekNumbers.add(weekNumber);
          }
        }
      });
    }
    
    posts.forEach(post => {
      if (typeof post.weekNumber === 'number') {
        weekNumbers.add(post.weekNumber);
      }
    });
    
    const sortedWeeks = Array.from(weekNumbers);
    sortedWeeks.sort((a, b) => a - b);
    return sortedWeeks;
  }, [course?.weeks, posts]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const courseName = course?.title || course?.course_name || courseCode

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <SpaceLoader size={100} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/courses/${courseCode}`)}
            className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900 transition-colors flex items-center w-full md:w-auto justify-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
            {courseName} - Discussion Forum
          </h1>
          <div className="w-full md:w-[100px]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 order-2 md:order-1">
            <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-gray-700 mb-4">
              <CardHeader>
                <CardTitle className="text-xl text-indigo-300">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Week</h3>
                    <div className="space-y-2">
                      <Button
                        variant={selectedWeek === null ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedWeek(null)}
                      >
                        All Weeks
                      </Button>
                      
                      {availableWeeks && availableWeeks.length > 0 ? (
                        availableWeeks.map((week) => (
                          <Button
                            key={week}
                            variant={selectedWeek === week ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => setSelectedWeek(week)}
                          >
                            Week {week}
                          </Button>
                        ))
                      ) : (
                        <div className="text-sm text-gray-400 py-2">No weeks available</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Sort by</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={sortMethod === 'recent' ? "default" : "outline"}
                        size="sm"
                        className="flex items-center flex-1"
                        onClick={() => setSortMethod('recent')}
                      >
                        <Clock className="mr-1 h-4 w-4" />
                        Recent
                      </Button>
                      <Button
                        variant={sortMethod === 'popular' ? "default" : "outline"}
                        size="sm"
                        className="flex items-center flex-1"
                        onClick={() => setSortMethod('popular')}
                      >
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        Popular
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 mb-4 flex items-center justify-center"
              onClick={() => setShowNewPostForm(true)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              New Discussion
            </Button>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 order-1 md:order-2">
            <div className="mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 bg-opacity-50 text-gray-100 border-gray-700 focus:border-indigo-500 w-full"
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-gray-800 bg-opacity-50 w-full flex">
                <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-indigo-600">All Discussions</TabsTrigger>
                <TabsTrigger value="my-posts" className="flex-1 data-[state=active]:bg-indigo-600">My Posts</TabsTrigger>
                <TabsTrigger value="no-replies" className="flex-1 data-[state=active]:bg-indigo-600">Unanswered</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {showNewPostForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-indigo-300">Create New Discussion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="post-title" className="text-sm font-medium text-gray-300 block mb-1">Title</label>
                      <Input
                        id="post-title"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        placeholder="What's your question or discussion topic?"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="post-content" className="text-sm font-medium text-gray-300 block mb-1">Content</label>
                      <Textarea
                        id="post-content"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Provide details about your question or topic..."
                        className="bg-gray-700 border-gray-600 min-h-[120px]"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="post-week" className="text-sm font-medium text-gray-300 block mb-1">Related Week (Optional)</label>
                      <select 
                        value={newPostWeek || ''} 
                        onChange={(e) => setNewPostWeek(e.target.value ? Number(e.target.value) : null)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200"
                      >
                        <option value="">Select Week</option>
                        {availableWeeks.map((week) => (
                          <option key={week} value={week}>
                            Week {week}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-300 block mb-1">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newPostTags.map(tag => (
                          <div 
                            key={tag} 
                            className="bg-indigo-900 text-indigo-200 px-2 py-1 rounded-md text-xs flex items-center"
                          >
                            {tag}
                            <button 
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-indigo-300 hover:text-indigo-100"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          className="bg-gray-700 border-gray-600"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddTag((e.target as HTMLInputElement).value)
                              ;(e.target as HTMLInputElement).value = ''
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          className="border-indigo-600 text-indigo-300"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            handleAddTag(input.value)
                            input.value = ''
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      className="border-gray-600"
                      onClick={() => setShowNewPostForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleCreatePost}
                      disabled={!newPostTitle.trim() || !newPostContent.trim()}
                    >
                      Post Discussion
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {sortedPosts.length === 0 ? (
              <div className="text-center py-10 bg-gray-800 bg-opacity-50 rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 mb-2">No discussions found matching your criteria.</p>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setShowNewPostForm(true)}
                >
                  Start a New Discussion
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-gray-700">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-gray-700">
                              {post.user.image ? (
                                <AvatarImage src={post.user.image} alt={post.user.name || 'User'} />
                              ) : (
                                <AvatarFallback className="bg-indigo-900 text-indigo-200">
                                  {post.user.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              {editingPost === post.id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editPostTitle}
                                    onChange={(e) => setEditPostTitle(e.target.value)}
                                    className="bg-gray-700 border-gray-600"
                                  />
                                  <Textarea
                                    value={editPostContent}
                                    onChange={(e) => setEditPostContent(e.target.value)}
                                    className="bg-gray-700 border-gray-600"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSavePost(post.id)}
                                      disabled={!editPostTitle.trim() || !editPostContent.trim()}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingPost(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <CardTitle className="text-xl text-indigo-300">{post.title}</CardTitle>
                                  <div className="flex items-center text-xs text-gray-400 mt-1">
                                    <span>{post.user.name}</span>
                                    <span className="mx-2">•</span>
                                    <span>{formatDate(post.createdAt)}</span>
                                    {post.weekNumber !== null && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <span>Week {post.weekNumber}</span>
                                      </>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePost(post.id)}
                              className={`text-gray-400 hover:text-indigo-300 ${
                                post.likes.some(like => like.userId === session?.user?.id) ? 'text-indigo-300' : ''
                              }`}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {post.likes.length}
                            </Button>
                            {canModifyPost(post) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                  <DropdownMenuItem
                                    onClick={() => handleEditPost(post.id)}
                                    className="text-gray-200 hover:bg-gray-700"
                                  >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeletePost(post.id)}
                                    className="text-red-400 hover:bg-gray-700"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                        {!editingPost && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {post.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="bg-indigo-900 text-indigo-200 px-2 py-1 rounded-md text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardHeader>
                      {!editingPost && (
                        <CardContent className="py-2">
                          <p className="text-gray-300 whitespace-pre-line">{post.content}</p>
                        </CardContent>
                      )}
                      
                      {/* Replies */}
                      {post.replies.length > 0 && (
                        <div className="px-6 py-3 border-t border-gray-700">
                          <h3 className="text-sm font-medium text-gray-300 mb-3">
                            {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
                          </h3>
                          <div className="space-y-4">
                            {post.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  {reply.user.image ? (
                                    <AvatarImage src={reply.user.image} alt={reply.user.name || 'User'} />
                                  ) : (
                                    <AvatarFallback className="bg-indigo-900 text-indigo-200">
                                      {reply.user.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="flex-1 bg-gray-700 bg-opacity-50 p-3 rounded-md">
                                  {editingReply === reply.id ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        value={editReplyContent}
                                        onChange={(e) => setEditReplyContent(e.target.value)}
                                        className="bg-gray-700 border-gray-600"
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => handleSaveReply(post.id, reply.id)}
                                          disabled={!editReplyContent.trim()}
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingReply(null)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="text-sm font-medium text-indigo-200">{reply.user.name}</p>
                                          <p className="text-xs text-gray-400">{formatDate(reply.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleLikeReply(reply.id)}
                                            className={`text-gray-400 hover:text-indigo-300 ${
                                              reply.likes.some(like => like.userId === session?.user?.id) ? 'text-indigo-300' : ''
                                            }`}
                                          >
                                            <ThumbsUp className="h-3 w-3 mr-1" />
                                            {reply.likes.length}
                                          </Button>
                                          {canModifyReply(reply) && (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                  <MoreVertical className="h-4 w-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                                <DropdownMenuItem
                                                  onClick={() => handleEditReply(reply.id, reply.content)}
                                                  className="text-gray-200 hover:bg-gray-700"
                                                >
                                                  <Edit2 className="h-4 w-4 mr-2" />
                                                  Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                  onClick={() => handleDeleteReply(post.id, reply.id)}
                                                  className="text-red-400 hover:bg-gray-700"
                                                >
                                                  <Trash2 className="h-4 w-4 mr-2" />
                                                  Delete
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-gray-300 mt-2 text-sm whitespace-pre-line">{reply.content}</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Add Reply */}
                      <CardFooter className="border-t border-gray-700 pt-3">
                        <div className="flex gap-3 w-full">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            {session?.user?.image ? (
                              <AvatarImage src={session.user.image} alt={session.user.name || 'User'} />
                            ) : (
                              <AvatarFallback className="bg-indigo-900 text-indigo-200">
                                {session?.user?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder={session ? "Write a reply..." : "Sign in to reply"}
                              value={replyContent[post.id] || ''}
                              onChange={(e) => setReplyContent({...replyContent, [post.id]: e.target.value})}
                              className="flex-1 bg-gray-700 border-gray-600"
                              disabled={!session}
                            />
                            <Button
                              className="bg-indigo-600 hover:bg-indigo-700"
                              size="sm"
                              onClick={() => handleAddReply(post.id)}
                              disabled={!session || !replyContent[post.id]?.trim()}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
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