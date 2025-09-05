import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 bg-white">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">Educator Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            
            <Link to="/" className="hover:text-red-200">Home</Link>
            <Link to="/about" className="hover:text-red-200">About</Link>
            <Link to="/contact" className="hover:text-red-200">Contact</Link>
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
                <img 
                    src={user.imageUrl || assets.profile_img} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 shadow-md"
                />
                <span className="text-sm text-gray-600">Profile</span>
            </Link>
            <span className="text-sm text-gray-600 ">Welcome, {user.name}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
