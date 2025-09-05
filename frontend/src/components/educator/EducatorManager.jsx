import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { assets } from '../../assets/assets'

const EducatorManager = () => {
  const [educators, setEducators] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [deleteModal, setDeleteModal] = useState({ show: false, educator: null })

  useEffect(() => {
    fetchEducators()
  }, [])

  const fetchEducators = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/dashboard/educators', { withCredentials: true })
      if (response.data.success) {
        setEducators(response.data.educators)
      }
    } catch (error) {
      console.error('Failed to fetch educators:', error)
      setMessage({ type: 'error', text: 'Failed to fetch educators' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    try {
      setLoading(true)
      const response = await axios.post('/dashboard/educators', formData, { withCredentials: true })
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'New educator added successfully!' })
        setFormData({ name: '', email: '', password: '', bio: '' })
        setShowAddForm(false)
        fetchEducators() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to add educator:', error)
      const errorMessage = error.response?.data?.message || 'Failed to add new educator'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', bio: '' })
    setShowAddForm(false)
    setMessage({ type: '', text: '' })
  }

  const handleDeleteClick = (educator) => {
    setDeleteModal({ show: true, educator })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.educator) return

    try {
      setLoading(true)
      const response = await axios.delete(`/dashboard/educators/${deleteModal.educator._id}`, { withCredentials: true })
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Educator deleted successfully!' })
        setDeleteModal({ show: false, educator: null })
        fetchEducators() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to delete educator:', error)
      const errorMessage = error.response?.data?.message || 'Failed to delete educator'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, educator: null })
  }

  return (
    <div className='w-full space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold text-gray-800'>Educator Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className='bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold'
        >
          {showAddForm ? 'Cancel' : 'Add New Educator'}
        </button>
      </div>

      {/* Add New Educator Form */}
      {showAddForm && (
        <div className='bg-white rounded-xl shadow-lg border border-blue-200 p-6'>
          <h3 className='text-xl font-semibold text-gray-800 mb-4'>Add New Educator</h3>
          
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300'
                  placeholder='Enter educator name'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300'
                  placeholder='Enter educator email'
                  required
                />
              </div>
            </div>
            
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Password <span className='text-red-500'>*</span>
              </label>
              <input
                type='password'
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300'
                placeholder='Enter password (min 6 characters)'
                minLength={6}
                required
              />
            </div>
            
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Bio (Optional)
              </label>
              <textarea
                name='bio'
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300'
                placeholder='Enter educator bio'
              />
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                <div className='flex items-center gap-2'>
                  <div className={`w-3 h-3 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className='font-medium'>{message.text}</span>
                </div>
              </div>
            )}

            <div className='flex gap-4 pt-4'>
              <button
                type='submit'
                disabled={loading}
                className='bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? 'Adding...' : 'Add Educator'}
              </button>
              <button
                type='button'
                onClick={resetForm}
                className='bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-lg font-semibold'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Educators List */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden'>
        <div className='p-6 border-b border-gray-200'>
          <h3 className='text-xl font-semibold text-gray-800'>Current Educators</h3>
          <p className='text-gray-600 mt-1'>Manage all educators in the platform</p>
        </div>
        
        {loading ? (
          <div className='p-8 text-center'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <p className='mt-2 text-gray-600'>Loading educators...</p>
          </div>
        ) : educators.length === 0 ? (
          <div className='p-8 text-center'>
            <img src={assets.user_icon} alt='No educators' className='w-16 h-16 mx-auto mb-4 opacity-50' />
            <p className='text-gray-600'>No educators found</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200'>
                <tr>
                  <th className='px-6 py-4 font-semibold text-gray-800 text-left'>#</th>
                  <th className='px-6 py-4 font-semibold text-gray-800 text-left'>Profile</th>
                  <th className='px-6 py-4 font-semibold text-gray-800 text-left'>Name</th>
                  <th className='px-6 py-4 font-semibold text-gray-800 text-left'>Email</th>
                  <th className='px-6 py-4 font-semibold text-gray-800 text-left'>Bio</th>
                  <th className='px-6 py-4 font-semibold text-gray-800 text-center'>Courses</th>
                  <th className='px-6 py-4 font-semibold text-gray-800 text-center'>Joined</th>
                  <th className='px-6 py-4 font-semibold text-gray-800 text-center'>Actions</th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-600'>
                {educators.map((educator, index) => (
                  <tr key={educator._id} className='border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200'>
                    <td className='px-6 py-4 text-center font-medium'>
                      {index + 1}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center space-x-3'>
                        <img 
                          src={educator.imageUrl || assets.user_icon} 
                          alt="profile" 
                          className='w-10 h-10 rounded-full border-2 border-blue-200'
                        />
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='font-medium text-gray-800'>{educator.name}</span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-gray-700'>{educator.email}</span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-gray-700 max-w-xs truncate block'>
                        {educator.bio || 'No bio provided'}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        educator.courseCount > 0 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {educator.courseCount || 0} course(s)
                      </span>
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <span className='text-gray-700'>
                        {new Date(educator.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <button
                        onClick={() => handleDeleteClick(educator)}
                        disabled={educator.courseCount > 0}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                          educator.courseCount > 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title={educator.courseCount > 0 
                          ? `Cannot delete: ${educator.courseCount} course(s) associated` 
                          : 'Delete Educator'
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl p-6 max-w-md w-full'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                <svg className='w-6 h-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-gray-800'>Delete Educator</h3>
            </div>
            
            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete <span className='font-semibold text-gray-800'>{deleteModal.educator?.name}</span>? 
              This action cannot be undone.
            </p>
            
            <div className='flex gap-3'>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className='flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium disabled:opacity-50'
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={handleDeleteCancel}
                className='flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-medium'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EducatorManager
