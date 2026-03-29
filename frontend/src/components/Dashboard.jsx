import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [presentMonthData, setPresentMonthData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [income, setIncome] = useState(0);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('auth-token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const totalRes = await fetch(`${API_URL}/totalamount`, { headers });
      const totalData = await totalRes.json();
      setTotal(totalData.Totalamount);

      const monthRes = await fetch(`${API_URL}/monthtotal`, { headers });
      const monthData = await monthRes.json();
      setMonthTotal(monthData.MonthExpence);

      const categoryRes = await fetch(`${API_URL}/category`, { headers });
      const categoryData = await categoryRes.json();
      setCategoryData(categoryData.data);

      const presentRes = await fetch(`${API_URL}/presentmonth`, { headers });
      const presentData = await presentRes.json();
      setPresentMonthData(presentData.data);

      const monthlyRes = await fetch(`${API_URL}/monthlyexpences`, { headers });
      const monthlyData = await monthlyRes.json();
      setMonthlyData(monthlyData.data);

      const incomeRes = await fetch(`${API_URL}/income`, { headers });
      const incomeData = await incomeRes.json();
      setIncome(incomeData.income || 0);
      setIncomeInput(incomeData.income || '');
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-show income modal only once for new users (income = 0) on the very first load
  useEffect(() => {
    // Check if modal was already shown for this user
    const incomeModalShown = localStorage.getItem('incomeModalShown');
    
    // Only show if: income is 0 (new user) AND modal hasn't been shown before
    if (income === 0 && !incomeModalShown) {
      setShowIncomeModal(true);
      // Mark that modal has been shown
      localStorage.setItem('incomeModalShown', 'true');
    }
  }, [income]);

  const handleSaveIncome = async () => {
    setError('');
    if (!incomeInput || isNaN(incomeInput) || Number(incomeInput) < 0) {
      setError('Please enter a valid income amount');
      return;
    }

    try {
      const method = income === 0 ? 'POST' : 'PUT';
      const endpoint = income === 0 ? '/setincome' : '/updateincome';
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ income: Number(incomeInput) }),
      });

      const data = await res.json();
      if (res.ok) {
        setIncome(data.income);
        setShowIncomeModal(false);
        // Mark modal as shown when income is successfully saved
        localStorage.setItem('incomeModalShown', 'true');
      } else {
        setError(data.message || 'Failed to update income');
      }
    } catch (err) {
      setError('Error updating income: ' + err.message);
    }
  };

  const remainingBalance = income - total;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#FF6666', '#4CAF50', '#9C27B0'];
  const allCategories = [
    ...new Set([
      ...categoryData.map(item => item._id),
      ...presentMonthData.map(item => item._id)
    ])
  ];

  const categoryColorMap = {};
  allCategories.forEach((cat, i) => {
    categoryColorMap[cat] = COLORS[i % COLORS.length];
  });

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const years = Array.from(new Set(monthlyData.map(d => d.year))).sort();

  const fullMonthlyData = [];
  years.forEach(year => {
    MONTH_NAMES.forEach((month, idx) => {
      const found = monthlyData.find(d => d.year === year && d.month === month);
      fullMonthlyData.push({
        monthYear: `${month} ${year}`,
        year,
        monthIndex: idx,
        totalAmount: found ? found.totalAmount : 0,
      });
    });
  });

  fullMonthlyData.sort((a, b) => (a.year - b.year) || (a.monthIndex - b.monthIndex));

  const renderCustomizedTick = ({ x, y, payload }) => {
    const val = payload.value;
    if (typeof val === 'string' && val.includes(' ')) {
      const [month, year] = val.split(' ');
      return (
        <g transform={`translate(${x},${y + 10})`}>
          <text x={0} y={0} textAnchor="middle" fill="#666" fontSize={12}>
            {month}
          </text>
          <text x={0} y={15} textAnchor="middle" fill="#666" fontSize={10} fontWeight="bold">
            {year}
          </text>
        </g>
      );
    } else {
      return (
        <g transform={`translate(${x},${y + 10})`}>
          <text x={0} y={0} textAnchor="middle" fill="#666" fontSize={12}>
            {String(val)}
          </text>
        </g>
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="header-actions">
          <button className="header-btn" onClick={() => navigate('/create')}>Add Expense</button>
          <button className="header-btn" onClick={() => navigate('/history')}>History</button>
          <button className="header-btn logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="expenses-summary">
        <div className="expense-box income-box">
          <div className="box-header">
            Total Income <button className="edit-btn" onClick={() => setShowIncomeModal(true)}>✎ Edit</button>
          </div>
          ₹{income}
        </div>
        <div className="expense-box">
          Total Expenses<br />₹{total}
        </div>
        <div className="expense-box monthly">
          This Month's Expenses<br />₹{monthTotal}
        </div>
        <div className={`expense-box remaining ${remainingBalance >= 0 ? 'positive' : 'negative'}`}>
          Remaining Balance<br />₹{remainingBalance}
        </div>
      </div>

      <div className="charts-wrapper">
        {/* Category-wise Pie Chart */}
        <div className="chart-box">
          <h4>Category-wise Expenses</h4>
          {categoryData.length > 0 ? (
            <PieChart width={300} height={300}>
              <Pie
                data={categoryData}
                dataKey="total"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
              >
                {categoryData.map(entry => (
                  <Cell key={entry._id} fill={categoryColorMap[entry._id]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${value}`, 'Total']} />
            </PieChart>
          ) : (
            <p className="no-data">No data available</p>
          )}
          <ul className="category-list">
            {categoryData.map(entry => (
              <li key={entry._id} style={{ color: categoryColorMap[entry._id] }}>
                {entry._id}: ₹{entry.total}
              </li>
            ))}
          </ul>
        </div>

        {/* Present Month Pie Chart */}
        <div className="chart-box">
          <h4>This Month's Expenses</h4>
          {presentMonthData.length > 0 ? (
            <PieChart width={300} height={300}>
              <Pie
                data={presentMonthData}
                dataKey="total"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
              >
                {presentMonthData.map(entry => (
                  <Cell key={entry._id} fill={categoryColorMap[entry._id]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${value}`, 'Total']} />
            </PieChart>
          ) : (
            <p className="no-data">No data available</p>
          )}
          <ul className="category-list">
            {presentMonthData.map(entry => (
              <li key={entry._id} style={{ color: categoryColorMap[entry._id] }}>
                {entry._id}: ₹{entry.total}
              </li>
            ))}
          </ul>
        </div>

        {/* Monthly Bar Chart */}
        <div className="bar-chart-container">
          {fullMonthlyData.length > 0 ? (
            <div className="bar-chart-scroll-wrapper">
              <BarChart
                data={fullMonthlyData}
                width={fullMonthlyData.length * 90}
                height={350}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="monthYear"
                  tick={renderCustomizedTick}
                  interval={0}
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalAmount" fill="#8884d8" barSize={35} />
              </BarChart>
            </div>
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>
      </div>

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="modal-overlay" onClick={() => setShowIncomeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Set Your Income</h3>
            {error && <p className="error-msg">{error}</p>}
            <input
              type="number"
              value={incomeInput}
              onChange={(e) => setIncomeInput(e.target.value)}
              placeholder="Enter your monthly income"
              className="income-input"
              min="0"
            />
            <div className="modal-buttons">
              <button className="btn-save" onClick={handleSaveIncome}>Save</button>
              <button className="btn-cancel" onClick={() => setShowIncomeModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
