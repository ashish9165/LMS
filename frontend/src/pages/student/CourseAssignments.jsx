import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { assets } from '../../assets/assets'

const CourseAssignments = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourseAndAssignments()
  }, [courseId])

  const fetchCourseAndAssignments = async () => {
    try {
      // Fetch course details
      const courseRes = await axios.get(`/courses/${courseId}`)
      setCourse(courseRes.data.course)

      // Fetch assignments for the course
      const assignmentsRes = await axios.get(`/assignments/courses/${courseId}/assignments?studentView=true`)
      setAssignments(assignmentsRes.data.assignments)
      
      setLoading(false)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch course assignments')
      setLoading(false)
    }
  }

  const startAssignment = (assignmentId) => {
    navigate(`/assignments/${assignmentId}`)
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p>Loading assignments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-500 mb-4'>{error}</p>
          <button
            onClick={() => navigate('/my-enrollments')}
            className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
          >
            Back to Enrollments
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* Course Header */}
        <div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
          <div className='flex items-center gap-6'>
            {course.courseThumbnail && (
              <img 
                src={course.courseThumbnail} 
                alt={course.courseTitle} 
                className='w-24 h-24 object-cover rounded-lg'
              />
            )}
            <div>
              <h1 className='text-3xl font-bold text-gray-800 mb-2'>{course.courseTitle}</h1>
              <p className='text-gray-600 mb-4'>{course.courseDescription}</p>
              <div className='flex items-center gap-6 text-sm text-gray-500'>
                <span>📚 {course.courseContent?.length || 0} Chapters</span>
                <span>🎥 {course.courseContent?.reduce((total, ch) => total + (ch.chapterContent?.length || 0), 0) || 0} Lectures</span>
                <span>👨‍🏫 {course.educator?.name || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Section */}
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-bold text-gray-800'>Course Assignments</h2>
            <button
              onClick={() => navigate('/my-enrollments')}
              className='bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600'
            >
              Back to Enrollments
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-gray-400 mb-4'>
                <svg className='w-24 h-24 mx-auto' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9 12a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm1-8a1 1 0 00-1 1v3a1 1 0 102 0V5a1 1 0 00-1-1z' clipRule='evenodd' />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-600 mb-2'>No Assignments Available</h3>
              <p className='text-gray-500'>
                This course doesn't have any assignments yet. Check back later!
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {assignments.map((assignment, index) => (
                <div key={assignment._id} className='border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200'>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                        {index + 1}. {assignment.title}
                      </h3>
                      <p className='text-gray-600 mb-4'>{assignment.description}</p>
                      
                      <div className='flex items-center gap-6 text-sm text-gray-500'>
                        <span>⏱️ Time Limit: {assignment.timeLimit} minutes</span>
                        <span>📝 Questions: {assignment.questions?.length || 0}</span>
                        <span>🎯 Passing Score: {assignment.passingScore}%</span>
                      </div>
                    </div>
                    
                    <div className='ml-6'>
                      <button
                        onClick={() => startAssignment(assignment._id)}
                        className='bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors duration-200 font-semibold'
                      >
                        Start Assignment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6'>
          <h3 className='text-lg font-semibold text-blue-800 mb-3'>📋 Assignment Instructions</h3>
          <ul className='text-blue-700 space-y-2'>
            <li>• Complete all course videos before attempting assignments</li>
            <li>• Each assignment has a time limit - manage your time wisely</li>
            <li>• You need to achieve the passing score to earn a certificate</li>
            <li>• You can only attempt each assignment once</li>
            <li>• Upon successful completion, you'll be eligible for a certificate</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CourseAssignments
