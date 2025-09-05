import React, { useEffect, useRef, useState, useContext } from 'react'
import axios from 'axios'
import uniqid from 'uniqid'
import Quill from 'quill'//pdhna hai 
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext'


const AddCourse = () => {

  const { refreshDashboard, fetchAllCourses } = useContext(AppContext)
  
  // Helper function to format duration from minutes to "Xm Ys" format
  const formatDuration = (durationInMinutes) => {
    if (!durationInMinutes || durationInMinutes === 0) return '0m 0s';
    
    const minutes = Math.floor(durationInMinutes);
    const seconds = Math.round((durationInMinutes - minutes) * 60);
    
    if (seconds === 0) return `${minutes}m`;
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
  }
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const [courseTitle, setCourseTitle] = useState('')
  const [courseprice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureDurationMinutes: "",
    lectureDurationSeconds: "",
    lectureUrl: "",
    isPreviewfree: false,
  })

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  // Manage preview URL lifecycle
  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image)
      setImagePreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setImagePreviewUrl('')
    }
  }, [image])

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      // Selected thumbnail
      setImage(file)
    } else {
      // No file selected
      setImage(null)
    }
  }

  const handelChapter = (action,chapterId) => {
    if (action === 'Add') {
      const title = prompt('Enter chapter Name');
      if (title) {
       const newChapter = {
        chapterId: uniqid(),
        courseTitle: title,
        chapterContent: [],
        collapsed: false,
        chapterOrder: chapters.length >0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1
      }
      setChapters([...chapters, newChapter]);
    }
  } 
  else if(action==='remove') {
    setChapters(chapters.filter(chapter => chapter.chapterId !== chapterId));
  } else if(action==='toggle'){
    setChapters(chapters.map(chapter => chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter));
  }
}

