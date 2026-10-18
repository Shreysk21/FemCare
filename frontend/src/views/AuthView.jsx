import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Shield, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';

export const AuthView = () => {
  const { authSubView, setAuthSubView, setCurrentView, loginUser, returnViewAfterAuth } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('shreya.patel@example.com');
  const [password, setPassword] = useState('●●●●●●●●');
  const [name, setName] = useState('Shreya Patel');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(returnViewAfterAuth || 'home');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        
        {/* Header Branding */}
        <div className="text-center mb-8 space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white text-3xl shadow-lg shadow-pink-500/20">
            🌸
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {authSubView === 'login' && 'Welcome Back to FemCare'}
            {authSubView === 'signup' && 'Create Your Private Account'}
            {authSubView === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Secure, confidential menstrual health & daily wellness tracking
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          
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
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-pink-500"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-pink-500"
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
                        onClick={() => setAuthSubView('forgot')}
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
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-pink-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>
                {authSubView === 'login' && 'Sign In'}
                {authSubView === 'signup' && 'Create Account'}
                {authSubView === 'forgot' && 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Privacy Statement */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <Shield className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
            <div>
              <strong>Your health information is private.</strong> You control what you record and what notifications you receive.
            </div>
          </div>

          {/* Switch Subview */}
          <div className="text-center text-xs text-slate-500 font-medium">
            {authSubView === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthSubView('signup')}
                  className="text-pink-600 dark:text-pink-400 font-bold hover:underline"
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setAuthSubView('login')}
                  className="text-pink-600 dark:text-pink-400 font-bold hover:underline"
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
