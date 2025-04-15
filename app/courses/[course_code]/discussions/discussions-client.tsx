'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, MessageSquare, ThumbsUp, Send, User, Filter, Clock, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import SpaceLoader from '@/components/SpaceLoader'
import { getCourse } from '@/lib/actions'

interface DiscussionPost {
  id: string
  userId: string
  userName: string
  avatar: string
  title: string
  content: string
  timestamp: string
  weekNumber: number | null
  likes: number
  replies: DiscussionReply[]
  tags: string[]
}

interface DiscussionReply {
  id: string
  userId: string
  userName: string
  avatar: string
  content: string
  timestamp: string
  likes: number
}

interface User {
  id: string
  name: string
  avatar: string
}

export default function DiscussionForumClient({ courseCode, courseName }: { courseCode: string; courseName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [sortMethod, setSortMethod] = useState<'recent' | 'popular'>('recent')
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostWeek, setNewPostWeek] = useState<number | null>(null)
  const [newPostTags, setNewPostTags] = useState<string[]>([])
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [replyContent, setReplyContent] = useState<{[key: string]: string}>({})

  // Dummy data for demonstration
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const dummyUser = {
        id: 'user123',
        name: 'Student',
        avatar: '',
      }
      
      const dummyPosts: DiscussionPost[] = [
        {
          id: '1',
          userId: 'user456',
          userName: 'Alex Johnson',
          avatar: '',
          title: 'Confusion about Week 2 Concept',
          content: 'I\'m having trouble understanding the relationship between the fundamental principle and the secondary principle. Can someone explain how they interact in real-world scenarios?',
          timestamp: '2025-04-14T10:30:00Z',
          weekNumber: 2,
          likes: 5,
          replies: [
            {
              id: 'r1',
              userId: 'user789',
              userName: 'Professor Williams',
              avatar: '',
              content: 'Great question! The fundamental principle describes the static relationships between components, while the secondary principle extends this to dynamic scenarios. In real-world terms, think of the fundamental principle as a snapshot of a system at rest, and the secondary principle as what happens when external forces are applied.',
              timestamp: '2025-04-14T11:45:00Z',
              likes: 8
            },
            {
              id: 'r2',
              userId: 'user101',
              userName: 'Sam Taylor',
              avatar: '',
              content: 'I found it helpful to work through the practice problems in section 2.3. They really illustrate how these principles interact.',
              timestamp: '2025-04-14T13:20:00Z',
              likes: 3
            }
          ],
          tags: ['concept clarification', 'week 2']
        },
        {
          id: '2',
          userId: 'user202',
          userName: 'Jamie Smith',
          avatar: '',
          title: 'Additional resources for Week 1',
          content: 'I\'ve found some great supplementary materials that helped me understand the Week 1 concepts better. Here are the links:\n\n1. [Introduction to Key Terminology](https://example.com/terminology)\n2. [Historical Context Video Series](https://example.com/history)\n3. [Interactive Demonstration](https://example.com/demo)',
          timestamp: '2025-04-12T15:10:00Z',
          weekNumber: 1,
          likes: 12,
          replies: [
            {
              id: 'r3',
              userId: 'user303',
              userName: 'Taylor Morgan',
              avatar: '',
              content: 'Thank you so much for sharing these! The interactive demonstration was especially helpful for visualizing the concepts.',
              timestamp: '2025-04-12T16:30:00Z',
              likes: 5
            }
          ],
          tags: ['resources', 'week 1', 'helpful links']
        },
        {
          id: '3',
          userId: 'user404',
          userName: 'Jordan Lee',
          avatar: '',
          title: 'Study group for final exam',
          content: 'Would anyone be interested in forming a study group to prepare for the final exam? We could meet virtually twice a week to discuss practice problems and review concepts. Please reply if you\'re interested!',
          timestamp: '2025-04-15T09:00:00Z',
          weekNumber: null, // Not specific to any week
          likes: 8,
          replies: [
            {
              id: 'r4',
              userId: 'user505',
              userName: 'Casey Kim',
              avatar: '',
              content: 'I\'d love to join! Studying in a group has always helped me understand complex topics better.',
              timestamp: '2025-04-15T09:45:00Z',
              likes: 2
            },
            {
              id: 'r5',
              userId: 'user606',
              userName: 'Riley Johnson',
              avatar: '',
              content: 'Count me in! I\'m particularly struggling with the concepts from Weeks 2 and 3, so I\'d appreciate the collaborative approach.',
              timestamp: '2025-04-15T10:30:00Z',
              likes: 1
            },
            {
              id: 'r6',
              userId: 'user707',
              userName: 'Quinn Smith',
              avatar: '',
              content: 'I\'m interested too. Could we use a shared document to compile our notes and questions before each meeting?',
              timestamp: '2025-04-15T11:15:00Z',
              likes: 3
            }
          ],
          tags: ['study group', 'collaboration', 'exam prep']
        },
        {
          id: '4',
          userId: 'user808',
          userName: 'Morgan Patel',
          avatar: '',
          title: 'Week 3 challenge problem solution approach',
          content: 'I\'ve been working on the challenge problem from Week 3 about complex systems with Lorenz equations. I\'m taking an approach using Euler\'s method with a smaller step size than suggested (0.005 instead of 0.01). Has anyone else tried this? My results seem more accurate when compared to the expected values.',
          timestamp: '2025-04-16T08:15:00Z',
          weekNumber: 3,
          likes: 6,
          replies: [
            {
              id: 'r7',
              userId: 'user909',
              userName: 'Dr. Chen',
              avatar: '',
              content: 'Excellent observation, Morgan! Using a smaller step size does indeed improve accuracy when using Euler\'s method. For those interested in exploring further, you might want to look into higher-order methods like Runge-Kutta that provide even better accuracy with larger step sizes.',
              timestamp: '2025-04-16T09:30:00Z',
              likes: 10
            }
          ],
          tags: ['week 3', 'challenge problem', 'numerical methods']
        }
      ];
      
      setPosts(dummyPosts);
      setCurrentUser(dummyUser);
      setLoading(false);
    }, 1500);
  }, [courseCode]);

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !currentUser) return;
    
    const newPost: DiscussionPost = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      avatar: currentUser.avatar,
      title: newPostTitle,
      content: newPostContent,
      timestamp: new Date().toISOString(),
      weekNumber: newPostWeek,
      likes: 0,
      replies: [],
      tags: newPostTags
    };
    
    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostWeek(null);
    setNewPostTags([]);
    setShowNewPostForm(false);
  };

  const handleAddReply = (postId: string) => {
    const content = replyContent[postId];
    if (!content?.trim() || !currentUser) return;
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const newReply: DiscussionReply = {
          id: `reply-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          avatar: currentUser.avatar,
          content: content,
          timestamp: new Date().toISOString(),
          likes: 0
        };
        
        return {
          ...post,
          replies: [...post.replies, newReply]
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
    setReplyContent({...replyContent, [postId]: ''});
  };

  const handleLikePost = (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likes + 1
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
  };

  const handleLikeReply = (postId: string, replyId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const updatedReplies = post.replies.map(reply => {
          if (reply.id === replyId) {
            return {
              ...reply,
              likes: reply.likes + 1
            };
          }
          return reply;
        });
        
        return {
          ...post,
          replies: updatedReplies
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
  };

  const handleAddTag = (tag: string) => {
    if (tag && !newPostTags.includes(tag)) {
      setNewPostTags([...newPostTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewPostTags(newPostTags.filter(t => t !== tag));
  };

  // Filter and sort posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesWeek = selectedWeek === null || post.weekNumber === selectedWeek;
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'my-posts' && post.userId === currentUser?.id) ||
                      (activeTab === 'no-replies' && post.replies.length === 0);
    
    return matchesSearch && matchesWeek && matchesTab;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortMethod === 'recent') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      return b.likes - a.likes;
    }
  });

  const weeks = Array.from(new Set(posts.filter(post => post.weekNumber !== null).map(post => post.weekNumber))).sort() as number[];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <SpaceLoader size={100} />
      </div>
    );
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
            Discussion Forum
          </h1>
          <div className="w-[100px]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
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
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Sort by</h3>
                    <div className="flex space-x-2">
                      <Button
                        variant={sortMethod === 'recent' ? "default" : "outline"}
                        size="sm"
                        className="flex items-center"
                        onClick={() => setSortMethod('recent')}
                      >
                        <Clock className="mr-1 h-4 w-4" />
                        Recent
                      </Button>
                      <Button
                        variant={sortMethod === 'popular' ? "default" : "outline"}
                        size="sm"
                        className="flex items-center"
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
          <div className="md:col-span-3">
            <div className="mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 bg-opacity-50 text-gray-100 border-gray-700 focus:border-indigo-500"
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-gray-800 bg-opacity-50">
                <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600">All Discussions</TabsTrigger>
                <TabsTrigger value="my-posts" className="data-[state=active]:bg-indigo-600">My Posts</TabsTrigger>
                <TabsTrigger value="no-replies" className="data-[state=active]:bg-indigo-600">Unanswered</TabsTrigger>
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
                        id="post-week"
                        value={newPostWeek === null ? '' : newPostWeek}
                        onChange={(e) => setNewPostWeek(e.target.value ? Number(e.target.value) : null)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200"
                      >
                        <option value="">General Discussion (No specific week)</option>
                        {weeks.map(week => (
                          <option key={week} value={week}>Week {week}</option>
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
                              e.preventDefault();
                              handleAddTag((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          className="border-indigo-600 text-indigo-300"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            handleAddTag(input.value);
                            input.value = '';
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
                              <AvatarFallback className="bg-indigo-900 text-indigo-200">
                                {post.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-xl text-indigo-300">{post.title}</CardTitle>
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <span>{post.userName}</span>
                                <span className="mx-2">•</span>
                                <span>{formatDate(post.timestamp)}</span>
                                {post.weekNumber !== null && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>Week {post.weekNumber}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikePost(post.id)}
                            className="text-gray-400 hover:text-indigo-300"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.likes}
                          </Button>
                        </div>
                        {post.tags.length > 0 && (
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
                      <CardContent className="py-2">
                        <p className="text-gray-300 whitespace-pre-line">{post.content}</p>
                      </CardContent>
                      
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
                                  <AvatarFallback className="bg-indigo-900 text-indigo-200">
                                    {reply.userName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-gray-700 bg-opacity-50 p-3 rounded-md">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm font-medium text-indigo-200">{reply.userName}</p>
                                      <p className="text-xs text-gray-400">{formatDate(reply.timestamp)}</p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleLikeReply(post.id, reply.id)}
                                      className="text-gray-400 hover:text-indigo-300"
                                    >
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      {reply.likes}
                                    </Button>
                                  </div>
                                  <p className="text-gray-300 mt-2 text-sm whitespace-pre-line">{reply.content}</p>
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
                            <AvatarFallback className="bg-indigo-900 text-indigo-200">
                              {currentUser?.name.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder="Write a reply..."
                              value={replyContent[post.id] || ''}
                              onChange={(e) => setReplyContent({...replyContent, [post.id]: e.target.value})}
                              className="flex-1 bg-gray-700 border-gray-600"
                            />
                            <Button
                              className="bg-indigo-600 hover:bg-indigo-700"
                              size="sm"
                              onClick={() => handleAddReply(post.id)}
                              disabled={!replyContent[post.id]?.trim()}
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