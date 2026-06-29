import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth'
import { auth } from '../../firebase'
import toast from 'react-hot-toast'

export default function VerifyEmailSentPage() {
  const { verificationEmail } = useSelector((s) => s.auth)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResend = async () => {
    setResending(true)
    try {
      const user = auth.currentUser
      if (user) {
        await sendEmailVerification(user)
        setResent(true)
        toast.success('Verification email resent!')
      } else {
        toast.error('Please register again to resend')
      }
    } catch {
      toast.error('Could not resend email. Try again later.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md text-center">

        <img
          src="/smartlearn.png"
          alt="SmartLearn"
          className="w-16 h-16 rounded-2xl object-cover mx-auto mb-6"
        />

        <div className="text-5xl mb-4">📧</div>

        <h1 className="text-2xl font-medium text-gray-900 mb-2">
          Check your email
        </h1>

        <p className="text-gray-500 text-sm mb-2 leading-relaxed">
          We sent a verification link to:
        </p>

        <p className="font-medium text-gray-900 mb-6">
          {verificationEmail || 'your email address'}
        </p>

        <div className="card mb-6 text-left">
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-primary-600 font-medium flex-shrink-0">1.</span>
              <span>Open your email inbox</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-600 font-medium flex-shrink-0">2.</span>
              <span>Click the verification link from SmartLearn</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-600 font-medium flex-shrink-0">3.</span>
              <span>Come back and log in to your account</span>
            </div>
          </div>
        </div>

        <Link to="/login" className="btn-primary w-full block py-2.5 mb-4">
          Go to login
        </Link>

        <div className="text-sm text-gray-500">
          Didn't receive the email?{' '}
          {resent ? (
            <span className="text-green-600 font-medium">Email sent!</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-primary-600 hover:underline font-medium"
            >
              {resending ? 'Sending...' : 'Resend email'}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Check your spam folder if you don't see it in your inbox
        </p>

      </div>
    </div>
  )
}