import React, { useEffect, useState, useMemo } from 'react';
import api from '../api';
import '../css/JobTracker.css';

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [minMatch, setMinMatch] = useState('all'); // 'all' | 'high' (>=50%) | 'medium' (>=15%)
  const [sortBy, setSortBy] = useState('match'); // 'match' | 'title' | 'company'

  const fetchJobs = () => {
    setLoading(true);
    setError('');
    api.get('/api/jobs')
      .then((res) => {
        setJobs(res.data.jobs || []);
      })
      .catch((err) => {
        console.error('Job fetch error:', err);
        setError('Failed to fetch matched jobs. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Format currency in Indian Rupees (e.g., ₹5,00,000 / yr)
  const formatSalary = (min, max) => {
    if (!min) return null;
    const formatINR = (val) =>
      Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });

    if (min && max && min !== max) {
      return `₹${formatINR(min)} - ₹${formatINR(max)} / yr`;
    }
    return `₹${formatINR(min)} / yr`;
  };

  // Filter & sort jobs
  const processedJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          (job.title && job.title.toLowerCase().includes(term)) ||
          (job.company && job.company.toLowerCase().includes(term)) ||
          (job.location && job.location.toLowerCase().includes(term));

        if (!matchesSearch) return false;

        const score = job.matchScore ?? 0;
        if (minMatch === 'high') return score >= 50;
        if (minMatch === 'medium') return score >= 15;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') return (b.matchScore ?? 0) - (a.matchScore ?? 0);
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'company') return (a.company || '').localeCompare(b.company || '');
        return 0;
      });
  }, [jobs, searchTerm, minMatch, sortBy]);

  return (
    <div className="job-tracker">
      {/* Header */}
      <div className="tracker-header">
        <div>
          <h2>Matched Opportunities</h2>
          <p>Browse openings curated based on your skills and profile.</p>
        </div>
        <button className="btn-refresh" onClick={fetchJobs} disabled={loading}>
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="tracker-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by role, company, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-selects">
          <select value={minMatch} onChange={(e) => setMinMatch(e.target.value)}>
            <option value="all">All Match Scores</option>
            <option value="high">High Match (≥ 50%)</option>
            <option value="medium">Relevant Match (≥ 15%)</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="match">Sort by: Highest Match</option>
            <option value="title">Sort by: Job Title</option>
            <option value="company">Sort by: Company</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      {!loading && !error && (
        <div className="results-count">
          Showing <strong>{processedJobs.length}</strong> of {jobs.length} jobs
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="tracker-message">Loading opportunities...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="tracker-error">
          <p>{error}</p>
          <button onClick={fetchJobs} className="btn-retry">Try Again</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && processedJobs.length === 0 && (
        <div className="tracker-empty">
          <p>No jobs found matching your criteria.</p>
          {(searchTerm || minMatch !== 'all') && (
            <button
              className="btn-reset"
              onClick={() => {
                setSearchTerm('');
                setMinMatch('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Job Listings */}
      {!loading && !error && processedJobs.length > 0 && (
        <div className="job-list">
          {processedJobs.map((job, i) => {
            const score = job.matchScore ?? 0;
            const isHigh = score >= 50;

            return (
              <div key={job.id || i} className="job-item">
                <div className="job-main">
                  <div className="job-title-row">
                    <h3 className="job-title">{job.title}</h3>
                    {job.matchScore !== null && job.matchScore !== undefined && (
                      <span className={`match-badge ${isHigh ? 'high' : 'normal'}`}>
                        {score}% Match
                      </span>
                    )}
                  </div>

                  <div className="job-meta">
                    <span className="meta-company">{job.company || 'Confidential'}</span>
                    <span className="dot">&bull;</span>
                    <span className="meta-location">{job.location || 'Remote / India'}</span>
                    {job.salary_min && (
                      <>
                        <span className="dot">&bull;</span>
                        <span className="meta-salary">{formatSalary(job.salary_min, job.salary_max)}</span>
                      </>
                    )}
                  </div>
                </div>

                {job.url && (
                  <div className="job-actions">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-apply"
                    >
                      Apply ↗
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}