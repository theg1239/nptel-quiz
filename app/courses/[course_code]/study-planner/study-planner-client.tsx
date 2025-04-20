'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import SpaceLoader from '@/components/space-loader';
import { getCourseMaterials, saveStudyPlan, getStudyPlan } from '@/lib/actions/actions';

type Material = {
  id: string;
  title: string;
  type: string;
  weekNumber?: number | null;
};

type StudyTask = {
  id: string;
  materialId: string;
  title: string;
  completed: boolean;
  dueDate: string;
  notes: string;
};

export default function StudyPlannerClient({
  courseCode,
  courseName,
}: {
  courseCode: string;
  courseName: string;
}) {
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [newTask, setNewTask] = useState({
    materialId: '',
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [materialsData, studyPlanData] = await Promise.all([
          getCourseMaterials(courseCode),
          getStudyPlan(courseCode),
        ]);

        setMaterials(materialsData);

        if (studyPlanData && studyPlanData.tasks) {
          setTasks(studyPlanData.tasks);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading study planner data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [courseCode]);

  const handleAddTask = async () => {
    if (!newTask.materialId || !newTask.title || !newTask.dueDate) {
      return;
    }

    const task: StudyTask = {
      id: Date.now().toString(),
      materialId: newTask.materialId,
      title: newTask.title,
      completed: false,
      dueDate: newTask.dueDate,
      notes: newTask.notes,
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);

    setNewTask({
      materialId: '',
      title: '',
      dueDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowAddForm(false);

    await saveStudyPlan(courseCode, updatedTasks);
  };

  const handleToggleComplete = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    setTasks(updatedTasks);
    await saveStudyPlan(courseCode, updatedTasks);
  };

  const handleDeleteTask = async (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    await saveStudyPlan(courseCode, updatedTasks);
  };

  const startEditTask = (task: StudyTask) => {
    setEditingTask({ ...task });
  };

  const cancelEditTask = () => {
    setEditingTask(null);
  };

  const saveEditTask = async () => {
    if (!editingTask) return;

    const updatedTasks = tasks.map(task => (task.id === editingTask.id ? editingTask : task));

    setTasks(updatedTasks);
    setEditingTask(null);
    await saveStudyPlan(courseCode, updatedTasks);
  };

  const upcomingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const completedTasks = tasks
    .filter(task => task.completed)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const progressPercentage =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const materialsByType: Record<string, Material[]> = {};
  materials.forEach(material => {
    if (!materialsByType[material.type]) {
      materialsByType[material.type] = [];
    }
    materialsByType[material.type].push(material);
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <SpaceLoader size={100} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pb-20 text-gray-100">
      <div className="container mx-auto max-w-5xl p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = `/courses/${courseCode}`)}
              className="mr-4 flex items-center text-indigo-300 transition-colors hover:bg-indigo-900 hover:text-indigo-100"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">{courseName}</h1>
          <p className="text-lg text-indigo-200">Study Planner</p>
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-md md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl text-indigo-300">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between">
                <span>Course Completion</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress
                value={progressPercentage}
                className="h-2 bg-gray-700"
                indicatorClassName="bg-indigo-500"
              />

              <div className="mt-4 text-sm text-gray-300">
                <div className="mb-2 flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                  <span>Completed: {completedTasks.length} tasks</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-yellow-400" />
                  <span>Remaining: {upcomingTasks.length} tasks</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl text-indigo-300">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="mb-3 w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Study Task
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-200 hover:bg-gray-700"
                onClick={() => (window.location.href = `/courses/${courseCode}/materials`)}
              >
                <Calendar className="mr-2 h-4 w-4" /> Browse Materials
              </Button>
            </CardContent>
          </Card>
        </div>

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-indigo-700 bg-indigo-900 bg-opacity-50 backdrop-blur-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-indigo-300">Add New Study Task</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:bg-indigo-800 hover:text-white"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Material</label>
                    <select
                      value={newTask.materialId}
                      onChange={e => {
                        const selectedMaterial = materials.find(m => m.id === e.target.value);
                        setNewTask({
                          ...newTask,
                          materialId: e.target.value,
                          title: selectedMaterial ? selectedMaterial.title : '',
                        });
                      }}
                      className="w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-gray-100"
                    >
                      <option value="">Select a material</option>
                      {Object.entries(materialsByType).map(([type, materials]) => (
                        <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
                          {materials.map(material => (
                            <option key={material.id} value={material.id}>
                              {material.title}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Title</label>
                    <Input
                      value={newTask.title}
                      onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Study task title"
                      className="border-gray-700 bg-gray-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Due Date</label>
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="border-gray-700 bg-gray-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={newTask.notes}
                      onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                      placeholder="Add notes about this task"
                      className="min-h-[80px] w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-gray-100"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddTask} className="bg-indigo-600 hover:bg-indigo-700">
                      Add Task
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6 border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-md">
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingTasks.length === 0 ? (
              <Card className="mb-6 border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-md">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-300">No upcoming tasks.</p>
                  <Button
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Your First Task
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingTasks.map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {editingTask && editingTask.id === task.id ? (
                      <Card className="border-indigo-700 bg-indigo-900 bg-opacity-50 backdrop-blur-md">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-300">
                                Title
                              </label>
                              <Input
                                value={editingTask.title}
                                onChange={e =>
                                  setEditingTask({ ...editingTask, title: e.target.value })
                                }
                                className="border-gray-700 bg-gray-800 text-white"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-300">
                                Due Date
                              </label>
                              <Input
                                type="date"
                                value={editingTask.dueDate}
                                onChange={e =>
                                  setEditingTask({ ...editingTask, dueDate: e.target.value })
                                }
                                className="border-gray-700 bg-gray-800 text-white"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-300">
                                Notes
                              </label>
                              <textarea
                                value={editingTask.notes}
                                onChange={e =>
                                  setEditingTask({ ...editingTask, notes: e.target.value })
                                }
                                className="min-h-[80px] w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-gray-100"
                              />
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                              <Button
                                variant="outline"
                                onClick={cancelEditTask}
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={saveEditTask}
                                className="bg-indigo-600 hover:bg-indigo-700"
                              >
                                <Save className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-md">
                        <CardContent className="pt-6">
                          <div className="flex items-start">
                            <button
                              onClick={() => handleToggleComplete(task.id)}
                              className="mr-3 mt-1 text-gray-400 hover:text-indigo-300"
                            >
                              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current" />
                            </button>

                            <div className="flex-grow">
                              <h3 className="text-lg font-medium text-white">{task.title}</h3>

                              {task.notes && (
                                <p className="mt-1 text-sm text-gray-400">{task.notes}</p>
                              )}

                              <div className="mt-3 flex items-center text-sm">
                                <Calendar className="mr-1 h-4 w-4 text-indigo-400" />
                                <span className="text-gray-300">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>

                                {new Date(task.dueDate) < new Date() && (
                                  <span className="ml-3 flex items-center text-red-400">
                                    <AlertCircle className="mr-1 h-4 w-4" />
                                    Overdue
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditTask(task)}
                                className="mr-1 text-gray-400 hover:bg-gray-700 hover:text-indigo-300"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-gray-400 hover:bg-gray-700 hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedTasks.length === 0 ? (
              <Card className="mb-6 border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-md">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-300">No completed tasks yet.</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Mark tasks as complete to see them here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedTasks.map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-md">
                      <CardContent className="pt-6">
                        <div className="flex items-start">
                          <button
                            onClick={() => handleToggleComplete(task.id)}
                            className="mr-3 mt-1 text-green-500"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>

                          <div className="flex-grow">
                            <h3 className="text-lg font-medium text-gray-400 line-through">
                              {task.title}
                            </h3>

                            {task.notes && (
                              <p className="mt-1 text-sm text-gray-500 line-through">
                                {task.notes}
                              </p>
                            )}

                            <div className="mt-3 flex items-center text-sm">
                              <Calendar className="mr-1 h-4 w-4 text-gray-500" />
                              <span className="text-gray-500">
                                Completed: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-gray-500 hover:bg-gray-700 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
