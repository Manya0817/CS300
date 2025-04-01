import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManageExams.css';

function ManageExams() {
  const navigate = useNavigate();
  const [examSchedules, setExamSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  useEffect(() => {
    fetchExamSchedules();
  }, []);
  
  const fetchExamSchedules = async () => {
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
      
      const response = await axios.get('http://localhost:5000/api/exams/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setExamSchedules(response.data.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      
      setError(
        error.response?.data?.message || 
        'Failed to fetch exam schedules. Please try again.'
      );
      setExamSchedules([]); // Set to empty array if there's an error
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id, examType) => {
    try {
      // Get token from local storage
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Authentication error. Please log in again.');
        return;
      }
      
      await axios.delete(`http://localhost:5000/api/exams/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove the deleted item from state
      setExamSchedules(examSchedules.filter(schedule => schedule._id !== id));
      
      setSuccess(`${getReadableExamType(examType)} schedule deleted successfully`);
      setConfirmDelete(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Delete error:', error);
      
      setError(
        error.response?.data?.message || 
        'Failed to delete exam schedule. Please try again.'
      );
    }
  };
  
  // Helper function to get a readable exam type name
  const getReadableExamType = (examType) => {
    switch(examType) {
      case 'MidSemester':
        return 'Mid-Semester Exam';
      case 'EndSemester':
        return 'End-Semester Exam';
      case 'Other':
        return 'Other Exam';
      default:
        return examType;
    }
  };
  
  return (
    <div className="manage-page">
      <div className="page-header">
        <h1>Manage Exam Schedules</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/upload-exam')}
          >
            Upload New Exam Schedule
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
        <div className="loading">Loading exam schedules...</div>
      ) : examSchedules.length === 0 ? (
        <div className="no-data">
          <p>No exam schedules found. Upload an exam schedule first.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/upload-exam')}
          >
            Upload Exam Schedule
          </button>
        </div>
      ) : (
        <div className="files-table-container">
          <table className="files-table">
            <thead>
              <tr>
                <th>Exam Type</th>
                <th>Batch Year</th>
                <th>File Name</th>
                <th>Uploaded On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {examSchedules.map((schedule) => (
                <tr key={schedule._id}>
                  <td>{getReadableExamType(schedule.examType)}</td>
                  <td>{schedule.batchYear || 'All Batches'}</td>
                  <td>
                    <a 
                      href={schedule.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {schedule.originalFilename || 'View File'}
                    </a>
                  </td>
                  <td>
                    {new Date(schedule.uploadedAt).toLocaleDateString()}
                  </td>
                  <td>
                    {confirmDelete === schedule._id ? (
                      <div className="confirm-delete">
                        <span>Are you sure?</span>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(schedule._id, schedule.examType)}
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
                        onClick={() => setConfirmDelete(schedule._id)}
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

export default ManageExams;