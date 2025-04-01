import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManageTimetables.css';

function ManageTimetables() {
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  useEffect(() => {
    fetchTimetables();
  }, []);
  
  const fetchTimetables = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get token from local storage
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/timetable/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setTimetables(response.data.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      
      setError(
        error.response?.data?.message || 
        'Failed to fetch timetables. Please try again.'
      );
      setTimetables([]); // Set to empty array if there's an error
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id, semester) => {
    try {
      // Get token from local storage
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Authentication error. Please log in again.');
        return;
      }
      
      await axios.delete(`http://localhost:5000/api/timetable/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove the deleted item from state
      setTimetables(timetables.filter(timetable => timetable._id !== id));
      
      setSuccess(`Timetable for semester ${semester} deleted successfully`);
      setConfirmDelete(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Delete error:', error);
      
      setError(
        error.response?.data?.message || 
        'Failed to delete timetable. Please try again.'
      );
    }
  };
  
  return (
    <div className="manage-page">
      <div className="page-header">
        <h1>Manage Class Timetables</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/upload-timetable')}
          >
            Upload New Timetable
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      {loading ? (
        <div className="loading">Loading timetables...</div>
      ) : timetables.length === 0 ? (
        <div className="no-data">
          <p>No timetables found. Upload a timetable first.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/upload-timetable')}
          >
            Upload Timetable
          </button>
        </div>
      ) : (
        <div className="files-table-container">
          <table className="files-table">
            <thead>
              <tr>
                <th>Semester</th>
                <th>File Name</th>
                <th>Uploaded On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {timetables.map((timetable) => (
                <tr key={timetable._id}>
                  <td>Semester {timetable.semester}</td>
                  <td>
                    <a 
                      href={timetable.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {timetable.originalFilename || 'View File'}
                    </a>
                  </td>
                  <td>
                    {new Date(timetable.uploadedAt).toLocaleDateString()}
                  </td>
                  <td>
                    {confirmDelete === timetable._id ? (
                      <div className="confirm-delete">
                        <span>Are you sure?</span>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(timetable._id, timetable.semester)}
                        >
                          Yes
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setConfirmDelete(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => setConfirmDelete(timetable._id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageTimetables;