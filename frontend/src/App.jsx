import React from 'react'
import { Route, Routes, useMatch } from 'react-router-dom'
import Home from './pages/student/Home.jsx'
import CoursesList from './pages/student/CoursesList.jsx'
import MyEnrollment from './pages/student/MyEnrollment.jsx'
import Player from './pages/student/Player.jsx'
import Loading from './components/students/Loading.jsx'
import CourseDetails from './pages/student/CourseDetails.jsx'
import Educator from './pages/educator/educator.jsx'
import Dashboard from './pages/educator/Dashboard.jsx'
import AddCourse from './pages/educator/AddCourse.jsx'
import EditCourse from './pages/educator/EditCourse.jsx'
import MyCourses from './pages/educator/MyCourses.jsx'
import StudentsEnrolled from './pages/educator/StudentsEnrolled.jsx'
import AssignmentManager from './pages/educator/AssignmentManager.jsx'
import AssignmentQuiz from './components/students/AssignmentQuiz.jsx'
import CertificateViewer from './components/students/CertificateViewer.jsx'
import CourseAssignments from './pages/student/CourseAssignments.jsx'
import About from './pages/student/About.jsx'
import Contact from './pages/student/Contact.jsx'
import Profile from './pages/Profile.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import Auth from './pages/auth/Auth.jsx'
import Navbar from './components/students/navbar.jsx'
import "quill/dist/quill.snow.css";

const App = () => {
  const isEducatorRoute = useMatch('/educator/*');
  const isAuthRoute = useMatch('/auth');
  
  return (
    <div className='text-default min-h-screen bg-white'>
      {!isEducatorRoute && !isAuthRoute && <Navbar />}
      <Routes>
       <Route path="/" element={<Home />} />
      <Route path="/Course-List" element={<CoursesList />} />
      <Route path="/course-list" element={<CoursesList />} />
      <Route path="/Course-List/:input" element={<CoursesList />} />
      <Route path="/course-list/:input" element={<CoursesList />} />
      <Route path="/Course/:id" element={<CourseDetails />} />
      <Route path="/course/:id" element={<CourseDetails />} />
      <Route path="/my-enrollments" element={
        <ProtectedRoute>
          <MyEnrollment />
        </ProtectedRoute>
      } />
      <Route path="/players/:courseId" element={
        <ProtectedRoute>
          <Player />
        </ProtectedRoute>
      } />
      <Route path="/course/:courseId/assignments" element={
        <ProtectedRoute>
          <CourseAssignments />
        </ProtectedRoute>
      } />
      <Route path="/assignments/:assignmentId" element={
        <ProtectedRoute>
          <AssignmentQuiz />
        </ProtectedRoute>
      } />
      <Route path="/certificates" element={
        <ProtectedRoute>
          <CertificateViewer />
        </ProtectedRoute>
      } />
      <Route path="/my-courses" element={
        <ProtectedRoute allowedRoles={['educator']}>
          <MyCourses />
        </ProtectedRoute>
      } />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/auth" element={<Auth />} />

      <Route path="/loading/:path" element={<Loading/>} />

      <Route path="educator" element={
        <ProtectedRoute allowedRoles={['educator']}>
          <Educator/>
        </ProtectedRoute>
      }>
       <Route index element={<Dashboard/>} />
       <Route path='dashboard' element={<Dashboard/>} />
       <Route path='add-courses' element={<AddCourse/>} />
       <Route path='add-course' element={<AddCourse/>} />
       <Route path='edit-course/:id' element={<EditCourse/>} />
       <Route path='my-courses' element={<MyCourses/>} />
       <Route path='assignments' element={<AssignmentManager/>} />
       <Route path='student-enrolled' element={<StudentsEnrolled/>} />

      </Route>

      </Routes>
    </div>
  )
}

export default App
