import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import Loading from '../../components/students/Loading';
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import StatusBadge from '../../components/educator/StatusBadge.jsx'

const StudentsEnrolled = () => {
  const { refreshDashboard, dashboardData } = useContext(AppContext)
  const [enrolledStudents, setEnrolledStudents] = useState(null);

  const fetchEnrolledStudents = async () => {
    try {
      // Optionally, you might want to select a course first; for now get latest enrollments via dashboard route
      const res = await axios.get('/dashboard')
      const latest = (res.data.dashboard?.recentEnrollments || []).map(e => ({
        student: e.student,
        courseTitle: e.course?.courseTitle || '-',
        purchaseDate: e.enrolledAt,
        status: e.status || 'active'
      }))
      setEnrolledStudents(latest)
    } catch (err) {
      setEnrolledStudents([])
    }
  }
  
  useEffect(() => {
    fetchEnrolledStudents();
    refreshDashboard(); // Refresh dashboard when component loads
  }, []);  

  return enrolledStudents ? (
    <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-red-500/20'>
        <table className='table-fixed md:table-auto w-full overflow-hidden pb-4'>
          <thead className='text-grey-900 border-b  border-red-500/20 text-sm text-left'>
          <tr>
            <th className='px-4 py-3 font-semibold text-center hidden sm:table-cell'>#</th>
            <th className='px-4 py-3 font-semibold'>Student Name</th>
            <th className='px-4 py-3 font-semibold'>Course Title</th>
            <th className='px-4 py-3 font-semibold text-center'>Status</th>
            <th className='px-4 py-3 font-semibold hidden sm:table-cell'>Date</th>
          </tr>
          </thead>
          <tbody className='text-grey-500 text-sm'>
            {enrolledStudents.map((item, index) => (
              <tr key={index} className='border-b border-red-500/20 hover:bg-red-50/20'>
                <td className='px-4 py-3 text-center hidden sm:table-cell'>{index + 1}</td>
                <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                  {/* <img src={item.student.imageUrl} alt='' className='w-9 h-9 rounded-full'/> */}
                  <span className='truncate'>{item.student.name}</span>
                </td>
                <td className='px-4 py-3 truncate'>{item.courseTitle}</td>
                <td className='px-4 py-3 text-center'>
                  <StatusBadge status={item.status} />
                </td>
                <td className='px-4 py-3 hidden sm:table-cell'>{new Date(item.purchaseDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
    </div>
  ) : 
   <Loading/>
  
}

export default StudentsEnrolled
