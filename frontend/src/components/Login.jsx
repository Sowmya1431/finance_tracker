import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const API_URL = import.meta.env.VITE_API_URL;

  
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setMessage('');
    setIsSuccess(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setMessage('Please enter your email.');
      return;
    } else if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('login-token', data.token);
        setMessage(data.message || 'OTP sent successfully!');
        setIsSuccess(true);
        setTimeout(() => navigate('/verifyotp'), 1200);
      } else {
        setMessage(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setMessage('Error sending OTP. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form
        className="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLoading) handleSendOtp();
        }}
        noValidate
      >
        <label htmlFor="email" className="login-label">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className="login-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          className="login-button"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send OTP'}
        </button>
        {message && (
          <p className={isSuccess ? 'login-message success' : 'login-message error'}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default Login;
