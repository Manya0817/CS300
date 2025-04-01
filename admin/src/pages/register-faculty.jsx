import React, { useState } from 'react';
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
    setFacultyData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    // Basic validation
    if (!facultyData.name || !facultyData.email || !facultyData.password) {
      setMessage({
        text: 'Please fill in all required fields',
        type: 'error'
      });
      setLoading(false);
      return;
    }
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setMessage({
          text: 'Authentication error. Please log in again.',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/faculty-head/register`, 
        facultyData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        setMessage({
          text: 'Faculty Head registered successfully!',
          type: 'success'
        });
        
        // Reset form
        setFacultyData({
          name: '',
          email: '',
          password: '',
          phone: ''
        });
        
        // Navigate after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({
        text: error.response?.data?.message || error.message || 'Failed to register faculty head',
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
      <div className="register-container">
        <h1>Register Faculty Head</h1>
        
        {message.text && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={facultyData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={facultyData.email}
              onChange={handleChange}
              placeholder="username@iiitg.ac.in"
              required
              disabled={loading}
            />
            <small>Must be an IIITG email address</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={facultyData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <small>Minimum 6 characters</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={facultyData.phone}
              onChange={handleChange}
              placeholder="10-digit number (optional)"
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
  );
}

export default RegisterFacultyHead;