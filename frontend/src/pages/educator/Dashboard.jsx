import React, { useContext, useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets';
import Loading from '../../components/students/Loading.jsx'
import StatusBadge from '../../components/educator/StatusBadge.jsx'

const Dashboard = () => {
  const { currency, dashboardData, refreshDashboard, uiTheme, isMobile, isTablet, isDesktop } = useAppContext()
  const [emailStatus, setEmailStatus] = useState(null)
  const [testEmail, setTestEmail] = useState({ email: '', type: 'enrollment' })
  const [emailResult, setEmailResult] = useState(null)

  useEffect(() => {
    // Refresh dashboard data when component mounts
    refreshDashboard()
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(() => {
      refreshDashboard()
    }, 30000) // 30 seconds

    // Get email status
    fetchEmailStatus()

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [])

  const fetchEmailStatus = async () => {
    try {
      const response = await fetch('/api/email/status')
      const data = await response.json()
      setEmailStatus(data)
    } catch (error) {
      console.error('Failed to fetch email status:', error)
    }
  }

  const handleTestEmail = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testEmail)
      })
      const data = await response.json()
      setEmailResult(data)
    } catch (error) {
      setEmailResult({ success: false, message: 'Failed to send test email' })
    }
  }

  return dashboardData ? (
    <div className='min-h-screen flex flex-col items-start justify-between gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8'>
      <div className='space-y-6 lg:space-y-8 w-full'>
        {/* Stats Cards Section */}
        <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center justify-between'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full lg:w-auto'>
            <div className='flex items-center gap-4 bg-white shadow-lg border border-red-200 p-4 lg:p-6 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='p-3 bg-red-100 rounded-lg'>
                <img src={assets.patients_icon} alt='patients_icon' className='w-6 h-6'/>
              </div>
                 <div>
                <p className={`font-bold text-gray-800 ${isMobile ? 'text-xl' : 'text-2xl lg:text-3xl'}`}>
                  {dashboardData.enrolledStudentsData.length}
                </p>
                <p className='text-sm lg:text-base text-gray-600 font-medium'>Total Enrollment</p>
              </div>
                 </div>
             
            <div className='flex items-center gap-4 bg-white shadow-lg border border-red-200 p-4 lg:p-6 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='p-3 bg-red-100 rounded-lg'>
                <img src={assets.appointments_icon} alt='appointments_icon' className='w-6 h-6'/>
              </div>
                 <div>
                <p className={`font-bold text-gray-800 ${isMobile ? 'text-xl' : 'text-2xl lg:text-3xl'}`}>
                  {dashboardData.totalCourses}
                </p>
                <p className='text-sm lg:text-base text-gray-600 font-medium'>Total Courses</p>
              </div>
                 </div>
             
            <div className='flex items-center gap-4 bg-white shadow-lg border border-red-200 p-4 lg:p-6 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1'>
              <div className='p-3 bg-red-100 rounded-lg'>
                <img src={assets.earning_icon} alt='earning_icon' className='w-6 h-6'/>
              </div>
              <div>
                <p className={`font-bold text-gray-800 ${isMobile ? 'text-xl' : 'text-2xl lg:text-3xl'}`}>
                  {currency}{dashboardData.totalEarnings}
                </p>
                <p className='text-sm lg:text-base text-gray-600 font-medium'>Total Earning</p>
              </div>
              </div>
          </div>
          
          <button 
            onClick={refreshDashboard}
            className='bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold'
          >
            Refresh Data
          </button>
        </div>
        {/* Enrollments Table Section */}
        <div className='w-full'>
          <h2 className={`pb-4 font-semibold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl lg:text-2xl'}`}>
            Latest Enrollments
          </h2>
          <div className='bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200'>
                  <tr>
                    <th className='px-4 py-4 font-semibold text-gray-800 text-center hidden sm:table-cell'>#</th>
                    <th className='px-4 py-4 font-semibold text-gray-800 text-left'>Student Name</th>
                    <th className='px-4 py-4 font-semibold text-gray-800 text-left'>Course Title</th>
                    <th className='px-4 py-4 font-semibold text-gray-800 text-center'>Status</th>
                    <th className='px-4 py-4 font-semibold text-gray-800 text-center'>Assignment</th>
                    <th className='px-4 py-4 font-semibold text-gray-800 text-center'>Certificate</th>
             </tr>
            </thead>
                <tbody className='text-sm text-gray-600'>
              {dashboardData.enrolledStudentsData.map((item,index)=>(
                    <tr key={index} className='border-b border-red-100 hover:bg-red-50 transition-colors duration-200'>
                      <td className='px-4 py-4 text-center hidden sm:table-cell font-medium'>
                  {index + 1}
                </td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center space-x-3'>
                          <img src={item.student.imageUrl} alt="profile" className='w-10 h-10 rounded-full border-2 border-red-200'/>
                          <span className='font-medium text-gray-800 truncate'>{item.student.name}</span>
                        </div>
                </td>
                      <td className='px-4 py-4 font-medium text-gray-800 truncate'>{item.courseTitle}</td>
                      <td className='px-4 py-4 text-center'>
                  <StatusBadge status={item.status} />
                </td>
                      <td className='px-4 py-4 text-center'>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.assignmentCompleted ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {item.assignmentCompleted ? 'Completed' : 'Pending'}
                  </span>
                </td>
                      <td className='px-4 py-4 text-center'>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.certificateEarned ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {item.certificateEarned ? 'Earned' : 'Not Yet'}
                  </span>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
            </div>
          </div>
        </div>

        {/* Email Testing Section */}
        <div className='w-full'>
          <h2 className={`pb-4 font-semibold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl lg:text-2xl'}`}>
            Email System Status
          </h2>
          <div className='bg-white rounded-xl shadow-lg border border-red-200 p-6 lg:p-8'>
            <div className='flex items-center gap-4 mb-6'>
              <div className={`w-4 h-4 rounded-full ${emailStatus?.configured ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}></div>
              <span className='font-semibold text-gray-800 text-lg'>
                Email System: {emailStatus?.configured ? 'Configured' : 'Not Configured'}
              </span>
            </div>
            
            {emailStatus?.configured && (
              <div className='space-y-6'>
                <p className='text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200'>
                  <span className='font-medium'>Email configured for:</span> {emailStatus.emailUser}
                </p>
                
                <form onSubmit={handleTestEmail} className='space-y-6'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Test Email Address
                      </label>
                      <input
                        type='email'
                        value={testEmail.email}
                        onChange={(e) => setTestEmail({ ...testEmail, email: e.target.value })}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300'
                        placeholder='Enter email to test'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Email Type
                      </label>
                      <select
                        value={testEmail.type}
                        onChange={(e) => setTestEmail({ ...testEmail, type: e.target.value })}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300'
                      >
                        <option value='enrollment'>Course Enrollment</option>
                        <option value='assessment'>Assessment Completion</option>
                        <option value='completion'>Course Completion</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type='submit'
                    className='bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold'
                  >
                    Send Test Email
                  </button>
                </form>

                {emailResult && (
                  <div className={`p-4 rounded-lg border ${
                    emailResult.success ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    <div className='flex items-center gap-2'>
                      <div className={`w-3 h-3 rounded-full ${emailResult.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className='font-medium'>{emailResult.message}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!emailStatus?.configured && (
              <div className='bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6'>
                <h3 className='font-semibold text-yellow-800 mb-3 text-lg'>Email Not Configured</h3>
                <p className='text-gray-700 mb-4 leading-relaxed'>
                  To enable email notifications, you need to configure Gmail credentials in your environment.
                </p>
                <div className='space-y-2 text-sm text-gray-700'>
                  <p className='flex items-center gap-2'>
                    <span className='w-2 h-2 bg-yellow-500 rounded-full'></span>
                    Configure Gmail credentials in your .env file
                  </p>
                  <p className='flex items-center gap-2'>
                    <span className='w-2 h-2 bg-yellow-500 rounded-full'></span>
                    Add EMAIL_USER and EMAIL_PASSWORD to environment variables
                  </p>
                  <p className='flex items-center gap-2'>
                    <span className='w-2 h-2 bg-yellow-500 rounded-full'></span>
                    Restart the backend server
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : <Loading/>
}

export default Dashboard
