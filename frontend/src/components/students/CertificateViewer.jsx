import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'

const CertificateViewer = () => {
  const { uiTheme, isMobile, isTablet, isDesktop } = useAppContext()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCertificate, setSelectedCertificate] = useState(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const response = await axios.get('/assignments/certificates', { withCredentials: true })
      setCertificates(response.data.certificates)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching certificates:', error)
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const downloadCertificate = (certificate) => {
    const companyName = 'Infobeans Foundation'
    const companyAddress = '123 Business Park, Tech City, Country'
    const logoUrl = assets.info_logo || assets.logo_dark || assets.favicon
    const courseTitle = certificate.course.courseTitle

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Certificate - ${courseTitle}</title>
          <style>
            @page { size: A4 landscape; margin: 0; }
            body { margin: 0; background: #eee; }
            .page {
              width: 297mm; height: 210mm; margin: 0 auto; background: #fff; position: relative;
              box-shadow: 0 10px 30px rgba(0,0,0,.15);
            }
            .border-outer { position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 10mm; border: 6px solid #0e3a64; border-radius: 8px; }
            .border-inner { position: absolute; top: 16mm; left: 16mm; right: 16mm; bottom: 16mm; border: 2px solid #bfa145; border-radius: 6px; }
            .content { position: absolute; top: 26mm; left: 26mm; right: 26mm; bottom: 26mm; text-align: center; font-family: 'Georgia', serif; color: #222; }
            .brand { display: flex; align-items: center; justify-content: center; gap: 14px; }
            .brand img { height: 40px; width: 40px; border-radius: 50%; object-fit: cover; }
            .brand .company { font-size: 18px; font-weight: 700; letter-spacing: .5px; color: #0e3a64; }
            .title { margin-top: 16px; font-size: 42px; font-weight: 800; color: #0e3a64; text-transform: uppercase; letter-spacing: 2px; }
            .subtitle { margin-top: 6px; font-size: 14px; color: #666; }
            .student { margin-top: 24px; font-size: 28px; font-weight: 700; }
            .line { width: 60%; height: 1px; background: #ddd; margin: 10px auto 0; }
            .course { margin-top: 20px; font-size: 18px; color: #0e3a64; font-weight: 600; }
            .meta { display: flex; justify-content: center; gap: 26px; margin-top: 24px; font-size: 13px; color: #444; flex-wrap: wrap; }
            .meta .item { text-align: center; }
            .meta .label { text-transform: uppercase; letter-spacing: 1px; color: #666; font-size: 11px; }
            .meta .value { font-weight: 700; margin-top: 3px; font-size: 14px; }
            .footer { position: absolute; left: 26mm; right: 26mm; bottom: 26mm; display: flex; align-items: center; justify-content: space-between; }
            .sign { text-align: center; }
            .sign-line { width: 160px; height: 1px; background: #333; margin: 40px auto 8px; }
            .sign-name { font-weight: 700; }
            .sign-role { font-size: 12px; color: #666; }
            .seal {
              width: 100px; height: 100px; border-radius: 50%;
              background: radial-gradient(circle at 30% 30%, #ffd66b, #d3a133);
              display: flex; align-items: center; justify-content: center;
              color: #5c3b00; font-weight: 800; text-transform: uppercase; border: 4px solid #b68c2b;
              box-shadow: 0 6px 14px rgba(0,0,0,.15);
            }
            .address { position: absolute; bottom: 12mm; width: 100%; text-align: center; color: #777; font-size: 11px; }
            @media print { body { background: white; } .page { box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="border-outer"></div>
            <div class="border-inner"></div>
            <div class="content">
              <div class="brand">
                ${logoUrl ? `<img src="${logoUrl}" alt="logo" />` : ''}
                <div class="company">${companyName}</div>
              </div>
              <div class="title">Certificate of Completion</div>
              <div class="subtitle">This certificate is proudly presented to</div>
              <div class="student">${certificate.student?.name || 'Student'}</div>
              <div class="line"></div>
              <div class="subtitle">for successfully completing the course</div>
              <div class="course">${courseTitle}</div>

              <div class="meta">
                <div class="item">
                  <div class="label">Certificate No</div>
                  <div class="value">${certificate.certificateNumber}</div>
                </div>
                <div class="item">
                  <div class="label">Score</div>
                  <div class="value">${certificate.score}</div>
                </div>
                <div class="item">
                  <div class="label">Percentage</div>
                  <div class="value">${certificate.percentage}%</div>
                </div>
                <div class="item">
                  <div class="label">Issued</div>
                  <div class="value">${formatDate(certificate.issuedAt)}</div>
                </div>
              </div>

              <div class="footer">
                <div class="sign">
                  <div class="sign-line"></div>
                  <div class="sign-name">${certificate.course?.educator?.name || 'Course Instructor'}</div>
                  <div class="sign-role">Instructor</div>
                </div>
                <div class="seal">Official</div>
                <div class="sign">
                  <div class="sign-line"></div>
                  <div class="sign-name">${companyName}</div>
                  <div class="sign-role">Director</div>
                </div>
              </div>

              <div class="address">${companyAddress}</div>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4'></div>
          <p className='text-gray-600 font-medium'>Loading certificates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-8 lg:mb-12'>
          <h1 className={`font-bold text-gray-800 mb-3 ${isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl lg:text-5xl'}`}>
            My Certificates
          </h1>
          <p className='text-gray-600 text-base lg:text-lg'>View and download your earned certificates</p>
        </div>

        {certificates.length === 0 ? (
          <div className='text-center py-12 lg:py-16'>
            <div className='text-gray-400 mb-6'>
              <svg className={`mx-auto ${isMobile ? 'w-20 h-20' : 'w-24 h-24 lg:w-32 lg:h-32'}`} fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9 12a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm1-8a1 1 0 00-1 1v3a1 1 0 102 0V5a1 1 0 00-1-1z' clipRule='evenodd' />
              </svg>
            </div>
            <h3 className={`font-semibold text-gray-600 mb-3 ${isMobile ? 'text-lg' : 'text-xl lg:text-2xl'}`}>
              No Certificates Yet
            </h3>
            <p className='text-gray-500 text-base lg:text-lg max-w-md mx-auto'>
              Complete course assignments to earn your first certificate!
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6'>
            {certificates.map(certificate => (
              <div key={certificate._id} className='bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                {/* Certificate Preview */}
                <div className='bg-gradient-to-br from-red-600 to-red-700 p-6 text-white text-center'>
                  <div className='text-4xl mb-3'>🎓</div>
                  <h3 className='text-lg font-semibold mb-2'>Certificate of Completion</h3>
                  <p className='text-sm opacity-90'>Course: {certificate.course.courseTitle}</p>
                </div>

                {/* Certificate Details */}
                <div className='p-6'>
                  <div className='space-y-4 mb-6'>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600 text-sm'>Score:</span>
                      <span className='font-semibold text-gray-800'>{certificate.score}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600 text-sm'>Percentage:</span>
                      <span className='font-semibold text-green-600'>{certificate.percentage}%</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600 text-sm'>Issued:</span>
                      <span className='font-semibold text-gray-800'>{formatDate(certificate.issuedAt)}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600 text-sm'>Certificate #:</span>
                      <span className='font-semibold text-gray-800'>{certificate.certificateNumber}</span>
                    </div>
                  </div>

                  <div className='border-t border-gray-200 pt-4'>
                    <div className='flex flex-col sm:flex-row gap-3'>
                      <button
                        onClick={() => downloadCertificate(certificate)}
                        className='flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold'
                      >
                        📄 View & Print
                      </button>
                      <button
                        onClick={() => setSelectedCertificate(certificate)}
                        className='flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-all duration-300 font-semibold'
                      >
                        ℹ️ Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificate Details Modal */}
        {selectedCertificate && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-xl shadow-2xl p-6 lg:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className={`font-bold text-gray-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  Certificate Details
                </h2>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className='p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200'
                >
                  <span className='text-2xl text-gray-500 hover:text-gray-700'>×</span>
                </button>
              </div>

              <div className='space-y-6'>
                <div className='bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200'>
                  <h3 className='font-semibold text-lg mb-3 text-gray-800'>Course Information</h3>
                  <p className='text-gray-700 text-base lg:text-lg'>{selectedCertificate.course.courseTitle}</p>
                  {selectedCertificate.course.courseThumbnail && (
                    <img 
                      src={selectedCertificate.course.courseThumbnail} 
                      alt='Course thumbnail' 
                      className='w-20 h-20 object-cover rounded-lg mt-3 border border-gray-200'
                    />
                  )}
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6'>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <label className='block text-sm font-semibold text-gray-600 mb-1'>Certificate Number</label>
                    <p className='font-semibold text-gray-800'>{selectedCertificate.certificateNumber}</p>
                  </div>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <label className='block text-sm font-semibold text-gray-600 mb-1'>Assignment</label>
                    <p className='font-semibold text-gray-800'>{selectedCertificate.assignment?.title || 'N/A'}</p>
                  </div>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <label className='block text-sm font-semibold text-gray-600 mb-1'>Score</label>
                    <p className='font-semibold text-gray-800'>{selectedCertificate.score}</p>
                  </div>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <label className='block text-sm font-semibold text-gray-600 mb-1'>Percentage</label>
                    <p className='font-semibold text-green-600'>{selectedCertificate.percentage}%</p>
                  </div>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <label className='block text-sm font-semibold text-gray-600 mb-1'>Issued Date</label>
                    <p className='font-semibold text-gray-800'>{formatDate(selectedCertificate.issuedAt)}</p>
                  </div>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <label className='block text-sm font-semibold text-gray-600 mb-1'>Expiry Date</label>
                    <p className='font-semibold text-gray-800'>{formatDate(selectedCertificate.expiresAt)}</p>
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200'>
                  <button
                    onClick={() => downloadCertificate(selectedCertificate)}
                    className='flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold'
                  >
                    📄 View & Print Certificate
                  </button>
                  <button
                    onClick={() => setSelectedCertificate(null)}
                    className='flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 font-semibold'
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CertificateViewer
