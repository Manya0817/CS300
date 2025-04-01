import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import RegisterFaculty from './pages/register-faculty';
import RegisterStudent from './pages/register-student';
import UploadTimetable from './pages/uploadTimetable';
import UploadExam from './pages/UploadExam';
import ManageTimetables from './pages/ManageTimetables';
import ManageExams from './pages/ManageExams';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);
  
  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };
  
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/register-faculty" 
          element={isAuthenticated ? <RegisterFaculty /> : <Navigate to="/" />} 
        />
        <Route 
          path="/register-student" 
          element={isAuthenticated ? <RegisterStudent /> : <Navigate to="/" />} 
        />
        <Route 
          path="/upload-timetable" 
          element={isAuthenticated ? <UploadTimetable /> : <Navigate to="/" />} 
        />
        <Route 
          path="/upload-exam" 
          element={isAuthenticated ? <UploadExam /> : <Navigate to="/" />} 
        />
        <Route 
          path="/manage-timetables" 
          element={isAuthenticated ? <ManageTimetables /> : <Navigate to="/" />} 
        />
        <Route 
          path="/manage-exams" 
          element={isAuthenticated ? <ManageExams /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;