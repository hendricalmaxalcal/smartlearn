import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

export default function VerifyEmailPage() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    api.get(`/auth/verify/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <img
          src="/smartlearn.png"
          alt="SmartLearn"
          className="w-16 h-16 rounded-2xl object-cover mx-auto mb-6"
        />

        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-medium mb-2">Verifying your email...</h1>
            <p className="text-gray-500">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-medium mb-2">Email verified!</h1>
            <p className="text-gray-500 mb-6">
              Your account is now active. You can sign in and start learning.
            </p>
            <Link to="/login" className="btn-primary px-8 py-2.5">
              Go to login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-medium mb-2">Verification failed</h1>
            <p className="text-gray-500 mb-6">
              This link is invalid or has expired. Please register again.
            </p>
            <Link to="/register" className="btn-primary px-8 py-2.5">
              Register again
            </Link>
          </>
        )}

      </div>
    </div>
  )
}