import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { Line } from 'rc-progress'
import Footer from '../../components/students/footer'
import axios from 'axios'
import { Link } from 'react-router-dom'

const MyEnrollment = () => {

  const { enrolledCourses, calculateCourseDuration, navigate, fetchEnrolledCourses, fetchAllCourses } = useContext(AppContext)
  const [ratingByCourse, setRatingByCourse] = useState({})

  useEffect(() => {
    fetchEnrolledCourses()
  }, [])

  const getProgress = (course) => {
    const totalLectures = Array.isArray(course.courseContent)
      ? course.courseContent.reduce((sum, ch) => sum + (Array.isArray(ch.chapterContent) ? ch.chapterContent.length : 0), 0)
      : 0
    const completedLectures = Array.isArray(course?._enrollment?.progress?.completedLectures)
      ? course._enrollment.progress.completedLectures.length
      : 0
    return { completedLectures, totalLectures }
  }

  const submitRating = async (courseId) => {
    const rating = Number(ratingByCourse[courseId] || 0)
    if (!rating || rating < 1 || rating > 5) {
      alert('Please select a rating 1-5')
      return
    }
    try {
      await axios.post(`/courses/${courseId}/rate`, { rating }, { withCredentials: true })
      // refresh global + enrolled views
      try { await fetchAllCourses() } catch (_) {}
      try { await fetchEnrolledCourses() } catch (_) {}
      alert('Thanks for your rating!')
    } catch (e) {
      const msg = e?.response?.data?.message || 'Rating failed'
      alert(msg)
    }
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-red-50 to-white p-4 sm:p-6 lg:p-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Header Section */}
          <div className='mb-6 sm:mb-8'>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-red-700 mb-2'>My Enrollments</h1>
            <p className='text-gray-600 text-sm sm:text-base'>Track your learning progress and achievements</p>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8'>
            <div className='bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Total Courses</p>
                  <p className='text-2xl font-bold text-red-700'>{enrolledCourses.length}</p>
                </div>
                <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                  <svg className='w-5 h-5 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className='bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Completed</p>
                  <p className='text-2xl font-bold text-green-700'>
                    {enrolledCourses.filter(course => {
                      const p = getProgress(course)
                      return p.totalLectures > 0 && p.completedLectures === p.totalLectures
                    }).length}
                  </p>
                </div>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                  <svg className='w-5 h-5 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className='bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>In Progress</p>
                  <p className='text-2xl font-bold text-blue-700'>
                    {enrolledCourses.filter(course => {
                      const p = getProgress(course)
                      return p.totalLectures > 0 && p.completedLectures < p.totalLectures
                    }).length}
                  </p>
                </div>
                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                  <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className='bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Total Hours</p>
                  <p className='text-2xl font-bold text-purple-700'>
                    {enrolledCourses.reduce((sum, course) => sum + calculateCourseDuration(course).split(' ')[0], 0)}h
                  </p>
                </div>
                <div className='w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center'>
                  <svg className='w-5 h-5 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Table */}
          <div className='bg-white rounded-lg shadow-lg overflow-hidden border border-red-100'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-red-600 to-red-700 text-white'>
                  <tr>
                    <th className='px-4 py-4 text-left font-semibold text-sm sm:text-base'>Course</th>
                    <th className='px-4 py-4 text-left font-semibold text-sm sm:text-base hidden lg:table-cell'>Duration</th>
                    <th className='px-4 py-4 text-left font-semibold text-sm sm:text-base hidden md:table-cell'>Progress</th>
                    <th className='px-4 py-4 text-center font-semibold text-sm sm:text-base hidden sm:table-cell'>Assignments</th>
                    <th className='px-4 py-4 text-center font-semibold text-sm sm:text-base'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-red-100'>
                  {enrolledCourses.map((course, index) => {
                    const p = getProgress(course)
                    const percent = p.totalLectures > 0 ? (p.completedLectures * 100) / p.totalLectures : 0
                    const isCompleted = p.totalLectures > 0 && p.completedLectures === p.totalLectures
                    return (
                      <tr key={index} className='hover:bg-red-50 transition-colors duration-200'>
                        <td className='px-4 py-4'>
                          <div className='flex items-center space-x-3'>
                            <img 
                              src={course.courseThumbnail} 
                              alt={course.courseTitle}
                              className='w-12 h-12 sm:w-16 sm:h-12 object-cover rounded-lg shadow-sm'
                            />
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm sm:text-base font-medium text-gray-900 truncate'>{course.courseTitle}</p>
                              <div className='mt-2'>
                                <Line 
                                  strokeWidth={3} 
                                  percent={percent} 
                                  strokeColor={percent === 100 ? '#10B981' : '#EF4444'}
                                  trailColor='#F3F4F6'
                                  className='rounded-full'
                                />
                                <p className='text-xs text-gray-500 mt-1'>{Math.round(percent)}% Complete</p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4 hidden lg:table-cell'>
                          <span className='text-sm text-gray-600'>{calculateCourseDuration(course)}</span>
                        </td>
                        <td className='px-4 py-4 hidden md:table-cell'>
                          <span className='text-sm text-gray-600'>{p.completedLectures} / {p.totalLectures} lectures</span>
                        </td>
                        <td className='px-4 py-4 hidden sm:table-cell text-center'>
                          {isCompleted ? (
                            <button 
                              onClick={() => navigate(`/course/${course._id}/assignments`)}
                              className='bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md'
                            >
                              View Assignments
                            </button>
                          ) : (
                            <span className='text-gray-500 text-sm'>Complete videos first</span>
                          )}
                        </td>
                        <td className='px-4 py-4 text-center'>
                          <button 
                            onClick={() => navigate('/players/' + course._id)} 
                            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md ${
                              isCompleted 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            {isCompleted ? 'Completed' : 'Continue'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Empty State */}
            {enrolledCourses.length === 0 && (
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>No enrollments yet</h3>
                <p className='text-gray-500 mb-4'>Start your learning journey by enrolling in courses</p>
                <button
                  onClick={() => navigate('/course-list')}
                  className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200'
                >
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default MyEnrollment
