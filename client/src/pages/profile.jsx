import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import '../css/profile.css';

export default function Profile() {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name || !studentClass || !description || !skills) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/api/student/profile', {
        name,
        class: studentClass,
        description,
        skills: skills.split(',').map(s => s.trim())
      });
      navigate('/career-suggestion', { state: { description, studentClass, skills } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      console.log(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Create Your Profile</h2>
          <p className="subtitle">Tell us about yourself to get personalized career suggestions</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="class">Class/Grade</label>
            <input
              id="class"
              type="text"
              placeholder="e.g., 10th Grade"
              value={studentClass}
              onChange={e => setStudentClass(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">About Yourself</label>
            <textarea
              id="description"
              placeholder="Describe your interests, hobbies, and what you enjoy doing..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <input
              id="skills"
              type="text"
              placeholder="e.g., Programming, Drawing, Public Speaking (comma separated)"
              value={skills}
              onChange={e => setSkills(e.target.value)}
            />
            <small className="hint">Separate multiple skills with commas</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Get Career Suggestions'}
          </button>
        </form>
      </div>
    </div>
  );
}