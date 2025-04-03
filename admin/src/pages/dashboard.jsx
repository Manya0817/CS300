import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaUserGraduate, FaCalendarAlt, FaClipboardList, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import { MdUpload, MdManageAccounts } from 'react-icons/md';
import './dashboard.css'; // Create this CSS file with the styles

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
    
    // Format current time
    const formatTime = () => {
      const now = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      setCurrentTime(now.toLocaleDateString('en-US', options));
    };
    
    formatTime();
    const timer = setInterval(formatTime, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Card data for dashboard
  const cards = [
    {
      id: 1,
      title: 'Register Faculty Head',
      description: 'Create new faculty head accounts',
      icon: <FaUserTie size={28} />,
      path: '/register-faculty',
      buttonText: 'Add New',
      color: '#4CAF50',
    },
    {
      id: 2,
      title: 'Register Student Head',
      description: 'Create new student head accounts',
      icon: <FaUserGraduate size={28} />,
      path: '/register-student',
      buttonText: 'Add New',
      color: '#2196F3',
    },
    {
      id: 3,
      title: 'Upload Class Timetable',
      description: 'Upload semester-wise class timetables',
      icon: <FaCalendarAlt size={28} />,
      path: '/upload-timetable',
      buttonText: 'Upload',
      color: '#9C27B0',
    },
    {
      id: 4,
      title: 'Upload Exam Schedule',
      description: 'Upload exam schedules for all semesters',
      icon: <FaClipboardList size={28} />,
      path: '/upload-exam',
      buttonText: 'Upload',
      color: '#FF9800',
    },
    {
      id: 5,
      title: 'Manage Class Timetables',
      description: 'View and delete class timetables',
      icon: <FaFileAlt size={28} />,
      path: '/manage-timetables',
      buttonText: 'Manage',
      color: '#E91E63',
    },
    {
      id: 6,
      title: 'Manage Exam Schedules',
      description: 'View and delete exam schedules',
      icon: <MdManageAccounts size={28} />,
      path: '/manage-exams',
      buttonText: 'Manage',
      color: '#673AB7',
    },
    {
      id: 7,
      title: 'View Events Schedule',
      description: 'View events schedules',
      icon: <MdManageAccounts size={28} />,
      path: '/view-events',
      buttonText: 'View',
      color: '#E91E63',
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-circle">EE</div>
            <span className="logo-text">Event Ease</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li className="nav-item active">
              <a href="#" className="nav-link">
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#" onClick={() => handleNavigate('/register-faculty')} className="nav-link">
                <span className="nav-icon"><FaUserTie /></span>
                <span className="nav-text">Faculty</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#" onClick={() => handleNavigate('/register-student')} className="nav-link">
                <span className="nav-icon"><FaUserGraduate /></span>
                <span className="nav-text">Students</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#" onClick={() => handleNavigate('/upload-timetable')} className="nav-link">
                <span className="nav-icon"><FaCalendarAlt /></span>
                <span className="nav-text">Timetables</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#" onClick={() => handleNavigate('/upload-exam')} className="nav-link">
                <span className="nav-icon"><FaClipboardList /></span>
                <span className="nav-text">Exams</span>
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-button" onClick={onLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-welcome">
            <h1>{greeting}, Admin</h1>
            <p className="timestamp">{currentTime}</p>
          </div>
          <div className="header-actions">
            <div className="admin-profile">
              <div className="profile-circle">A</div>
              <div className="profile-info">
                <span className="profile-name">Administrator</span>
                <span className="profile-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>
        
        <div className="dashboard-content">
          <div className="content-header">
            <h2>Administration Dashboard</h2>
            <p>Manage users, timetables, and exam schedules from one place</p>
          </div>
          
          <div className="dashboard-cards">
            {cards.map((card) => (
              <div className="card" key={card.id}>
                <div className="card-icon-wrapper" style={{ backgroundColor: `${card.color}20` }}>
                  <div className="card-icon" style={{ color: card.color }}>
                    {card.icon}
                  </div>
                </div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
                <button 
                  className="card-button"
                  style={{ backgroundColor: card.color }}
                  onClick={() => handleNavigate(card.path)}
                >
                  {card.buttonText}
                  {card.buttonText.includes('Upload') ? <MdUpload className="button-icon" /> : null}
                </button>
              </div>
            ))}
          </div>
          
          <div className="dashboard-footer">
            <p>© {new Date().getFullYear()} Event Ease Admin Portal • IIIT Guwahati</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;