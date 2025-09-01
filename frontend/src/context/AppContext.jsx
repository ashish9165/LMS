import React, { createContext, useEffect, useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth } from './AuthContext'

export const AppContext = createContext();

// Custom hook to use AppContext
export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

export const AppContextProvider = (props) => {
 const currency=import.meta.env.VITE_CURRENCY
  const navigate=useNavigate()
  const { user } = useAuth()

 // UI Theme State for Red and White theme
 const [uiTheme] = useState({
   primary: 'red-600',
   secondary: 'white',
   accent: 'red-500',
   background: 'white',
   text: 'gray-800',
   textLight: 'gray-600',
   border: 'gray-200',
   success: 'green-500',
   warning: 'amber-500',
   error: 'red-500',
   info: 'blue-500'
 })

 // Responsive breakpoints
 const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
 const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024)
 const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

 const [allcourses,setAllCourses]=useState([])
 const[isEducator,setIsEducator]=useState(user?.role === 'educator')
 const[enrolledCourses,setEnrolledCourses]=useState([])
 const[dashboardData,setDashboardData]=useState(null)
 const[dashboardRefreshTrigger,setDashboardRefreshTrigger]=useState(0)

//fetch all courses
 const fetchAllCourses=async()=>{
   try {
     const res = await axios.get('/courses')
     setAllCourses(res.data.courses || [])
   } catch (_) {
     setAllCourses([])
   }
 }

//fetch dashboard data
 const fetchDashboardData=async()=>{
   try {
     const res = await axios.get('/dashboard')
     const d = res.data.dashboard
     
     // Fetch enrolled students data with assignment and certificate status
     const enrolledRes = await axios.get('/dashboard/enrolled-students', { withCredentials: true })
     const enrolledData = enrolledRes.data.enrolledStudentsData || []
     
     setDashboardData({
       enrolledStudentsData: enrolledData.map(e => ({
         student: e.student,
         courseTitle: e.courseTitle || '-',
         status: e.status || 'active',
         assignmentCompleted: e.assignmentCompleted || false,
         certificateEarned: e.certificateEarned || false
       })),
       totalCourses: d.totalCourses,
       totalEarnings: d.totalRevenue
     })
   } catch (err) {
     setDashboardData({ enrolledStudentsData: [], totalCourses: 0, totalEarnings: 0 })
   }
 }

//trigger dashboard refresh
 const refreshDashboard=()=>{
   setDashboardRefreshTrigger(prev => prev + 1)
 }

//Function to calculate avarage rating of course
  const calculateRating=(course)=>{
    if(course.courseRatings.length===0){
        return 0
    }
    let totalRating=0
    course.courseRatings.forEach(rating=>{
        totalRating+=rating.rating
    })
    return totalRating/course.courseRatings.length
  }
//function to calculate Course Chapter time
 const calculateChapterTime=(chapter)=>{
  let time=0
  chapter.chapterContent.map((lecture)=>time +=lecture.lectureDuration)
  return humanizeDuration(time*60 *1000,{units:["h","m"]})
 }

 //function to calculate Course Duration
 const calculateCourseDuration=(course)=>{
  let time=0

  course.courseContent.map((chapter)=>chapter.chapterContent.map((lecture)=> time +=lecture.lectureDuration))
 return humanizeDuration(time*60 *1000,{units:["h","m"]})
 }

//function calculate to no. of lacture in the course
const calculateNoOfLecture = (course) => {
  let totalLectures = 0;   // use consistent spelling

  course.courseContent.forEach(chapter => {
    if (Array.isArray(chapter.chapterContent)) {
      totalLectures += chapter.chapterContent.length;
    }
  });

  return totalLectures;
};
//fetch user enrolled courses
const fetchEnrolledCourses = async () => {
  try {
    const res = await axios.get('/courses/enrolled/my-courses', { withCredentials: true })
    // Map enrollments to courses for existing UI usage
    const courses = (res.data.enrollments || [])
      .filter(e => e.course)
      .map(e => ({ ...e.course, _enrollment: e }))
    setEnrolledCourses(courses)
  } catch (_) {
    setEnrolledCourses([])
  }
};

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
      setIsDesktop(window.innerWidth >= 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(()=>{
    fetchAllCourses()
    fetchEnrolledCourses()
    fetchDashboardData() // Also fetch dashboard data on initial load
  },[])

  // Update isEducator when user changes
  useEffect(() => {
    setIsEducator(user?.role === 'educator')
  }, [user])

  // Refresh dashboard when trigger changes
  useEffect(()=>{
    if (dashboardRefreshTrigger > 0) { // Only refresh if trigger has been activated
      fetchDashboardData()
    }
  },[dashboardRefreshTrigger])

    const value = {
        currency,allcourses,navigate,calculateRating,isEducator,setIsEducator,
        calculateNoOfLecture,calculateCourseDuration,calculateChapterTime,
        enrolledCourses,fetchEnrolledCourses, fetchAllCourses,
        dashboardData, refreshDashboard, uiTheme, isMobile, isTablet, isDesktop
    };
    return (
        <AppContext.Provider value={value} >
            {props.children}
        </AppContext.Provider>
    )
}