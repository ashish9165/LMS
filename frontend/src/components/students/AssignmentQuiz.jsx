import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'

const AssignmentQuiz = () => {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [answers, setAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAssignment()
  }, [assignmentId])

  useEffect(() => {
    if (assignment && timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [assignment, timeLeft, isSubmitted])

  const fetchAssignment = async () => {
    try {
      const response = await axios.get(`/assignments/assignments/${assignmentId}?studentView=true`)
      setAssignment(response.data.assignment)
      setTimeLeft(response.data.assignment.timeLimit * 60) // Convert to seconds
      setAnswers(new Array(response.data.assignment.questions.length).fill({ studentAnswer: '' }))
      setLoading(false)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch assignment')
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionIndex, answer) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = { studentAnswer: answer }
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    if (isSubmitted) return

    try {
      const timeTaken = Math.floor((assignment.timeLimit * 60 - timeLeft) / 60) // Convert back to minutes
      const response = await axios.post(`/assignments/assignments/${assignmentId}/submit`, {
        answers,
        timeTaken
      })

      setSubmission(response.data.submission)
      setIsSubmitted(true)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit assignment')
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const printCertificate = (certificate) => {
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${certificate.course?.courseTitle || ''}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: #f6f7fb; }
            .certificate { background: white; padding: 60px; border-radius: 16px; box-shadow: 0 12px 30px rgba(0,0,0,.12); max-width: 900px; margin: 0 auto; text-align: center; }
            .title { font-size: 40px; color: #2d6cdf; margin: 0; font-weight: 800; letter-spacing: .5px; }
            .subtitle { color: #666; margin-top: 8px; }
            .student { font-size: 28px; margin: 24px 0 8px; font-weight: 700; }
            .course { font-size: 20px; color: #2d6cdf; font-weight: 600; }
            .box { display: flex; justify-content: space-around; margin: 30px 0; flex-wrap: wrap; }
            .item { margin: 10px; }
            .label { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
            .foot { border-top: 1px solid #eee; margin-top: 30px; padding-top: 16px; color: #999; font-size: 12px; }
            @media print { body { background: white; } .certificate { box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="certificate">
            <h1 class="title">Certificate of Completion</h1>
            <div class="subtitle">This certifies that</div>
            <div class="student">${certificate.student?.name || 'Student'}</div>
            <div class="subtitle">has successfully completed</div>
            <div class="course">${certificate.course?.courseTitle || ''}</div>
            <div class="box">
              <div class="item"><div class="label">Score</div><div class="value">${certificate.score}</div></div>
              <div class="item"><div class="label">Percentage</div><div class="value">${certificate.percentage}%</div></div>
              <div class="item"><div class="label">Issued</div><div class="value">${formatDate(certificate.issuedAt)}</div></div>
              <div class="item"><div class="label">Certificate #</div><div class="value">${certificate.certificateNumber}</div></div>
            </div>
            <div class="foot">Valid for 2 years from issue date.</div>
          </div>
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
  }

  const generateCertificate = async () => {
    try {
      await axios.post(`/assignments/assignments/${assignmentId}/certificate`, {})
      // Fetch certificates and find the one for this assignment
      const res = await axios.get('/assignments/certificates')
      const certs = Array.isArray(res.data.certificates) ? res.data.certificates : []
      const cert = certs.find(c => (c.assignment?._id || c.assignment) === assignmentId) || certs[0]
      if (cert) {
        printCertificate(cert)
      } else {
        alert('Certificate generated. You can view it under My Certificates.')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate certificate')
    }
  }

  const fetchAndDownloadAutoCertificate = async () => {
    try {
      const res = await axios.get('/assignments/certificates')
      const certs = Array.isArray(res.data.certificates) ? res.data.certificates : []
      const cert = certs.find(c => (c.assignment?._id || c.assignment) === assignmentId) || certs[0]
      if (cert) {
        printCertificate(cert)
      }
    } catch (_) {}
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p>Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-500 mb-4'>{error}</p>
          <button
            onClick={() => navigate('/my-enrollments')}
            className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
          >
            Back to Enrollments
          </button>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-4xl mx-auto px-4'>
          <div className='bg-white rounded-lg shadow-lg p-8 text-center'>
            <div className='mb-6'>
              {submission.passed ? (
                <div className='text-green-600'>
                  <svg className='w-16 h-16 mx-auto mb-4' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                  </svg>
                  <h2 className='text-2xl font-bold text-green-600'>Congratulations!</h2>
                  <p className='text-lg'>You passed the assignment!</p>
                </div>
              ) : (
                <div className='text-red-600'>
                  <svg className='w-16 h-16 mx-auto mb-4' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                  </svg>
                  <h2 className='text-2xl font-bold text-red-600'>Not Passed</h2>
                  <p className='text-lg'>Keep trying! You can review the material and retake the assignment.</p>
                </div>
              )}
            </div>

            <div className='bg-gray-50 rounded-lg p-6 mb-6'>
              <h3 className='text-xl font-semibold mb-4'>Your Results</h3>
              <div className='grid grid-cols-2 gap-4 text-center'>
                <div>
                  <p className='text-2xl font-bold text-blue-600'>{submission.score}</p>
                  <p className='text-gray-600'>Score</p>
                </div>
                <div>
                  <p className='text-2xl font-bold text-blue-600'>{submission.totalPoints}</p>
                  <p className='text-gray-600'>Total Points</p>
                </div>
                <div>
                  <p className='text-2xl font-bold text-blue-600'>{submission.percentage}%</p>
                  <p className='text-gray-600'>Percentage</p>
                </div>
                <div>
                  <p className='text-2xl font-bold text-blue-600'>{submission.timeTaken}</p>
                  <p className='text-gray-600'>Minutes Taken</p>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              {submission.passed && (
                <>
                  <button
                    onClick={generateCertificate}
                    className='bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 text-lg font-semibold'
                  >
                    Generate & Download Certificate
                  </button>
                  <button
                    onClick={fetchAndDownloadAutoCertificate}
                    className='bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 text-lg font-semibold ml-4'
                  >
                    Download Auto-Created Certificate
                  </button>
                </>
              )}
              
              <button
                onClick={() => navigate('/my-enrollments')}
                className='bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 text-lg font-semibold ml-4'
              >
                Back to My Enrollments
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
          <div className='flex justify-between items-start mb-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>{assignment.title}</h1>
              <p className='text-gray-600 mt-2'>{assignment.description}</p>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-red-600'>{formatTime(timeLeft)}</div>
              <div className='text-sm text-gray-500'>Time Remaining</div>
            </div>
          </div>
          
          <div className='flex justify-between items-center text-sm text-gray-500'>
            <span>Questions: {assignment.questions.length}</span>
            <span>Passing Score: {assignment.passingScore}%</span>
            <span>Time Limit: {assignment.timeLimit} minutes</span>
          </div>
        </div>

        {/* Questions */}
        <div className='space-y-6'>
          {assignment.questions.map((question, index) => (
            <div key={index} className='bg-white rounded-lg shadow-lg p-6'>
              <div className='mb-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                  Question {index + 1} (Points: {question.points})
                </h3>
                <p className='text-gray-700'>{question.question}</p>
              </div>

              <div className='space-y-3'>
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className='flex items-center cursor-pointer'>
                    <input
                      type='radio'
                      name={`question-${index}`}
                      value={option}
                      checked={answers[index]?.studentAnswer === option}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      className='mr-3 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='text-gray-700'>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className='mt-8 text-center'>
          <button
            onClick={handleSubmit}
            disabled={isSubmitted}
            className='bg-blue-500 text-white px-8 py-3 rounded-md hover:bg-blue-600 disabled:bg-gray-400 text-lg font-semibold'
          >
            Submit Assignment
          </button>
        </div>

        {/* Progress Indicator */}
        <div className='mt-6 text-center'>
          <div className='inline-flex items-center space-x-2 text-sm text-gray-500'>
            <span>Progress:</span>
            <span className='font-medium'>
              {answers.filter(a => a.studentAnswer).length} / {assignment.questions.length} questions answered
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentQuiz
