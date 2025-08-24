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

  const token = localStorage.getItem('auth-token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API_URL}/totalamount`, { headers })
      .then(res => res.json())
      .then(data => setTotal(data.Totalamount));

    fetch(`${API_URL}/monthtotal`, { headers })
      .then(res => res.json())
      .then(data => setMonthTotal(data.MonthExpence));

    fetch(`${API_URL}/category`, { headers })
      .then(res => res.json())
      .then(data => setCategoryData(data.data));

    fetch(`${API_URL}/presentmonth`, { headers })
      .then(res => res.json())
      .then(data => setPresentMonthData(data.data));

    fetch(`${API_URL}/monthlyexpences`, { headers })
      .then(res => res.json())
      .then(data => setMonthlyData(data.data));
  }, []);

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
        <div className="expense-box">
          Total Expenses<br />₹{total}
        </div>
        <div className="expense-box monthly">
          This Month's Expenses<br />₹{monthTotal}
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
    </div>
  );
};

export default Dashboard;
