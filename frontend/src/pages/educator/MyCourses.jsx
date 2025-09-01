import React, { useEffect,useState, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import Loading from '../../components/students/Loading'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const MyCourses = () => {
  const {currency, allcourses, refreshDashboard, fetchAllCourses} = useContext(AppContext)
  const [courses, setCourses] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const navigate = useNavigate();
    
  const fetchEducatorCourses=async () => {
    try {
      const res = await axios.get('/courses/educator/my-courses')
      setCourses(res.data.courses || [])
    } catch (err) {
      setCourses([])
    }
  }

  const handleEdit = (courseId) => {
    navigate(`/educator/edit-course/${courseId}`)
  }

  const handleDelete = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return
    }

    setDeletingCourse(courseId)
    try {
      await axios.delete(`/courses/${courseId}`, { withCredentials: true })
      alert('Course deleted successfully!')
      fetchEducatorCourses()
      refreshDashboard()
      fetchAllCourses()
    } catch (error) {
      console.error('Error deleting course:', error)
      const msg = error?.response?.data?.message || 'Failed to delete course'
      alert(msg)
    } finally {
      setDeletingCourse(null)
    }
  }
    
  useEffect(() => {
    fetchEducatorCourses()
    refreshDashboard() // Refresh dashboard when MyCourses loads
  },[allcourses])

  return courses ? (
    <div className='min-h-screen bg-gradient-to-br from-red-50 to-white p-4 sm:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header Section */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-red-700 mb-2'>My Courses</h1>
            <p className='text-gray-600 text-sm sm:text-base'>Manage and track your course performance</p>
          </div>
          <button
            onClick={() => navigate('/educator/add-course')}
            className='bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105'
          >
            <span className='hidden sm:inline'>Add New Course</span>
            <span className='sm:hidden'>Add Course</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8'>
          <div className='bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Total Courses</p>
                <p className='text-2xl font-bold text-red-700'>{courses.length}</p>
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
                <p className='text-sm text-gray-600'>Total Students</p>
                <p className='text-2xl font-bold text-green-700'>
                  {courses.reduce((sum, course) => sum + (course.enrolledStudents?.length || 0), 0)}
                </p>
              </div>
              <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                <svg className='w-5 h-5 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' />
                </svg>
              </div>
            </div>
          </div>
          
          <div className='bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Total Earnings</p>
                <p className='text-2xl font-bold text-blue-700'>
                  {currency}{courses.reduce((sum, course) => sum + Math.floor((course.enrolledStudents?.length || 0) * (course.coursePrice - (course.discount * course.coursePrice / 100))), 0)}
                </p>
              </div>
              <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' />
                </svg>
              </div>
            </div>
          </div>
          
          <div className='bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Avg. Rating</p>
                <p className='text-2xl font-bold text-purple-700'>
                  {courses.length > 0 ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1) : '0.0'}
                </p>
              </div>
              <div className='w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center'>
                <svg className='w-5 h-5 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.56.406-.82 1.196-.363 1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
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
                  <th className='px-4 py-4 text-left font-semibold text-sm sm:text-base hidden sm:table-cell'>Earnings</th>
                  <th className='px-4 py-4 text-left font-semibold text-sm sm:text-base hidden lg:table-cell'>Students</th>
                  <th className='px-4 py-4 text-left font-semibold text-sm sm:text-base hidden md:table-cell'>Published</th>
                  <th className='px-4 py-4 text-center font-semibold text-sm sm:text-base'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-red-100'>
                {courses.map(course => (
                  <tr key={course._id} className='hover:bg-red-50 transition-colors duration-200'>
                    <td className='px-4 py-4'>
                      <div className='flex items-center space-x-3'>
                        <img 
                          src={course.courseThumbnail || assets.course_1_thumbnail} 
                          alt={course.courseTitle}
                          className='w-12 h-12 sm:w-16 sm:h-12 object-cover rounded-lg shadow-sm'
                          onError={(e) => {
                            e.target.src = assets.course_1_thumbnail
                          }}
                        />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm sm:text-base font-medium text-gray-900 truncate'>{course.courseTitle}</p>
                          <p className='text-xs text-gray-500 hidden sm:block'>{course.courseDescription?.substring(0, 50)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-4 hidden sm:table-cell'>
                      <span className='text-sm font-semibold text-green-600'>
                        {currency}{Math.floor((course.enrolledStudents?.length || 0) * (course.coursePrice - (course.discount * course.coursePrice / 100)))}
                      </span>
                    </td>
                    <td className='px-4 py-4 hidden lg:table-cell'>
                      <span className='text-sm text-gray-600'>{course.enrolledStudents?.length || 0} students</span>
                    </td>
                    <td className='px-4 py-4 hidden md:table-cell'>
                      <span className='text-sm text-gray-600'>{new Date(course.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() => handleEdit(course._id)}
                          className='bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md'
                          title='Edit Course'
                        >
                          <span className='hidden sm:inline'>Edit</span>
                          <span className='sm:hidden'>✏️</span>
                        </button>
                        <button
                          onClick={() => handleDelete(course._id, course.courseTitle)}
                          disabled={deletingCourse === course._id}
                          className='bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                          title='Delete Course'
                        >
                          {deletingCourse === course._id ? (
                            <span className='hidden sm:inline'>Deleting...</span>
                          ) : (
                            <>
                              <span className='hidden sm:inline'>Delete</span>
                              <span className='sm:hidden'>🗑️</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {courses.length === 0 && (
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>No courses yet</h3>
              <p className='text-gray-500 mb-4'>Get started by creating your first course</p>
              <button
                onClick={() => navigate('/educator/add-course')}
                className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200'
              >
                Create Your First Course
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default MyCourses
