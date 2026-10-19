import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Shield, ArrowRight, Lock, Mail, User as UserIcon, Sparkles, X, AlertCircle, CheckCircle } from 'lucide-react';

export const AuthView = () => {
  const {
    authSubView,
    setAuthSubView,
    setCurrentView,
    loginUser,
    signupUser,
    returnViewAfterAuth,
    showToast
  } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('shreya.patel@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Shreya Patel');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (authSubView === 'login') {
        const result = await loginUser({ email, password, targetView: returnViewAfterAuth || 'home' });
        if (!result.success) {
          setAuthError(result.error || 'Invalid email or password');
        }
      } else if (authSubView === 'signup') {
        if (!name.trim()) {
          setAuthError('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setAuthError('Password must be at least 6 characters');
          setIsSubmitting(false);
          return;
        }
        const result = await signupUser({ name, email, password, targetView: returnViewAfterAuth || 'home' });
        if (!result.success) {
          setAuthError(result.error || 'Failed to create account');
        }
      } else if (authSubView === 'forgot') {
        setResetSent(true);
        showToast('Password reset instructions sent to your email ✉️');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setName('Shreya Patel');
    setEmail('shreya.patel@example.com');
    setPassword('password123');
    setAuthSubView('login');
    setAuthError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center p-4 sm:p-6 relative">
      
      {/* Top Close / Return Button */}
      <button
        onClick={() => setCurrentView('home')}
        className="absolute top-5 right-5 p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 shadow-sm transition-all cursor-pointer"
        title="Return to Home"
        aria-label="Close Auth"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="max-w-md mx-auto w-full">
        
        {/* Header Branding */}
        <div className="text-center mb-6 space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white text-3xl shadow-lg shadow-pink-500/20">
            🌸
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {authSubView === 'login' && 'Welcome Back to FemCare'}
            {authSubView === 'signup' && 'Create Your Private Account'}
            {authSubView === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Secure, confidential menstrual health & wellness tracking with Supabase
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          
          {/* Quick Demo Credential Pill */}
          {authSubView === 'login' && (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900/50 text-[11px]">
              <div className="flex items-center gap-1.5 text-pink-700 dark:text-pink-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                <span>Demo user pre-configured</span>
              </div>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="px-2.5 py-1 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-[10px] cursor-pointer transition-all"
              >
                Auto-Fill
              </button>
            </div>
          )}

          {/* Error Banner */}
          {authError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{authError}</div>
            </div>
          )}

          {/* Forgot Password Reset Notice */}
          {authSubView === 'forgot' && resetSent && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>If an account with this email exists, a password reset link has been dispatched.</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {authSubView === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shreya Patel"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                </div>
              </div>
            )}

            {authSubView !== 'forgot' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {authSubView === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthSubView('forgot');
                          setAuthError(null);
                        }}
                        className="text-xs text-pink-600 dark:text-pink-400 hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {authSubView === 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enter Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-98'
              }`}
            >
              <span>
                {isSubmitting
                  ? 'Please wait...'
                  : authSubView === 'login'
                  ? 'Sign In'
                  : authSubView === 'signup'
                  ? 'Create Account'
                  : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Privacy Statement */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <Shield className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
            <div>
              <strong>Your health information is private.</strong> Encrypted and safely stored in your dedicated Supabase database.
            </div>
          </div>

          {/* Switch Subview */}
          <div className="text-center text-xs text-slate-500 font-medium pt-1">
            {authSubView === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setAuthSubView('signup');
                    setAuthError(null);
                  }}
                  className="text-pink-600 dark:text-pink-400 font-bold hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setAuthSubView('login');
                    setAuthError(null);
                  }}
                  className="text-pink-600 dark:text-pink-400 font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
