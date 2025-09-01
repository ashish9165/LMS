import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
   <footer className='bg-gradient-to-br from-red-900 to-red-800 text-white w-full mt-10'>
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12 py-12 lg:py-16 border-b border-white/20'>
        <div className='flex flex-col lg:items-start items-center w-full lg:w-1/3'>
                     <Link to='/' className='mb-6'>
             <img src={assets.info_logo} alt='logo' className='h-12 w-12 rounded-full object-cover shadow-lg'/>
           </Link>
          <p className='text-center lg:text-left text-sm lg:text-base text-white/80 leading-relaxed max-w-md'>
            Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's dummy text.
          </p>
        </div>
        <div className='flex flex-col lg:items-start items-center w-full lg:w-1/4'>
          <h2 className='font-semibold text-white mb-6 text-lg'>Company</h2>
          <ul className='flex flex-col space-y-3 text-sm lg:text-base text-white/80'>
            <li><Link to='/' className='hover:text-white transition-colors duration-300'>Home</Link></li>
            <li><Link to='/about' className='hover:text-white transition-colors duration-300'>About</Link></li>
            <li><Link to='/contact' className='hover:text-white transition-colors duration-300'>Contact us</Link></li>
            <li><Link to='/privacy' className='hover:text-white transition-colors duration-300'>Privacy policy</Link></li>
          </ul>
        </div>
        <div className='flex flex-col lg:items-start items-center w-full lg:w-1/3'>
          <h2 className='font-semibold text-white mb-6 text-lg'>Subscribe to our newsletter</h2>
          <p className='text-center lg:text-left text-sm lg:text-base text-white/80 mb-6 leading-relaxed'>
            The latest news, articles, and resources, sent to your inbox weekly.
          </p>
          <div className='flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm'>
            <input 
              type='email' 
              placeholder='Enter your email' 
              className='border border-white/30 bg-white/10 text-white placeholder-white/60 outline-none w-full h-12 rounded-lg px-4 text-sm backdrop-blur-sm focus:border-white/50 transition-all duration-300'
            />
            <button className='bg-white text-red-600 font-semibold w-full sm:w-auto h-12 px-6 rounded-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-lg'>
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <div className='py-6 text-center'>
        <p className='text-xs lg:text-sm text-white/60'>
          Copyright 2025 Infobeans Foundation. All rights reserved.
        </p>
      </div>
    </div>
   </footer>
  )
}

export default Footer
