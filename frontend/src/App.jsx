import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Verifyotp from './components/Verifyotp';
import Dashboard from './components/Dashboard';
import Create from './components/Create';
import History from './components/History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/verifyotp" element={<Verifyotp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<Create />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;
