import React, { useEffect, useRef, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/students/Loading'

const EditCourse = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currency, refreshDashboard, fetchAllCourses } = useContext(AppContext)
  
  const [courseData, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [courseTitle, setCourseTitle] = useState('')
  const [courseDescription, setCourseDescription] = useState('')
  const [coursePrice, setCoursePrice] = useState('')
  const [discount, setDiscount] = useState('')
  const [courseContent, setCourseContent] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`/courses/${id}`)
        const course = res.data.course
        setCourseData(course)
        setCourseTitle(course.courseTitle || '')
        setCourseDescription(course.courseDescription || '')
        setCoursePrice(course.coursePrice || '')
        setDiscount(course.discount || '')
        setCourseContent(JSON.stringify(course.courseContent || [], null, 2))
        setImagePreview(course.courseThumbnail || '')
      } catch (error) {
        console.error('Error fetching course:', error)
        alert('Failed to load course data')
        navigate('/educator/my-courses')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCourse()
  }, [id, navigate])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formData = new FormData()
      formData.append('courseTitle', courseTitle)
      formData.append('courseDescription', courseDescription)
      formData.append('coursePrice', coursePrice)
      formData.append('discount', discount)
      formData.append('courseContent', courseContent)

      if (image) {
        formData.append('thumbnail', image)
      }

      await axios.put(`/courses/${id}`, formData, { withCredentials: true })
      
      alert('Course updated successfully!')
      refreshDashboard()
      fetchAllCourses()
      navigate('/educator/my-courses')
    } catch (error) {
      console.error('Error updating course:', error)
      const msg = error?.response?.data?.message || 'Failed to update course'
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className='min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='w-full max-w-4xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-semibold text-gray-800'>Edit Course</h1>
          <button
            onClick={() => navigate('/educator/my-courses')}
            className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50'
          >
            Back to My Courses
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6 bg-white p-6 rounded-lg shadow-sm border'>
          {/* Course Title */}
          <div>
            <label htmlFor='courseTitle' className='block text-sm font-medium text-gray-700 mb-2'>
              Course Title *
            </label>
            <input
              type='text'
              id='courseTitle'
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter course title'
            />
          </div>

          {/* Course Description */}
          <div>
            <label htmlFor='courseDescription' className='block text-sm font-medium text-gray-700 mb-2'>
              Course Description *
            </label>
            <textarea
              id='courseDescription'
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              required
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter course description'
            />
          </div>

          {/* Price and Discount */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='coursePrice' className='block text-sm font-medium text-gray-700 mb-2'>
                Course Price ({currency}) *
              </label>
              <input
                type='number'
                id='coursePrice'
                value={coursePrice}
                onChange={(e) => setCoursePrice(e.target.value)}
                required
                min='0'
                step='0.01'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='0.00'
              />
            </div>
            <div>
              <label htmlFor='discount' className='block text-sm font-medium text-gray-700 mb-2'>
                Discount (%) *
              </label>
              <input
                type='number'
                id='discount'
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                required
                min='0'
                max='100'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='0'
              />
            </div>
          </div>

          {/* Course Content */}
          <div>
            <label htmlFor='courseContent' className='block text-sm font-medium text-gray-700 mb-2'>
              Course Content (JSON) *
            </label>
            <textarea
              id='courseContent'
              value={courseContent}
              onChange={(e) => setCourseContent(e.target.value)}
              required
              rows={8}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm'
              placeholder='Enter course content in JSON format'
            />
            <p className='text-xs text-gray-500 mt-1'>
              Format: Array of chapters with title and content arrays
            </p>
          </div>

          {/* Thumbnail */}
          <div>
            <label htmlFor='thumbnailImage' className='block text-sm font-medium text-gray-700 mb-2'>
              Course Thumbnail
            </label>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-3'>
                <img src={assets.file_upload_icon} alt='Upload' className='p-3 bg-red-500 rounded' />
                <input
                  type='file'
                  id='thumbnailImage'
                  onChange={handleImageChange}
                  accept='image/*'
                  hidden
                />
                <label htmlFor='thumbnailImage' className='cursor-pointer'>
                  <div className='flex items-center gap-2'>
                    {imagePreview ? (
                      <img
                        className='max-h-16 w-16 object-cover rounded border'
                        src={imagePreview}
                        alt='Thumbnail preview'
                        onError={(e) => { e.target.src = assets.course_1_thumbnail }}
                      />
                    ) : (
                      <img
                        className='max-h-16 w-16 object-cover rounded border border-gray-300'
                        src={assets.course_1_thumbnail}
                        alt='Default thumbnail'
                      />
                    )}
                    <span className='text-sm text-gray-500'>
                      {image ? image.name : 'Click to change thumbnail'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex gap-4 pt-4'>
            <button
              type='submit'
              disabled={saving}
              className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {saving ? 'Updating...' : 'Update Course'}
            </button>
            <button
              type='button'
              onClick={() => navigate('/educator/my-courses')}
              className='px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCourse
