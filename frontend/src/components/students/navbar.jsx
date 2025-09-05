import React,{useContext} from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AppContext } from '../../context/AppContext'

const Navbar = () => {
    
    const {navigate,isEducator}=useContext(AppContext)
    const { user, logout, isEducator: userIsEducator } = useAuth()
    const isCourseListPage= location.pathname.includes('/course-list');

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

  return (
    <div className={`flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 border-b-2 border-red-700 py-4 bg-gradient-to-r from-red-600 to-red-700 shadow-lg`}>
    <div onClick={()=>navigate('/')} className='flex items-center gap-2 sm:gap-3 cursor-pointer group'>
      <img src={assets.info_logo} alt="Logo" className='w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200' />
      <span className='text-white font-bold text-base sm:text-lg lg:text-xl group-hover:text-red-100 transition-colors duration-200'>InfoBeans Foundation LMS</span>
    </div>
           <div className='hidden md:flex items-center gap-4 lg:gap-6 text-white'>
                  <div className='flex items-center gap-4 lg:gap-6'>
           { user &&
           <>
            {userIsEducator ? (
              <>
                <button onClick={()=>{navigate('/educator')}} className="text-white hover:text-red-200 font-medium transition-colors duration-200 px-3 py-1 rounded-md hover:bg-red-500/20">Educator Dashboard</button>
              
              </>
            ) : (
              <>
                <Link to="/my-enrollments" className="text-white hover:text-red-200 font-medium transition-colors duration-200 px-3 py-1 rounded-md hover:bg-red-500/20">My Enrollments</Link>
                <Link to="/certificates" className="text-white hover:text-red-200 font-medium transition-colors duration-200 px-3 py-1 rounded-md hover:bg-red-500/20">My Certificates</Link>
              </>
            )}
            </>
            }
          </div>
          <Link to="/" className="text-white hover:text-red-200 font-medium transition-colors duration-200 px-3 py-1 rounded-md hover:bg-red-500/20">Home</Link>
          <Link to="/about" className="text-white hover:text-red-200 font-medium transition-colors duration-200 px-3 py-1 rounded-md hover:bg-red-500/20">About</Link>
          <Link to="/contact" className="text-white hover:text-red-200 font-medium transition-colors duration-200 px-3 py-1 rounded-md hover:bg-red-500/20">Contact</Link>
           {  user ? (
         <div className="flex items-center gap-3">
             <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
                 <img 
                     src={user.imageUrl || assets.profile_img} 
                     alt="Profile" 
                     className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                 />
                 <span className="text-sm text-white font-medium hidden sm:block">{user.name}</span>
             </Link>
             <button 
                 onClick={handleLogout}
                 className='bg-white text-red-600 px-4 sm:px-5 py-2 rounded-lg hover:bg-red-50 font-medium transition-colors duration-200 shadow-md hover:shadow-lg'
             >
                 Logout
             </button>
         </div>
     ) : (
        <Link 
            to="/auth"
            className='bg-white text-red-600 px-4 sm:px-5 py-2 rounded-lg hover:bg-red-50 font-medium transition-colors duration-200 shadow-md hover:shadow-lg'
        >
            Login / Register
        </Link>
     )}
     </div>
     {/*for phone screens*/}
        <div className='md:hidden flex items-center gap-2 sm:gap-3 text-white'>
                    <div className='flex items-center gap-1 sm:gap-2 max-sm:text-xs'>
          { user &&
           <>
                           {userIsEducator ? (
                <>
                  <button onClick={()=>{navigate('/educator')}} className="text-white hover:text-red-200 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-red-500/20 text-xs">Dashboard</button>
                  <Link to="/my-courses" className="text-white hover:text-red-200 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-red-500/20 text-xs">Courses</Link>
                </>
              ) : (
                <>
                  <Link to="/my-enrollments" className="text-white hover:text-red-200 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-red-500/20 text-xs">Enrollments</Link>
                  <Link to="/certificates" className="text-white hover:text-red-200 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-red-500/20 text-xs">Certificates</Link>
                </>
              )}
            </>
          }
          </div>
          <Link to="/about" className="text-white hover:text-red-200 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-red-500/20 text-xs">About</Link>
          <Link to="/contact" className="text-white hover:text-red-200 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-red-500/20 text-xs">Contact</Link>
                     {
             user ? (
                 <>
                   <Link to="/profile" className="flex items-center gap-1 hover:opacity-80 transition-opacity duration-200">
                       <img 
                           src={user.imageUrl || assets.profile_img} 
                           alt="Profile" 
                           className="w-6 h-6 rounded-full object-cover border border-white shadow-sm"
                       />
                   </Link>
                   <button 
                       onClick={handleLogout}
                       className='bg-white text-red-600 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 shadow-md hover:shadow-lg'
                   >
                       Logout
                   </button>
                 </>
             ) : (
                <Link 
                    to="/auth"
                    className='bg-white text-red-600 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 shadow-md hover:shadow-lg'
                >
                    Login
                </Link>
            )
          }
        </div>
    </div>
  )
}

export default Navbar
