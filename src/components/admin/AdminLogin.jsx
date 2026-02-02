import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../Services/api'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0) // 0: login, 1: email, 2: OTP, 3: reset
  const [resetEmail, setResetEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  
  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await authAPI.login(email, password)
      // Store the token in localStorage
      if (response.token) {
        localStorage.setItem('adminToken', response.token)
        localStorage.setItem('adminAuthenticated', 'true')
        if (rememberMe) {
          localStorage.setItem('adminEmail', email)
        }
        // Navigate to dashboard
        navigate('/admin/dashboard')
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!resetEmail) {
      setError('Please enter your email address')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await authAPI.forgotPassword(resetEmail)
      setForgotPasswordStep(2) // Move to OTP verification step
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleOTPChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }
  
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      setOtpError('Please enter all 6 digits')
      return
    }
    
    setIsLoading(true)
    setOtpError('')
    
    try {
      await authAPI.verifyOTP(resetEmail, otpValue)
      setForgotPasswordStep(3) // Move to password reset step
    } catch (err) {
      setOtpError(err.message || 'Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await authAPI.resetPassword(resetEmail, newPassword, confirmPassword)
      setResetSuccess(true)
      
      // Return to login after showing success message
      setTimeout(() => {
        setForgotPasswordStep(0)
        setResetSuccess(false)
        setEmail(resetEmail) // Pre-fill the email field
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const renderLoginForm = () => (
    <form className="space-y-6" onSubmit={handleLogin}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">

        <div className="text-sm">
          <button 
            type="button" 
            onClick={() => setForgotPasswordStep(1)}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot your password?
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </div>
    </form>
  )
  
  const renderForgotPasswordEmail = () => (
    <form className="space-y-6" onSubmit={handleSendOTP}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Forgot Password</h3>
        <p className="text-gray-500 mt-1">Enter your email to receive a verification code</p>
      </div>
      
      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">Email address</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <input
            id="reset-email"
            name="reset-email"
            type="email"
            autoComplete="email"
            required
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"
            placeholder="your@email.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setForgotPasswordStep(0)}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out"
        >
          Back to Login
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            'Send OTP'
          )}
        </button>
      </div>
    </form>
  )
  
  const renderOTPVerification = () => (
    <form className="space-y-6" onSubmit={handleVerifyOTP}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Verify OTP</h3>
        <p className="text-gray-500 mt-1">Enter the 6-digit code sent to {resetEmail}</p>
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleOTPChange(index, e.target.value)}
            className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '')}
            onKeyUp={(e) => {
              if (e.key === 'Backspace' && !digit && index > 0) {
                const prevInput = document.getElementById(`otp-${index - 1}`);
                if (prevInput) {
                  prevInput.focus();
                  handleOTPChange(index - 1, '');
                }
              }
            }}
          />
        ))}
      </div>
      
      {otpError && (
        <div className="mb-4 text-red-500 text-sm text-center">{otpError}</div>
      )}
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setForgotPasswordStep(1)}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out"
        >
          Back to Email
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>
      </div>
    </form>
  )
  
  const renderPasswordReset = () => (
    <form className="space-y-6" onSubmit={handleResetPassword}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Reset Password</h3>
        <p className="text-gray-500 mt-1">Enter your new password</p>
      </div>
      
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            id="new-password"
            name="new-password"
            type={showNewPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showNewPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            id="confirm-password"
            name="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setForgotPasswordStep(2)}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out"
        >
          Back to OTP
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </div>
    </form>
  )
  
  const renderResetSuccess = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-800">Password Reset Successful</h3>
      <p className="text-gray-500 mt-1">Your password has been successfully reset.</p>
      <p className="text-gray-500 mt-1">You can now log in with your new password.</p>
      <button
        onClick={() => setForgotPasswordStep(0)}
        className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out"
      >
        Back to Login
      </button>
    </div>
  )
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 p-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </div>
      
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-blue-600">Property</span>Finder
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-gray-700">
            Admin Portal
          </h2>
        </div>
        
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Sign In</h3>
              <p className="text-gray-500 mt-1">Access your admin dashboard</p>
            </div>
            
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md" role="alert">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 001.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {forgotPasswordStep === 0 ? renderLoginForm() :
              forgotPasswordStep === 1 ? renderForgotPasswordEmail() :
              forgotPasswordStep === 2 ? renderOTPVerification() :
              forgotPasswordStep === 3 ? renderPasswordReset() :
              resetSuccess ? renderResetSuccess() : null}
          </div>
          

        </div>
        
      </div>
    </div>
  )
}

export default AdminLogin