const handleLecture =(action,chapterId,lectureIndex) => {
  if (action === 'Add') {
    setCurrentChapterId(chapterId);
    setShowPopup(true);
  } else if (action === 'remove') {
    setChapters(
  chapters.map(chapter => {
    if (chapter.chapterId === chapterId) {
      chapter.chapterContent.splice(lectureIndex, 1);
    }
    return chapter;
  })
);
}
}
  const addLecture = () => {
    // Calculate total duration in minutes
    const minutes = parseInt(lectureDetails.lectureDurationMinutes) || 0;
    const seconds = parseInt(lectureDetails.lectureDurationSeconds) || 0;
    const totalDuration = minutes + (seconds / 60);
    
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureDuration: totalDuration,
            lectureDurationMinutes: minutes,
            lectureDurationSeconds: seconds,
            lectureOrder: chapter.chapterContent.length > 0 ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1 : 1,
            lectureId: uniqid()
          };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    );
    setShowPopup(false);
    setLectureDetails({
      lectureTitle: "",
      lectureDuration: "",
      lectureDurationMinutes: "",
      lectureDurationSeconds: "",
      lectureUrl: "",
      isPreviewfree: false,
    });
  }
  
  const handleSubmit=async(e)=>{
    e.preventDefault()
    try {
      // Validate course price
      if (courseprice < 0) {
        alert('Error: Course price cannot be negative. Please enter a valid price.')
        return
      }

      // Validate discount
      if (discount < 0 || discount > 100) {
        alert('Error: Discount must be between 0 and 100 percent.')
        return
      }

      // Validate that course must have at least one chapter with lectures
      if (chapters.length === 0) {
        alert('Error: Course content is required. Please add at least one chapter with lectures.')
        return
      }

      // Validate that all chapters must have at least one lecture
      const emptyChapters = chapters.filter(ch => ch.chapterContent.length === 0)
      if (emptyChapters.length > 0) {
//alert(`Error: Chapter "${emptyChapters[0].courseTitle}" has no lectures. Please add at least one lecture to each chapter.`)
        return
      }

      // Build courseContent shape expected by backend
      const normalizedContent = chapters.map(ch => ({
        chapterTitle: ch.courseTitle,
        chapterId: ch.chapterId,
        chapterOrder: ch.chapterOrder,
        chapterContent: ch.chapterContent.map(lec => ({
          lectureTitle: lec.lectureTitle,
          lectureDuration: Number(lec.lectureDuration) || 0,
          lectureUrl: lec.lectureUrl,
          isPreviewFree: !!lec.isPreviewfree,
          lectureOrder: lec.lectureOrder,
          lectureId: lec.lectureId
        }))
      }))

      const descriptionHtml = quillRef.current ? quillRef.current.root.innerHTML : ''

      const formData = new FormData()
      formData.append('courseTitle', courseTitle)
      formData.append('courseDescription', descriptionHtml)
      formData.append('coursePrice', String(courseprice))
      formData.append('discount', String(discount))
      formData.append('courseContent', JSON.stringify(normalizedContent))
      if (image) {
        formData.append('thumbnail', image)
        // Thumbnail appended
      } else {
        // No image selected
      }

      // Debug: Log all form data
      for (let [key, value] of formData.entries()) {
        // FormData entry
      }

      const response = await axios.post('/courses', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Response received

      // Reset form on success
      setCourseTitle('')
      setCoursePrice(0)
      setDiscount(0)
      setImage(null)
      setImagePreviewUrl('')
      setChapters([])
      if (quillRef.current) {
        quillRef.current.setContents([])
      }
      
      // Refresh dashboard and courses list after successful course creation
      refreshDashboard()
      fetchAllCourses()
      
      alert('Course created successfully')
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create course'
      alert(message)
    }
  }
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>Create New Course</h1>
          <p className='text-gray-600'>Fill in the details below to create your course</p>
        </div>
        
        <form onSubmit={handleSubmit} className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <label className='block text-sm font-semibold text-gray-700'>Course Title</label>
              <input 
                onChange={e => setCourseTitle(e.target.value)} 
                value={courseTitle} 
                type='text' 
                placeholder='Enter course title' 
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300' 
                required 
              />
            </div>
            
            <div className='space-y-2'>
              <label className='block text-sm font-semibold text-gray-700'>Course Description</label>
              <div ref={editorRef} className='border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500 transition-all duration-300'></div>
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='space-y-2'>
                <label className='block text-sm font-semibold text-gray-700'>Course Price</label>
                <input 
                  onChange={e => {
                    const value = e.target.value
                    if (value < 0) {
                      setCoursePrice(0)
                    } else {
                      setCoursePrice(value)
                    }
                  }} 
                  value={courseprice} 
                  type='number' 
                  placeholder='0' 
                  min='0'
                  step='0.01'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300' 
                  required 
                />
               
        </div>
              
              <div className='space-y-2'>
                <label className='block text-sm font-semibold text-gray-700'>Discount %</label>
                <input 
                  onChange={e => {
                    const value = e.target.value
                    if (value < 0) {
                      setDiscount(0)
                    } else if (value > 100) {
                      setDiscount(100)
                    } else {
                      setDiscount(value)
                    }
                  }} 
                  value={discount} 
                  type='number' 
                  placeholder='0' 
                  min={0} 
                  max={100} 
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300' 
                  required 
                />
               
        </div>
              
              <div className='space-y-2'>
                <label className='block text-sm font-semibold text-gray-700'>Course Thumbnail</label>
                <label htmlFor='thumbnailImage' className='block cursor-pointer'>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-400 transition-colors duration-300'>
                    <div className='flex flex-col items-center gap-3'>
                      <img src={assets.file_upload_icon} alt='Upload' className='w-8 h-8' />
                      <div className='text-center'>
              {imagePreviewUrl ? (
                <img 
                            className='w-16 h-16 object-cover rounded-lg mx-auto mb-2' 
                  src={imagePreviewUrl} 
                  alt='Thumbnail preview'
                  onError={(e) => {
                    e.target.src = assets.course_1_thumbnail
                  }}
                />
              ) : (
                <img 
                            className='w-16 h-16 object-cover rounded-lg mx-auto mb-2 border border-gray-300' 
                  src={assets.course_1_thumbnail} 
                  alt='Default thumbnail'
                />
              )}
              <span className='text-sm text-gray-500'>
                          {image ? image.name : 'Click to upload image'}
              </span>
            </div>
                    </div>
                  </div>
                  <input type='file' id='thumbnailImage' onChange={handleImageChange} accept='image/*' hidden />
          </label>
        </div>
        </div>

        {/* Adding Chapter and Lecture */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-800'>Course Content</h3>
              
          {chapters.map((chapter,chapterIndex)=>(
                <div key={chapterIndex} className='bg-gray-50 border border-gray-200 rounded-xl overflow-hidden'>
                  <div className='flex justify-between items-center p-4 bg-white border-b border-gray-200'>
                    <div className='flex items-center gap-3'>
                      <img 
                        onClick={()=>handelChapter('toggle',chapter.chapterId)} 
                        src={assets.dropdown_icon}  
                        width={16}
                        alt="" 
                        className={`cursor-pointer transition-transform duration-300 ${chapter.collapsed ? "-rotate-90" : ""}`}
                      />
                      <span className='font-semibold text-gray-800'>Chapter {chapterIndex + 1}: {chapter.courseTitle}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>{chapter.chapterContent.length} Lectures</span>
                      <button 
                        onClick={()=>handelChapter('remove',chapter.chapterId)}
                        className='p-2 hover:bg-red-50 rounded-lg transition-colors duration-200'
                      >
                        <img src={assets.cross_icon} alt='Remove chapter' className='w-4 h-4'/>
                      </button>
                </div>
                </div>
                  
                {!chapter.collapsed && (
                    <div className='p-4 space-y-3'>
                    {chapter.chapterContent.map((lecture, lectureIndex) => (
                        <div key={lectureIndex} className='flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100'>
                          <div className='flex-1'>
                            <span className='font-medium text-gray-800'>{lectureIndex + 1}. {lecture.lectureTitle}</span>
                                                         <div className='flex items-center gap-4 mt-1 text-sm text-gray-600'>
                               <span>⏱️ {formatDuration(lecture.lectureDuration)}</span>
                               <a href={lecture.lectureUrl} target='_blank' className='text-red-500 hover:text-red-600 underline'>🔗 Link</a>
                               <span className={`px-2 py-1 rounded-full text-xs ${lecture.isPreviewfree ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                 {lecture.isPreviewfree ? 'Free Preview' : 'Paid'}
                               </span>
                             </div>
                          </div>
                          <button 
                            onClick={()=>handleLecture('remove',chapter.chapterId,lectureIndex)}
                            className='p-2 hover:bg-red-50 rounded-lg transition-colors duration-200'
                          >
                            <img src={assets.cross_icon} alt='Remove lecture' className='w-4 h-4'/>
                          </button>
                      </div>
                    ))}
                      <button 
                        onClick={()=>handleLecture('Add',chapter.chapterId)}
                        className='w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium'
                      >
                        + Add Lecture
                      </button>
                  </div>
                )}
              </div>
          ))}
              
              <button 
                onClick={() => handelChapter('Add')}
                className='w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg'
              >
                + Add Chapter
              </button>
            </div>

            {/* Submit Button */}
            <button 
              type='submit' 
              className='w-full py-4 px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg'
            >
              Create Course
            </button>
          </div>
        </form>
      </div>

      {/* Add Lecture Popup */}
          {showPopup && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white rounded-2xl shadow-2xl p-6 relative w-full max-w-md mx-4'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-semibold text-gray-800'>Add New Lecture</h2>
              <button 
                onClick={() => setShowPopup(false)}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200'
              >
                <img src={assets.cross_icon} alt='Close' className='w-5 h-5'/>
              </button>
                  </div>
            
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Lecture Title</label>
                <input 
                  type='text' 
                  value={lectureDetails.lectureTitle} 
                  onChange={e => setLectureDetails({...lectureDetails, lectureTitle: e.target.value})} 
                  placeholder='Enter lecture title' 
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300' 
                />
                    </div>
              
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Minutes</label>
                  <input 
                    type='number' 
                    value={lectureDetails.lectureDurationMinutes} 
                    onChange={(e) => setLectureDetails({...lectureDetails, lectureDurationMinutes: e.target.value})} 
                    placeholder='0' 
                    min='0'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300' 
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Seconds</label>
                  <input 
                    type='number' 
                    value={lectureDetails.lectureDurationSeconds} 
                    onChange={(e) => setLectureDetails({...lectureDetails, lectureDurationSeconds: e.target.value})} 
                    placeholder='0' 
                    min='0'
                    max='59'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300' 
                  />
                </div>
              </div>
              <div className='text-center'>
                <span className='text-sm text-gray-500'>
                  Total: {lectureDetails.lectureDurationMinutes || 0}m {lectureDetails.lectureDurationSeconds || 0}s
                </span>
              </div>
              
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Lecture URL</label>
                <input 
                  type='text' 
                  value={lectureDetails.lectureUrl} 
                  onChange={(e) => setLectureDetails({...lectureDetails, lectureUrl: e.target.value})} 
                  placeholder='Enter video URL' 
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300' 
                />
              </div>
              
              <div className='flex items-center gap-3'>
                <input 
                  type='checkbox' 
                  id='isPreviewFree'
                  checked={lectureDetails.isPreviewfree} 
                  onChange={(e) => setLectureDetails({...lectureDetails, isPreviewfree: e.target.checked})} 
                  className='w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500 focus:ring-2' 
                />
                <label htmlFor='isPreviewFree' className='text-sm font-medium text-gray-700'>
                  Free Preview (students can watch without enrolling)
                </label>
              </div>
              
              <button 
                type='button' 
                onClick={addLecture} 
                className='w-full py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg'
              >
                Add Lecture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddCourse;
