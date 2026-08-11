import React, { useEffect, useState } from 'react';
import api from '../api';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/careerSuggestion.css';

export default function CareerSuggestion() {
  const { state } = useLocation();
  const { description, studentClass, skills } = state || {};
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCareer = async () => {
      const res = await api.post('api/career/suggest', { 
        description, 
        studentClass, 
        skills 
      });

      setSuggestions(res.data.careerSuggestions);
      setLoading(false);
    };

    if (description || skills || studentClass) {
      fetchCareer();
    }
  }, [description, studentClass, skills]); // ✅ FIXED

  return (
    <div className="suggestion-container">
      <div className="suggestion-header">
        <h2>Career Suggestions</h2>
        <p className="subtitle">Based on your interests and skills</p>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="suggestions-grid">
          {suggestions.map((career, i) => (
            <button 
              key={i} 
              className="suggestion-card"
              onClick={() => navigate('/chat', { state: { careerPath: career } })}
            >
              <span className="career-icon">💼</span>
              <span className="career-name">{career}</span>
              <span className="arrow">→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}