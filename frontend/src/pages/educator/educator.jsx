import React, { useContext, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../components/educator/Navbar.jsx'
import Sidebar from '../../components/educator/Sidebar.jsx'
import Footer from '../../components/educator/Footer.jsx'
import { AppContext } from '../../context/AppContext'

const Educator = () => {
  const { refreshDashboard } = useContext(AppContext)

  useEffect(() => {
    // Refresh dashboard when educator section is accessed
    refreshDashboard()
  }, [])

  return (
    <div className='text-default min-h-screen bg-white'>
      <Navbar/>
      <div className='flex'>
        <Sidebar />
        <div className='flex-1'>
          {<Outlet />}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Educator
