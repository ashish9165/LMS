import React from 'react'
import Hero from '../../components/students/Hero'
import Companies from '../../components/students/Companies'
import CoursesSection from '../../components/students/CoursesSection'
import TestimonialsSection from '../../components/students/TestimonialsSection'
import CallToAction from '../../components/students/CallToAction'
import Footer from '../../components/students/footer'
import { useAppContext } from '../../context/AppContext'

const Home = () => {
  const { uiTheme, isMobile, isTablet, isDesktop } = useAppContext()

  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='w-full'>
        <Hero/>
      </section>

      {/* Companies Section */}
      <section className='w-full bg-gray-50'>
        <Companies/>
      </section>

      {/* Courses Section */}
      <section className='w-full bg-white'>
        <CoursesSection/>
      </section>

      {/* Testimonials Section */}
      <section className='w-full bg-gradient-to-br from-red-50 to-red-100'>
        <TestimonialsSection/>
      </section>

      {/* Call to Action Section */}
      <section className='w-full bg-gradient-to-br from-red-600 to-red-700'>
        <CallToAction/>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  )
}

export default Home
