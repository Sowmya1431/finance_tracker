import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Verifyotp.css';

function Verifyotp() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyOtp = async () => {
    setMessage('');
    setIsSuccess(false);

    if (!otp) {
      setMessage('Please enter the OTP.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/verifyotp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('login-token')}`,
        },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (data.Token) {
        localStorage.setItem('auth-token', data.Token);
        localStorage.removeItem('login-token');
        setIsSuccess(true);
        setMessage('OTP verified successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setMessage(data.message || 'Invalid OTP');
      }
    } catch {
      setMessage('Error verifying OTP. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-otp-container">
      <h2 className="verify-otp-title">Verify OTP</h2>
      <div className="verify-otp-form">
        <label htmlFor="otp" className="visually-hidden">Enter OTP</label>
        <input
          id="otp"
          type="text"
          className="verify-otp-input"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*$/.test(val) && val.length <= 6) {
              setOtp(val);
            }
          }}
          autoComplete="one-time-code"
          maxLength={6}
          disabled={isLoading}
          aria-label="Enter OTP"
        />
        <button
          type="button"
          className="verify-otp-button"
          onClick={handleVerifyOtp}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
        {message && (
          <p
            className={
              isSuccess ? 'verify-otp-message success' : 'verify-otp-message error'
            }
            role="alert"
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Verifyotp;
