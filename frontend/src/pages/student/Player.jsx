import React, { useContext, useEffect ,useState} from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube'
import Footer from '../../components/students/footer'
import Rating from '../../components/students/Rating'
import axios from 'axios'

const Player = () => {
  const { enrolledCourses, calculateChapterTime, fetchAllCourses, navigate, fetchEnrolledCourses } = useContext(AppContext)
  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [playerData, setPlayerData] = useState(null)
  const [ratingValue, setRatingValue] = useState(0)
  
  const getYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null
    try {
      const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([\w-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([\w-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([\w-]{11})/
      ]
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) return match[1]
      }
      const u = new URL(url)
      const id = u.searchParams.get('v')
      if (id && id.length === 11) return id
      return null
    } catch (_) {
      return null
    }
  }

  const getCourseData = () => {
     enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course)
      }
    })
  }
  const troggleSection = (index) => {
    setOpenSections((prev) => (
      {
        ...prev,
        [index]: !prev[index],
      }
    ))
  }

  useEffect(() => {
    getCourseData()
  },[enrolledCourses])

  useEffect(() => {
    // Initialize rating from enrollment if present
    if (courseData && courseData._enrollment && courseData._enrollment.rating && courseData._enrollment.rating.rating) {
      setRatingValue(Number(courseData._enrollment.rating.rating) || 0)
    }
  }, [courseData])

  const isLectureCompleted = (lectureId) => {
    const completed = courseData?._enrollment?.progress?.completedLectures || []
    return completed.includes(lectureId)
  }

  const getProgress = () => {
    if (!courseData) return { completed: 0, total: 0 }
    const total = (courseData.courseContent || []).reduce((sum, ch) => sum + (ch.chapterContent?.length || 0), 0)
    const completed = courseData._enrollment?.progress?.completedLectures?.length || 0
    return { completed, total }
  }

  const markCompleted = async () => {
    if (!playerData?.lectureId || isLectureCompleted(playerData.lectureId)) return
    try {
      await axios.put(`/courses/${courseId}/progress/${playerData.lectureId}`, {}, { withCredentials: true })
      // Optimistically update local state
      setCourseData(prev => {
        if (!prev) return prev
        const updated = { ...prev, _enrollment: { ...prev._enrollment, progress: { ...prev._enrollment.progress } } }
        const arr = new Set(updated._enrollment.progress.completedLectures || [])
        arr.add(playerData.lectureId)
        updated._enrollment.progress.completedLectures = Array.from(arr)
        updated._enrollment.progress.lastAccessed = new Date().toISOString()
        return updated
      })
      try { await fetchEnrolledCourses() } catch (_) {}
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to mark completed'
      alert(msg)
    }
  }

  const { completed, total } = getProgress()
  const allCompleted = total > 0 && completed === total

  const submitRating = async (value) => {
    try {
      const ratingToSend = Number(value ?? ratingValue)
      await axios.post(`/courses/${courseId}/rate`, { rating: ratingToSend }, { withCredentials: true })
      // Refresh course details for accurate rating count
      try {
        const res = await axios.get(`/courses/${courseId}`)
        // If this course is in enrolledCourses, update local state minimally
        setCourseData(res.data.course)
      } catch (_) {}
      // Refresh global for list/cards
      try { await fetchAllCourses() } catch (_) {}
      setRatingValue(ratingToSend)
    } catch (e) {
      const msg = e?.response?.data?.message || 'Rating failed'
      alert(msg)
    }
  }

  return (
    <>
      <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-3 gap-10 md:px-12'>
        {/* left column */}
        <div className='text-gray-800'>
          <h2 className='text-xl font-semibold'>Course Structure</h2>
          <div className="pt-5">
            {courseData && courseData.courseContent.map((chapter, index) => (
              <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
                <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none' onClick={() => troggleSection(index)}>
                  <div className='flex items-center gap-2'>
                    <img className={`transform transition-transform ${openSections
                    [index] ? 'rotate-180' : ''
                      }`}
                      src={assets.down_arrow_icon} alt="arrow icon" />
                    <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                  </div>
                  <p className='text-sm md:text-default'>{chapter.chapterContent.length} lecture -{
                    calculateChapterTime(chapter)}
                  </p>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                  <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className='flex items-start gap-2 py-1'>
                        <img src={isLectureCompleted(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon} alt='status icon' className='w-4 h-4 mt-1' />
                        <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                          <p>{lecture.lectureTitle}</p>
                          <div className='flex gap-2'>
                            {lecture.lectureUrl && <p
                              onClick={() => setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })}
                              className='text-blue-500 cursor-pointer'>Watch</p>}
                            <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className='flex items-center gap-3 py-3 mt-10'>
            <span className="text-lg font-semibold">Rate this course :</span>
            <Rating initialRating={ratingValue} onRate={(val) => submitRating(val)} />
          </div>

          {allCompleted && (
            <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded'>
              <p className='text-green-700 mb-3'>You have completed all lectures. You can now take the assignment.</p>
              <button onClick={() => navigate(`/course/${courseId}/assignments`)} className='px-4 py-2 bg-green-600 text-white rounded'>Go to Assignments</button>
            </div>
          )}

        </div>
        {/* right column*/}
        <div className='md:col-span-2 md:mt-10'>{playerData ?(<div>
          {(() => { const ytId = getYouTubeId(playerData.lectureUrl); return ytId ? (
            <YouTube videoId={ytId} iframeClassName="w-full aspect-video" />
          ) : (
            <video key={playerData.lectureUrl} className="w-full aspect-video bg-black" controls controlsList="nodownload">
              <source src={playerData.lectureUrl} />
              Your browser does not support the video tag.
            </video>
          ) })()}
          <div className='flex justify-between items-center mt-1'>
            <p>{playerData.chapter}.{playerData.lectureTitle}</p>
            <button onClick={markCompleted} disabled={isLectureCompleted(playerData.lectureId)} className={`text-blue-500 ${isLectureCompleted(playerData.lectureId) ? 'opacity-50 cursor-not-allowed' : ''}`}>{isLectureCompleted(playerData.lectureId) ? 'Completed' : 'Mark Completed'}</button>
          </div>
        </div>):
        <img src={courseData ? courseData.courseThumbnail : 'nu'} alt=""  />}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Player
