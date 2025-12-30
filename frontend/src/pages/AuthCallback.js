import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '@/lib/api';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error('Invalid session');
          navigate('/login', { replace: true });
          return;
        }

        const response = await createSession(sessionId);
        const { session_token, user } = response.data;

        // Set cookie
        document.cookie = `session_token=${session_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=none; secure`;

        toast.success('Logged in successfully!');

        // Redirect based on role
        navigate('/dashboard', { replace: true, state: { user } });
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Authentication failed');
        navigate('/login', { replace: true });
      }
    };

    processSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF6B35] border-r-transparent"></div>
        <p className="mt-4 text-[#666666]">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback;