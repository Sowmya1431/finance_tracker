import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Create.css';

const Create = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('auth-token');
  const navigate = useNavigate();

  const categories = [
    "Travel",
    "Health",
    "Food",
    "Entertainment",
    "Shoping",
    "Rent",
    "Education",
    "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!category) {
      setError('Category is required');
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/createexpence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category, amount: Number(amount) }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg('Expense created successfully!');
        setCategory('');
        setAmount('');
        setTimeout(() => {
          setSuccessMsg('');
          navigate('/dashboard'); // Redirect to dashboard after 3 seconds
        }, 1500);
      } else {
        setError(data.message || 'Failed to create expense');
      }
    } catch (err) {
      setError('Server error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="create-expense-container">
              <button 
        className="back-btn" 
        onClick={() => navigate('/dashboard')} 
        disabled={loading}
        style={{ marginBottom: '20px' }}
      >
        &larr; Back to Dashboard
      </button>

      <h2>Add New Expense</h2>

      {/* Back button */}

      <form onSubmit={handleSubmit} className="create-expense-form">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          disabled={loading}
          className="input-field"
        >
          <option value="">-- Select Category --</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label htmlFor="amount">Amount (₹)</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Enter amount"
          disabled={loading}
          min="0"
          step="0.01"
          className="input-field"
        />

        {error && <p className="error-message">{error}</p>}
        {successMsg && <p className="success-message">{successMsg}</p>}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default Create;
