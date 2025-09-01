import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/students/Loading'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import Footer from '../../components/students/footer'
import YouTube from 'react-youtube'
import axios from 'axios'
const CourseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false)
  const [playerData, setPlayerData] = useState(null)
  const { allcourses, calculateRating, calculateNoOfLecture, calculateCourseDuration, calculateChapterTime, currency, fetchAllCourses } = useContext(AppContext)
  const [ratingValue, setRatingValue] = useState(5)
  const [reviewText, setReviewText] = useState('')

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
  const handlePayment = async () => {
    try {
      // Check if course data exists
      if (!courseData || !courseData.coursePrice) {
        alert("Course information not available. Please refresh the page.");
        return;
      }

      // Payment initiation

      const res = await axios.post("/razorpay/order", {
        amount: courseData.coursePrice,
      });
  
            // API response received
      
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to create payment order");
      }

      const { id, currency, amount, key } = res.data;

      const options = {
        key,
        amount,
        currency,
        name: "InfoBeans Foundation LMS",
        description: `Course: ${courseData.courseTitle}`,
        order_id: id,
        handler: async function (response) {
          try {
            // Payment response received
            
            // Verify payment on backend
            const verifyRes = await axios.post("/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              alert("🎉 Payment successful! Enrolling you in the course...");
              await enroll();
            } else {
              alert("❌ Payment verification failed. Please contact support.");
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            alert("⚠️ Payment received but verification failed. Please contact support.");
            // Still try to enroll as payment was successful
            await enroll();
          }
        },
        prefill: {
          name: "Student Name",
          email: "student@example.com",
        },
        theme: {
          color: "#F37254",
        },
      };
  
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error("❌ Payment failed:", err);
      
      let errorMessage = "Payment failed!";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`❌ ${errorMessage}\n\nPlease check your internet connection and try again.`);
    }
  };
  

  const fetchCourseData = async () => {
    try {
              // Fetching course data
      
      // Try from global list first
      const fromList = allcourses?.find(course => course._id === id);
      if (fromList) {
        // Course found in global list
        setCourseData(fromList);
        return;
      }
      
              // Course not in global list, fetching from API
      // Fallback to API fetch
      const res = await axios.get(`/courses/${id}`);
              // Course fetched from API
      setCourseData(res.data.course);
    } catch (error) {
      console.error("❌ Error fetching course data:", error);
      setCourseData(null);
    }
  }

  useEffect(() => {
    fetchCourseData()
  }, [allcourses])

  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const res = await axios.get('/courses/enrolled/my-courses', { withCredentials: true })
        const found = (res.data.enrollments || []).some(en => en.course && en.course._id === id)
        setAlreadyEnrolled(found)
      } catch (_) {
        setAlreadyEnrolled(false)
      }
    }
    checkEnrollment()
  }, [id])

  const troggleSection = (index) => {
    setOpenSections((prev) => (
      {
        ...prev,
        [index]: !prev[index],
      }
    ))
  }
  const enroll = async () => {
    try {
      await axios.post(`/courses/${id}/enroll`, {}, { withCredentials: true })
      setAlreadyEnrolled(true)
      // Go straight to the player after enrollment
      navigate('/players/' + id)
      // Refresh global courses so ratings propagate across list/cards
      try { if (typeof window !== 'undefined') { /* noop for SSR safety */ } } catch (_) {}
    } catch (e) {
      const msg = e?.response?.data?.message || 'Enrollment failed'
      alert(msg)
    }
  }

  const submitRating = async () => {
    try {
      await axios.post(`/courses/${id}/rate`, { rating: Number(ratingValue), review: reviewText }, { withCredentials: true })
      // Refresh this course details from backend to get canonical ratings array
      try {
        const res = await axios.get(`/courses/${id}`)
        setCourseData(res.data.course)
      } catch (_) {}
      setReviewText('')
      // Refresh global lists so ratings update everywhere
      try { await fetchAllCourses() } catch (_) {}
      alert('Thanks for your rating!')
    } catch (e) {
      const msg = e?.response?.data?.message || 'Rating failed'
      alert(msg)
    }
  }

  return courseData ? (
    <>
      <div className='flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left'>
        <div className='absolute top-0 left-0 w-full h-section-height -z-[1] bg-gradient-to-b from-cyan-100/70'></div>
        {/* left column */}
        <div className='max-w-xl z-10 text-gray-500'>
          <h1 className='md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800'>{courseData.courseTitle}</h1>
          <p className='pt-4 md:text-base text-sm' dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}></p>

          {/* review and rating */}
          <div className='flex items-center space-x-2 pt-3 pb-2 text-sm'>
            <p>{calculateRating(courseData)}</p>
            <div className='flex'>
              {[...Array(5)].map((_, i) => (<img key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5' />))}
            </div>
            <p className='text-gray-500'>{courseData.courseRatings.length}{courseData.courseRatings.length > 1 ? "rating" : "rating"}</p>

            <p className='text-blue-600'>({courseData.enrolledStudents.length} {courseData.enrolledStudents.length > 1 ? 'students' : 'student'})</p>
          </div>
          <p className='text-sm'>Course by
            <span className='text-blue-600 underline'>Infobeans</span></p>
          <div className='pt-8 text-gray-800'>
            <h2 className='text-xl font-semibold'>Course Structure</h2>
            <div className="pt-5">
              {courseData.courseContent.map((chapter, index) => (
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
                          <img src={assets.play_icon} alt='play icon' className='w-4 h-4 mt-1' />
                          <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                            <p>{lecture.lectureTitle}</p>
                            <div className='flex gap-2'>
                              {lecture.isPreviewFree && <p
                                onClick={() => setPlayerData({ url: lecture.lectureUrl })}
                                className='text-blue-500 cursor-pointer'>Priview</p>}
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
          </div>
          <div className='py-20 text-sm md:text-default'>
            <h3 className='text-xl font-semibold text-gray-800'>Course Description</h3>
            <p className='pt-3 rich-text' dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}></p>
          </div>

          {alreadyEnrolled && (
            <div className='pb-10'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>Rate this course</h3>
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3'>
                <select value={ratingValue} onChange={(e) => setRatingValue(e.target.value)} className='border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'>
                  {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} Star{v !== 1 ? 's' : ''}</option>)}
                </select>
                <input value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder='Write a short review (optional)' className='border border-gray-300 flex-1 px-3 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'/>
                <button onClick={submitRating} className='bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors duration-200 shadow-md hover:shadow-lg'>Submit</button>
              </div>
            </div>
          )}
        </div>
        {/* right column */}
        <div className='max-w-course-card z-10 shadow-lg rounded-t-lg md:rounded-lg overflow-hidden bg-white min-w-[300px] sm:min-w-[420px] border border-red-100'>
          {playerData ? (
            (() => { const ytId = getYouTubeId(playerData.url); return ytId ? (
              <YouTube videoId={ytId} opts={{ playerVars: { autoplay: 1 } }} iframeClassName="w-full aspect-video" />
            ) : (
              <video key={playerData.url} className="w-full aspect-video bg-black" controls controlsList="nodownload">
                <source src={playerData.url} />
                Your browser does not support the video tag.
              </video>
            ) })()
          ) : (
            <img src={courseData.courseThumbnail || assets.course_1_thumbnail} alt="Course thumbnail" onError={(e) => { e.target.src = assets.course_1_thumbnail }} />
          )}
          <div className='pt-5 px-4 sm:px-6'>
            <div className='flex items-center gap-2 bg-red-50 p-2 rounded-lg'>
              <img className='w-4 h-4' src={assets.time_left_clock_icon} alt='time left icon' />
              <p className='text-red-600 text-sm font-medium'><span className='font-semibold'>5 days</span> left at this price!</p>
            </div>
            <div className='flex gap-3 items-center pt-4'>
              <p className='text-gray-800 md:text-4xl text-2xl font-bold text-red-600'>{currency}{(courseData.coursePrice - (courseData.discount * courseData.coursePrice / 100)).toFixed(2)}
              </p>
              <p className='md:text-lg text-gray-500 line-through'>{currency}{courseData.coursePrice}</p>
              <p className='md:text-sm text-red-600 font-semibold bg-red-100 px-2 py-1 rounded-full'>{courseData.discount}% off</p>
            </div>
            <div className='flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500'>
              <div className='flex items-center gap-1'>
                <img src={assets.star} alt='star icon' />
                <p>{calculateRating(courseData)}</p>
              </div>
              <div className='h-4 w-px bg-gray-500/40'></div>
              <div className='flex items-center gap-1'>
                <img src={assets.time_clock_icon} alt='time icon' />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>
              <div className='h-4 w-px bg-gray-500/40'></div>
              <div className='flex items-center gap-1'>
                <img src={assets.lesson_icon} alt='lesson icon' />
                <p>{calculateNoOfLecture(courseData)} lessons</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (alreadyEnrolled) {
                  navigate('/players/' + id)
                } else {
                  handlePayment()
                }
              }}
              disabled={!courseData || !courseData.coursePrice}
              className={`md:mt-6 mt-4 w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                !courseData || !courseData.coursePrice 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {!courseData ? 'Loading...' : alreadyEnrolled ? 'Watch Now' : 'Buy Now'}
            </button>
            <div className='pt-6 pb-6'><p className='md:text-xl text-lg font-semibold text-gray-800 mb-4'>
              What's in the course?</p>
              <ul className='space-y-2 text-sm md:text-base text-gray-600'>
                <li className='flex items-center gap-2'><span className='w-2 h-2 bg-red-500 rounded-full'></span>Lifetime access with free updates</li>
                <li className='flex items-center gap-2'><span className='w-2 h-2 bg-red-500 rounded-full'></span>Step-by-step video tutorials</li>
                <li className='flex items-center gap-2'><span className='w-2 h-2 bg-red-500 rounded-full'></span>Quizzes and assignments</li>
                <li className='flex items-center gap-2'><span className='w-2 h-2 bg-red-500 rounded-full'></span>Certificate of completion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : <Loading />
}

export default CourseDetails
