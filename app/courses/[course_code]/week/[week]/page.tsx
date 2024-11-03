"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  question: string
  options: string[]
  answer: string[]
}

interface Week {
  name: string
  questions: Question[]
}

export default function WeekQuiz({ params }: { params: { course_code: string, week: string } }) {
  const [weekData, setWeekData] = useState<Week | null>(null)
  const { course_code, week } = params

  useEffect(() => {
    // Fetch the week data for the specific course and week
    fetch(`https://api.examcooker.in/courses/${course_code}/week/${week}`)
      .then(res => res.json())
      .then(data => setWeekData(data))
      .catch(error => console.error('Error fetching week data:', error))
  }, [course_code, week])

  if (!weekData) return <p>Loading...</p> // Show loading while fetching data

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">Week {weekData.name} Quiz</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-3xl w-full">
        {weekData.questions.map((q, index) => (
          <div key={index} className="mb-6">
            <p className="text-lg font-semibold mb-2">{q.question}</p>
            <ul>
              {q.options.map((option, idx) => (
                <li key={idx} className="text-gray-300 mb-1">
                  {option}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
