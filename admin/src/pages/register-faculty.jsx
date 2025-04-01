import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './register-faculty.css';

const API_URL = 'http://localhost:5000/api/admin';

function RegisterFacultyHead() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [facultyData, setFacultyData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFacultyData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Get admin auth from localStorage
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        navigate('/');
        return;
      }
      
      const parsedAuth = JSON.parse(adminAuth);
      
      const response = await axios.post(
        `${API_URL}/faculty-head/register`, 
        facultyData,
        {
          headers: {
            Authorization: `Bearer ${btoa(JSON.stringify({
              isAdmin: parsedAuth.isAdmin,
              email: parsedAuth.email
            }))}`
          }
        }
      );
      
      setMessage({
        text: 'Faculty head registered successfully!',
        type: 'success'
      });
      
      // Reset form
      setFacultyData({
        name: '',
        email: '',
        password: '',
        phone: ''
      });
      
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Registration failed. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="register-page">
      <header className="page-header">
        <h1>Register Faculty Head</h1>
        <button className="back-button" onClick={handleCancel}>Back to Dashboard</button>
      </header>
      
      <div className="register-content">
        <div className="register-card">
          <div className="card-header">
            <h2>Create Faculty Head Account</h2>
            <p>Register a new faculty head with administrative access</p>
          </div>
          
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                placeholder="Dr. John Doe"
                value={facultyData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="faculty@iiitg.ac.in"
                value={facultyData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <small className="form-text">Must be an IIITG email address</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={facultyData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <small className="form-text">Minimum 8 characters</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                placeholder="9876543210"
                value={facultyData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register Faculty Head'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterFacultyHead;