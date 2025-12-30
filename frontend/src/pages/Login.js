import React from 'react';
import { Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Login = () => {
  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF6B35] via-[#FFC107] to-[#4CAF50] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Utensils className="h-12 w-12 text-[#FF6B35]" />
            <span className="text-3xl font-bold text-[#1A1A1A]">HomeCook Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Welcome Back!
          </h1>
          <p className="text-[#666666]">
            Sign in to access your account
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E0D8]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#666666]">
                Continue with
              </span>
            </div>
          </div>

          <Button
            data-testid="google-login-btn"
            onClick={handleGoogleLogin}
            className="w-full bg-white border-2 border-[#E5E0D8] text-[#1A1A1A] hover:bg-[#FDFBF7] hover:border-[#FF6B35] rounded-full py-6 text-lg font-medium flex items-center justify-center space-x-3 transition-all"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google</span>
          </Button>

          <p className="text-center text-sm text-[#666666]">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#666666]">
            New to HomeCook Hub?{' '}
            <button className="text-[#FF6B35] font-medium hover:underline">
              Learn More
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;