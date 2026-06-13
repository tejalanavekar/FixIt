import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate , Link } from 'react-router-dom'

export default function SignInPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    //Email login when user presses signin
    //preventDefault, to not refresh page after submission
    const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            setError(error.message)
            setIsLoading(false)
            return
        } else {
            navigate('/home')
        }
    }

    const handleGithubLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: 'http://localhost:5173/home'
            }
        })

        }
    
    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'http://localhost:5173/home'
            }
        })
    }

    return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-4xl">⚡</span>
        </div>
        <span className="text-white text-6xl font-semibold">FixIt</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-black rounded-2xl p-12 border border-gray-700">
        
        <h1 className="text-white text-5xl font-bold text-center mb-2">
          Welcome back
        </h1>
        <p className="text-gray-300 text-center mb-8 text-xl">
          Sign in to continue your learning
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-base p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div>
            <label className="text-gray-300 text-2xl mb-2 block font-medium">Email</label>
            <input
              type="email"
             
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-xl"
              required
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-gray-300 text-2xl font-medium">Password</label>
              <button type="button" className="text-blue-400 text-2xl hover:underline">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-[#2a2a2a] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-600 text-xl"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-700" />
        <span className="text-gray-400 text-2xl">OR </span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

          {/* GitHub Button */}
        <button
          onClick={handleGithubLogin}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-lg mb-4 transition text-2xl"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-lg mb-4 transition text-2xl"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-2xl"
          >
            {isLoading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="text-gray-400 text-center text-2xl mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      {/* Guest */}
      <button
        onClick={() => navigate('/home')}
        className="text-gray-400 text-3xl mt-8 hover:text-gray-300 transition"
      >
        Continue as guest →
      </button>
    </div>
  )


}