import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './uploadTimetable.css';

function UploadTimetable() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingExisting, setCheckingExisting] = useState(false);
  
  // Check for existing timetable when semester changes
  useEffect(() => {
    const checkExistingTimetable = async () => {
      if (!semester) return;
      
      setCheckingExisting(true);
      try {
        const response = await axios.get('http://localhost:5000/api/timetable/check', {
          params: { semester }
        });
        
        if (response.data.exists) {
          setError(`A timetable already exists for Semester ${semester}. Please delete the existing one first.`);
        } else {
          setError('');
        }
      } catch (err) {
        console.error("Error checking existing timetables:", err);
      } finally {
        setCheckingExisting(false);
      }
    };

    if (semester) {
      checkExistingTimetable();
    }
  }, [semester]);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    if (!semester || isNaN(semester) || semester < 1 || semester > 8) {
      setError('Please select a valid semester (1-8)');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('semester', semester);
    
    try {
      const response = await axios.post('http://localhost:5000/api/timetable/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Response:', response.data);
      
      setSuccess(`Timetable for semester ${semester} uploaded successfully`);
      setFile(null);
      setSemester('');
      document.getElementById('fileInput').value = '';
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response?.status === 409) {
        setError('A timetable already exists for this semester. Please delete the existing one first.');
      } else {
        setError(error.response?.data?.message || 'Failed to upload timetable');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="upload-page">
      <div className="page-header">
        <h1>Upload Class Timetable</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/manage-timetables')}>
            Manage Timetables
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
      
      <div className="upload-form-container">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="semester">Semester</label>
            <select 
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>Semester {num}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="fileInput">Timetable PDF (Max 10MB)</label>
            <input
              type="file"
              id="fileInput"
              accept="application/pdf"
              onChange={handleFileChange}
              className="form-control"
              required
            />
            {file && (
              <div className="file-info">
                <p className="file-name">Selected: {file.name}</p>
                <p className="file-size">Size: {(file.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || checkingExisting || error.includes('already exists')}
            >
              {loading ? (
                <span>
                  <span className="spinner"></span>
                  Uploading...
                </span>
              ) : checkingExisting ? (
                <span>Checking...</span>
              ) : (
                'Upload Timetable'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadTimetable;