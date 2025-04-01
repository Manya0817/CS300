import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UploadExam.css';

function UploadExam() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [examType, setExamType] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generate batch year options
  const currentYear = new Date().getFullYear();
  const batchYears = Array.from({ length: 6 }, (_, i) => currentYear - i);

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

    if (!examType) {
      setError('Please select an exam type');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('examType', examType);
    formData.append('batchYear', batchYear || 'All');

    try {
      const response = await axios.post('http://localhost:5000/api/exams/upload-exam', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Response Data:', response.data);

      setSuccess(response.data.message || 'File uploaded successfully');
      setFile(null);
      setExamType('');
      setBatchYear('');
      document.getElementById('fileInput').value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="page-header">
        <h1>Upload Exam Schedule</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      <div className="upload-form-container">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="examType">Exam Type</label>
            <select id="examType" value={examType} onChange={(e) => setExamType(e.target.value)} className="form-control" required>
              <option value="">Select Exam Type</option>
              <option value="MidSemester">Mid-Semester Exam</option>
              <option value="EndSemester">End-Semester Exam</option>
              <option value="Other">Other Exams</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="batchYear">Batch Year (Optional)</label>
            <select id="batchYear" value={batchYear} onChange={(e) => setBatchYear(e.target.value)} className="form-control">
              <option value="">All Batches</option>
              {batchYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fileInput">Exam Schedule PDF (Max 10MB)</label>
            <input type="file" id="fileInput" accept="application/pdf" onChange={handleFileChange} className="form-control" required />
            {file && <p className="file-name">Selected: {file.name}</p>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Exam Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadExam;
