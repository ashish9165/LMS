import React from 'react'
import Footer from '../../components/students/footer'
import { useAppContext } from '../../context/AppContext'

const About = () => {
  const { uiTheme, isMobile, isTablet, isDesktop } = useAppContext()
  return (
    <>
    <div className='bg-white min-h-screen'>
      {/* Hero Section */}
      <section className='bg-gradient-to-br from-red-600 to-red-700 text-white relative overflow-hidden'>
        <div className='absolute inset-0 bg-black/10'></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24'>
          <div className='grid lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
            <div className='space-y-6'>
              <h1 className={`font-extrabold leading-tight ${
                isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl lg:text-6xl'
              }`}>
                Infobeans Foundation
              </h1>
              <p className={`text-white/90 leading-relaxed ${
                isMobile ? 'text-base' : 'text-lg lg:text-xl'
              }`}>
                Empowering learners with accessible, high‑quality education and practical skills to create real‑world impact.
              </p>
              <div className='flex flex-col sm:flex-row gap-4'>
                <button className='bg-white text-red-600 font-semibold px-6 py-3 rounded-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-lg'>
                  Get Started
                </button>
                <button className='border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-red-600 transition-all duration-300'>
                  Learn More
                </button>
              </div>
            </div>
            <div className='bg-white/10 rounded-2xl p-6 md:p-8 lg:p-10 backdrop-blur shadow-xl border border-white/20'>
              <p className='text-white/95 text-sm md:text-base lg:text-lg leading-relaxed'>
                We believe talent is everywhere, but opportunity is not. Our programs bridge this gap by combining structured learning, mentorship, and projects that matter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision Section */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20'>
        <div className='grid lg:grid-cols-2 gap-8 lg:gap-12'>
          <div className='border border-gray-200 rounded-2xl p-6 md:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
            <span className='inline-block px-4 py-2 rounded-full bg-red-50 text-red-700 text-sm font-semibold mb-6'>Mission</span>
            <h2 className={`font-bold text-gray-900 leading-tight ${
              isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'
            }`}>
              Democratize learning and accelerate careers
            </h2>
            <p className='mt-4 text-gray-600 leading-relaxed text-base lg:text-lg'>
              Deliver modern, industry‑aligned learning experiences that are inclusive, affordable, and outcome‑driven for every learner.
            </p>
          </div>
          <div className='border border-gray-200 rounded-2xl p-6 md:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
            <span className='inline-block px-4 py-2 rounded-full bg-red-50 text-red-700 text-sm font-semibold mb-6'>Vision</span>
            <h2 className={`font-bold text-gray-900 leading-tight ${
              isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'
            }`}>
              A world where potential meets opportunity
            </h2>
            <p className='mt-4 text-gray-600 leading-relaxed text-base lg:text-lg'>
              Build pathways that connect passionate learners with coaches, communities, and opportunities that transform lives.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className='bg-gradient-to-br from-red-50 to-red-100 py-12 md:py-16 lg:py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12 lg:mb-16'>
            <h3 className={`font-extrabold text-red-700 leading-tight ${
              isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'
            }`}>
              Our Impact
            </h3>
            <p className='mt-4 text-gray-700 text-base lg:text-lg max-w-2xl mx-auto'>
              Measured by outcomes, driven by community.
            </p>
          </div>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8'>
            <div className='bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='text-3xl lg:text-4xl font-extrabold text-red-600 mb-2'>10k+</div>
              <div className='text-gray-600 text-sm lg:text-base font-medium'>Learners reached</div>
            </div>
            <div className='bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='text-3xl lg:text-4xl font-extrabold text-red-600 mb-2'>85%</div>
              <div className='text-gray-600 text-sm lg:text-base font-medium'>Report career growth</div>
            </div>
            <div className='bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='text-3xl lg:text-4xl font-extrabold text-red-600 mb-2'>200+</div>
              <div className='text-gray-600 text-sm lg:text-base font-medium'>Projects delivered</div>
            </div>
            <div className='bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='text-3xl lg:text-4xl font-extrabold text-red-600 mb-2'>50+</div>
              <div className='text-gray-600 text-sm lg:text-base font-medium'>Partner institutions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values / CTA Section */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20'>
        <div className='grid lg:grid-cols-3 gap-8 lg:gap-12'>
          <div className='lg:col-span-2 border border-gray-200 rounded-2xl p-6 md:p-8 lg:p-10 shadow-lg'>
            <h4 className={`font-bold text-gray-900 mb-6 ${
              isMobile ? 'text-lg' : 'text-xl lg:text-2xl'
            }`}>
              What guides us
            </h4>
            <ul className='grid sm:grid-cols-2 gap-4 lg:gap-6'>
              <li className='border border-gray-200 rounded-xl p-4 lg:p-6 hover:border-red-300 hover:bg-red-50 transition-all duration-300'>
                <div className='font-semibold text-gray-900 mb-2'>Learner‑first experiences</div>
                <div className='text-sm text-gray-600'>Putting students at the center of everything we do</div>
              </li>
              <li className='border border-gray-200 rounded-xl p-4 lg:p-6 hover:border-red-300 hover:bg-red-50 transition-all duration-300'>
                <div className='font-semibold text-gray-900 mb-2'>Real‑world practice</div>
                <div className='text-sm text-gray-600'>Hands-on projects that mirror industry challenges</div>
              </li>
              <li className='border border-gray-200 rounded-xl p-4 lg:p-6 hover:border-red-300 hover:bg-red-50 transition-all duration-300'>
                <div className='font-semibold text-gray-900 mb-2'>Community & mentorship</div>
                <div className='text-sm text-gray-600'>Building supportive networks for growth</div>
              </li>
              <li className='border border-gray-200 rounded-xl p-4 lg:p-6 hover:border-red-300 hover:bg-red-50 transition-all duration-300'>
                <div className='font-semibold text-gray-900 mb-2'>Measurable outcomes</div>
                <div className='text-sm text-gray-600'>Tracking success through concrete results</div>
              </li>
            </ul>
          </div>
          <div className='bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl'>
            <h4 className={`font-extrabold mb-4 ${
              isMobile ? 'text-lg' : 'text-xl lg:text-2xl'
            }`}>
              Join our mission
            </h4>
            <p className='text-white/90 text-sm lg:text-base mb-6 leading-relaxed'>
              Become a learner, mentor, or partner and help us scale impact across communities.
            </p>
            <div className='space-y-4'>
              <a href='mailto:foundation@infobeans.com' className='inline-block w-full bg-white text-red-600 font-semibold px-6 py-3 rounded-lg hover:bg-red-50 transition-all duration-300 text-center'>
              Contact Us
            </a>
              <a href='/courses' className='inline-block w-full border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-red-600 transition-all duration-300 text-center'>
                Explore Courses
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  )
}

export default About


