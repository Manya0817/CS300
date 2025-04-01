import { useState } from 'react';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import './login.css';

function Login({ onLogin }) {  // Changed from onLoginSuccess to onLogin to match App.jsx
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (email !== 'admin@iiitg.ac.in') {
      setError('Invalid admin credentials');
      return;
    }

    setLoading(true);
    
    // Simulate API call delay
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@iiitg.ac.in' && password === 'admin@1234') {
        // Generate a token
        const token = 'admin-token-' + Math.random().toString(36).substring(2);
        
        // Call the onLogin prop with the token
        onLogin(token);  // This will set isAuthenticated to true in App.jsx
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      // Removed stray 'c' character
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Admin Login</h2>
          <p>Event Ease Administration Panel</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@iiitg.ac.in"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;