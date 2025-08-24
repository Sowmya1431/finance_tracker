import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './History.css';

const History = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const token = localStorage.getItem('auth-token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.history || []);
        setError('');
      } else {
        setError(data.message || 'Failed to load history');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      const res = await fetch(`${API_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
      } else {
        alert(data.message || 'Failed to delete expense');
      }
    } catch (err) {
      alert('Error deleting expense: ' + err.message);
    }
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setEditCategory(item.category);
    setEditAmount(item.amount);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditCategory('');
    setEditAmount('');
  };

  const handleUpdate = async (id) => {
    if (!editCategory.trim()) {
      alert('Category cannot be empty');
      return;
    }
    if (!editAmount || isNaN(editAmount) || Number(editAmount) <= 0) {
      alert('Enter a valid amount');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category: editCategory, amount: Number(editAmount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setHistory((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, category: editCategory, amount: Number(editAmount) } : item
          )
        );
        cancelEdit();
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      alert('Error updating expense: ' + err.message);
    }
  };

  if (loading) return <p>Loading expense history...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="history-container">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        &larr; Back to Dashboard
      </button>
      <h2>Expense History</h2>
      {history.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount (₹)</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map(({ _id, category, amount, date }) => (
              <tr key={_id}>
                <td data-label="Category">
                  {editId === _id ? (
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    />
                  ) : (
                    category
                  )}
                </td>
                <td data-label="Amount (₹)">
                  {editId === _id ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    amount
                  )}
                </td>
                <td data-label="Date">{new Date(date).toLocaleDateString()}</td>
                <td data-label="Actions">
                  {editId === _id ? (
                    <>
                      <button onClick={() => handleUpdate(_id)} style={{ marginRight: 8 }}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit({ _id, category, amount })} style={{ marginRight: 8 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(_id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default History;
