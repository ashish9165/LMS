import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'

const AssignmentManager = () => {
  const { navigate, uiTheme, isMobile, isTablet, isDesktop } = useAppContext()
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedCourseContent, setSelectedCourseContent] = useState([])
  const [assignments, setAssignments] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passingScore: 70,
    timeLimit: 30,
    questions: []
  })
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', ''],
    correctAnswer: '',
    points: 1,
    lectureId: '',
    lectureTitle: ''
  })

  useEffect(() => {
    fetchEducatorCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseAssignments()
      fetchCourseContent()
    }
  }, [selectedCourse])

  const fetchEducatorCourses = async () => {
    try {
      const response = await axios.get('/courses/educator/my-courses')
      const fetched = response.data.courses || []
      setCourses(fetched)
      if (!selectedCourse && fetched.length > 0) {
        setSelectedCourse(fetched[0]._id)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchCourseAssignments = async () => {
    try {
      // Fetching assignments for course
      const response = await axios.get(`/assignments/courses/${selectedCourse}/assignments`, {
        withCredentials: true
      })
              // Assignments response
      setAssignments(response.data.assignments || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
      setAssignments([])
    }
  }

  const fetchCourseContent = async () => {
    try {
      const res = await axios.get(`/courses/${selectedCourse}`)
      const content = Array.isArray(res.data.course?.courseContent) ? res.data.course.courseContent : []
      setSelectedCourseContent(content)
    } catch (err) {
      setSelectedCourseContent([])
    }
  }

  const handleAddQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(opt => opt.trim()) && currentQuestion.correctAnswer) {
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion }]
      }))
      setCurrentQuestion({
        question: '',
        options: ['', ''],
        correctAnswer: '',
        points: 1,
        lectureId: '',
        lectureTitle: ''
      })
    } else {
      alert('Please fill all question fields')
    }
  }

  const handleRemoveQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const handleAddOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const handleRemoveOption = (index) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const handleLectureSelect = (lectureId, lectureTitle) => {
    setCurrentQuestion(prev => ({ ...prev, lectureId, lectureTitle }))
    if (!prevQuestionHasText(currentQuestion)) {
      setCurrentQuestion(prev => ({ ...prev, question: `Question related to: ${lectureTitle}` }))
    }
  }

  const prevQuestionHasText = (q) => {
    return q && q.question && q.question.trim().length > 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedCourse) {
      alert('Please select a course first')
      return
    }

    if (formData.questions.length === 0) {
      alert('Please add at least one question')
      return
    }

    try {
      await axios.post(`/assignments/courses/${selectedCourse}/assignments`, formData)
      alert('Assignment created successfully!')
      setShowCreateForm(false)
      setFormData({
        title: '',
        description: '',
        passingScore: 70,
        timeLimit: 30,
        questions: []
      })
      fetchCourseAssignments()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create assignment')
    }
  }

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`/assignments/assignments/${assignmentId}`)
        alert('Assignment deleted successfully!')
        fetchCourseAssignments()
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete assignment')
      }
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 lg:p-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-8'>
          <h1 className={`font-bold text-gray-800 ${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'}`}>
            Assignment Manager
          </h1>
          <p className='text-gray-600 mt-2'>Create and manage course assignments</p>
        </div>
        
        {/* Course Selection */}
        <div className='bg-white rounded-xl shadow-lg border border-red-200 p-6 mb-6'>
          <label className='block text-sm font-semibold text-gray-700 mb-3'>Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className='w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300'
          >
            <option value=''>Choose a course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.courseTitle}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <>
            {/* Create Assignment Button */}
            <div className='mb-6'>
              <button
                onClick={() => setShowCreateForm(true)}
                className='bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold'
              >
                + Create New Assignment
              </button>
            </div>

            {/* Existing Assignments */}
            <div className='bg-white rounded-xl shadow-lg border border-red-200 p-6 mb-6'>
              <h2 className={`font-semibold text-gray-800 mb-6 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Existing Assignments ({assignments.length})
              </h2>
              {assignments.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-gray-500 text-lg'>No assignments created yet.</p>
                  <p className='text-gray-400 text-sm mt-2'>Create your first assignment to get started</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {assignments.map(assignment => (
                    <div key={assignment._id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300'>
                      <div className='flex justify-between items-start'>
                        <div className='flex-1'>
                          <h3 className='font-semibold text-lg text-gray-800 mb-2'>{assignment.title}</h3>
                          <p className='text-gray-600 mb-3'>{assignment.description}</p>
                          <div className='flex flex-wrap gap-4 text-sm'>
                            <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full'>
                              Passing: {assignment.passingScore}%
                            </span>
                            <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full'>
                              Time: {assignment.timeLimit} min
                            </span>
                            <span className='bg-purple-100 text-purple-800 px-3 py-1 rounded-full'>
                              Questions: {assignment.questions?.length || 0}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAssignment(assignment._id)}
                          className='ml-4 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Create Assignment Form */}
        {showCreateForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-xl shadow-2xl p-6 lg:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className={`font-bold text-gray-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  Create New Assignment
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className='p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200'
                >
                  <span className='text-2xl text-gray-500 hover:text-gray-700'>×</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Assignment Title</label>
                  <input
                    type='text'
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300'
                    placeholder='Enter assignment title'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300'
                    rows={3}
                    placeholder='Enter assignment description'
                  />
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Passing Score (%)</label>
                    <input
                      type='number'
                      value={formData.passingScore}
                      onChange={(e) => setFormData(prev => ({ ...prev, passingScore: Number(e.target.value) }))}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300'
                      min={1}
                      max={100}
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Time Limit (minutes)</label>
                    <input
                      type='number'
                      value={formData.timeLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: Number(e.target.value) }))}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300'
                      min={1}
                      required
                    />
                  </div>
                </div>

                {/* Questions Section */}
                <div>
                  <h3 className='text-lg font-semibold mb-3'>Questions</h3>
                  
                  {/* Current Question Form */}
                  <div className='border border-gray-200 rounded-lg p-4 mb-4'>
                    <div className='mb-3'>
                      <label className='block text-sm font-medium mb-1'>Related Lecture (optional)</label>
                      <select
                        value={currentQuestion.lectureId}
                        onChange={(e) => {
                          const lectureId = e.target.value
                          if (!lectureId) {
                            setCurrentQuestion(prev => ({ ...prev, lectureId: '', lectureTitle: '' }))
                            return
                          }
                          // find lecture title
                          let lecTitle = ''
                          for (const chapter of selectedCourseContent) {
                            const found = (chapter.chapterContent || []).find(l => l.lectureId === lectureId)
                            if (found) { lecTitle = found.lectureTitle; break }
                          }
                          handleLectureSelect(lectureId, lecTitle)
                        }}
                        className='w-full p-2 border border-gray-300 rounded-md'
                      >
                        <option value=''>Select lecture (optional)</option>
                        {selectedCourseContent.map((chapter, ci) => (
                          <optgroup key={ci} label={`Chapter: ${chapter.chapterTitle}`}>
                            {(chapter.chapterContent || []).map((lec) => (
                              <option key={lec.lectureId} value={lec.lectureId}>
                                {lec.lectureTitle}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div className='mb-3'>
                      <label className='block text-sm font-medium mb-1'>Question</label>
                      <input
                        type='text'
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                        className='w-full p-2 border border-gray-300 rounded-md'
                        placeholder='Enter your question'
                      />
                    </div>

                    <div className='mb-3'>
                      <label className='block text-sm font-medium mb-1'>Options</label>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className='flex items-center gap-2 mb-2'>
                          <input
                            type='text'
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className='flex-1 p-2 border border-gray-300 rounded-md'
                            placeholder={`Option ${index + 1}`}
                          />
                          <button
                            type='button'
                            onClick={() => handleRemoveOption(index)}
                            className='text-red-500 hover:text-red-700'
                            disabled={currentQuestion.options.length <= 2}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type='button'
                        onClick={handleAddOption}
                        className='text-blue-500 hover:text-blue-700 text-sm'
                      >
                        + Add Option
                      </button>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium mb-1'>Correct Answer</label>
                        <select
                          value={currentQuestion.correctAnswer}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                          className='w-full p-2 border border-gray-300 rounded-md'
                          required
                        >
                          <option value=''>Select correct answer</option>
                          {currentQuestion.options.map((option, index) => (
                            <option key={index} value={option}>
                              {option || `Option ${index + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium mb-1'>Points</label>
                        <input
                          type='number'
                          value={currentQuestion.points}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: Number(e.target.value) }))}
                          className='w-full p-2 border border-gray-300 rounded-md'
                          min={1}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type='button'
                      onClick={handleAddQuestion}
                      className='mt-3 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
                    >
                      Add Question
                    </button>
                  </div>

                  {/* Added Questions List */}
                  {formData.questions.length > 0 && (
                    <div>
                      <h4 className='font-medium mb-2'>Added Questions ({formData.questions.length})</h4>
                      <div className='space-y-2'>
                        {formData.questions.map((q, index) => (
                          <div key={index} className='flex justify-between items-center bg-gray-50 p-3 rounded-md'>
                            <div>
                              <span className='font-medium'>Q{index + 1}:</span> {q.question}
                              {q.lectureTitle && (
                                <span className='text-xs text-gray-500 ml-2'>(Lecture: {q.lectureTitle})</span>
                              )}
                              <span className='text-sm text-gray-500 ml-2'>
                                (Points: {q.points})
                              </span>
                            </div>
                            <button
                              type='button'
                              onClick={() => handleRemoveQuestion(index)}
                              className='text-red-500 hover:text-red-700'
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex gap-4 pt-6 border-t border-gray-200'>
                  <button
                    type='submit'
                    className='bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold'
                  >
                    Create Assignment
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowCreateForm(false)}
                    className='bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 font-semibold'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssignmentManager
