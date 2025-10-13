import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiCall from '../services/apiCall';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Missing verification token. Please use the link from your email.');
      return;
    }

    const verify = async () => {
      try {
        // Backend route expects path param: /users/verify-email/:token
        const res = await apiCall(`/auth/verify-email/${token}`, { method: 'GET' });
        setStatus('success');
        setMessage(res?.message || 'Email verified successfully! Redirecting to sign in...');
        setTimeout(() => navigate('/signin'), 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err?.message || 'Email verification failed. The link may be invalid or expired.');
      }
    };

    verify();
  }, [navigate, searchParams]);

  const color = status === 'loading' ? '#555' : status === 'success' ? 'green' : 'crimson';

  return (
    <div style={{ maxWidth: 520, margin: '80px auto', padding: 24, border: '1px solid #eee', borderRadius: 12, textAlign: 'center' }}>
      <h2>Email Verification</h2>
      <p style={{ color }}>{message}</p>
      {status === 'error' && (
        <div style={{ marginTop: 16 }}>
          <button onClick={() => navigate('/signin')} style={{ padding: '10px 16px' }}>Go to Sign In</button>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
