import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/SkillGap.css';

export default function SkillGap() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const careerPath = state?.careerPath || 'Software Engineer'; // Fallback role if state is empty

  const [gapData, setGapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'acquired' | 'missing'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGap = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const res = await api.post(
        'api/skills/gap',
        { careerPath },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGapData(res.data.gapData || []);
    } catch (err) {
      console.error('Failed to load skill gap data:', err);
      setError('Unable to load skill gap analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (careerPath) {
      fetchGap();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [careerPath]);

  // Derived metrics
  const totalSkills = gapData.length;
  const acquiredCount = useMemo(() => gapData.filter((s) => s.hasSkill).length, [gapData]);
  const missingCount = totalSkills - acquiredCount;
  const matchPercentage = totalSkills > 0 ? Math.round((acquiredCount / totalSkills) * 100) : 0;

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return gapData
      .filter((s) => {
        if (activeFilter === 'acquired') return s.hasSkill;
        if (activeFilter === 'missing') return !s.hasSkill;
        return true;
      })
      .filter((s) => s.skill.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [gapData, activeFilter, searchTerm]);

  return (
    <div className="skillgap-wrapper">
      <div className="skillgap-container">
        
        {/* Top Header */}
        <header className="skillgap-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)} title="Go back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <div>
              <div className="badge-target">Target Career Profile</div>
              <h1 className="role-title">{careerPath}</h1>
            </div>
          </div>

          <div className="header-right">
            <button className="refresh-btn" onClick={fetchGap} disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>Refresh Analysis</span>
            </button>
          </div>
        </header>

        {/* Analytics Summary Cards */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper match-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Role Readiness</span>
              <div className="stat-value-group">
                <span className="stat-value">{matchPercentage}%</span>
                <span className="stat-sub">Fit Score</span>
              </div>
            </div>
            <div className="stat-progress-bar">
              <div
                className="stat-progress-fill"
                style={{
                  width: `${matchPercentage}%`,
                  backgroundColor: matchPercentage >= 70 ? '#10b981' : matchPercentage >= 40 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper acquired-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Skills Acquired</span>
              <div className="stat-value-group">
                <span className="stat-value">{acquiredCount}</span>
                <span className="stat-sub">of {totalSkills} skills</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper missing-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Skill Gap</span>
              <div className="stat-value-group">
                <span className="stat-value">{missingCount}</span>
                <span className="stat-sub">to learn</span>
              </div>
            </div>
          </div>
        </section>

        {/* Toolbar: Search & Category Filters */}
        <div className="dashboard-toolbar">
          <div className="filter-tabs">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Skills <span className="pill-count">{totalSkills}</span>
            </button>
            <button
              className={`filter-btn ${activeFilter === 'acquired' ? 'active' : ''}`}
              onClick={() => setActiveFilter('acquired')}
            >
              Acquired <span className="pill-count success">{acquiredCount}</span>
            </button>
            <button
              className={`filter-btn ${activeFilter === 'missing' ? 'active' : ''}`}
              onClick={() => setActiveFilter('missing')}
            >
              To Learn <span className="pill-count warning">{missingCount}</span>
            </button>
          </div>

          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search skill (e.g. React, SQL)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="skeleton-container">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="skeleton-row">
                <div className="skeleton-avatar" />
                <div className="skeleton-text" />
                <div className="skeleton-bar" />
                <div className="skeleton-badge" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="error-card">
            <p>{error}</p>
            <button onClick={fetchGap} className="retry-btn">Retry</button>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="empty-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3>No skills found</h3>
            <p>Try searching for another keyword or change your filter.</p>
          </div>
        ) : (
          <div className="skills-card-list">
            {filteredSkills.map((s, i) => (
              <div key={i} className={`skill-card ${s.hasSkill ? 'is-have' : 'is-missing'}`}>
                
                {/* Skill Title & Icon */}
                <div className="skill-identity">
                  <div className={`status-icon-badge ${s.hasSkill ? 'acquired' : 'missing'}`}>
                    {s.hasSkill ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </div>
                  <div className="skill-meta">
                    <span className="skill-name">{s.skill}</span>
                    <span className="skill-type">{s.category || 'Required Competency'}</span>
                  </div>
                </div>

                {/* Progress Bar & Level */}
                <div className="skill-progress-section">
                  <div className="progress-label-row">
                    <span className="progress-caption">Mastery Indicator</span>
                    <span className="progress-val">{s.hasSkill ? '100%' : 'Gap (0-20%)'}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className={`bar-indicator ${s.hasSkill ? 'fill-acquired' : 'fill-missing'}`}
                      style={{ width: s.hasSkill ? '100%' : '20%' }}
                    />
                  </div>
                </div>

                {/* Action / Tag Badge */}
                <div className="skill-badge-wrapper">
                  {s.hasSkill ? (
                    <span className="badge-status-acquired">Acquired</span>
                  ) : (
                    <span className="badge-status-missing">Needs Upskilling</span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}