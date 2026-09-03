import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import '../css/profile.css';
import DigestScheduler from './DigestScheduler';
import DigestButton from './digestButton';

const SUGGESTED_SKILLS = [
  'Programming', 'UI/UX Design', 'Data Analysis', 
  'Public Speaking', 'Mathematics', 'Creative Writing', 'Robotics'
];

export default function Profile() {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [description, setDescription] = useState('');
  const [skillsList, setSkillsList] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState('');
  const navigate = useNavigate();

  const uploadResume = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const token = localStorage.getItem('token');

    const res = await api.post('/api/resume/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setParsing(true);
    setError('');

    try {
      const data = await uploadResume(file);
      const extracted = data.extracted || data.user || {};

      if (extracted.name) setName(extracted.name);

      if (extracted.skills?.length) {
        setSkillsList((prev) => [
          ...prev,
          ...extracted.skills.filter((s) => !prev.includes(s)),
        ]);
      }

      const extraLines = [
        ...(extracted.education || []),
        ...(extracted.experience || []),
      ];
      if (extraLines.length) {
        setDescription((prev) => (prev ? prev + '\n' : '') + extraLines.join('\n'));
      }
    } catch (err) {
      console.error(err);
      setError('Could not parse resume. Please fill out details manually.');
    } finally {
      setParsing(false);
    }
  };

  const addSkill = (skill) => {
    const parts = skill.split(',').map((s) => s.trim()).filter(Boolean);
    const newSkills = parts.filter((s) => !skillsList.includes(s));
    if (newSkills.length > 0) {
      setSkillsList([...skillsList, ...newSkills]);
      setSkillInput('');
    }
  };

  const removeSkill = (indexToRemove) => {
    setSkillsList(skillsList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (skillInput.trim()) {
        addSkill(skillInput);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !studentClass.trim() || !description.trim() || skillsList.length === 0) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      await api.post(
        '/api/student/profile',
        {
          name: name.trim(),
          class: studentClass.trim(),
          description: description.trim(),
          skills: skillsList,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate('/career-suggestion', {
        state: { description, studentClass, skills: skillsList },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        
        {/* Main Profile Card */}
        <div className="profile-card">
          <div className="profile-header">
            <h2>Student Profile</h2>
            <p>Fill in your background to get personalized career recommendations.</p>
          </div>

          {/* Resume Upload Box */}
          <div className="resume-box">
            <div className="resume-info">
              <label htmlFor="resume-file" className="resume-title">
                Autofill with Resume (PDF)
              </label>
              <span className="resume-subtitle">Upload your resume to pre-fill the form automatically.</span>
            </div>
            <div className="resume-input-wrapper">
              <input
                id="resume-file"
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                disabled={parsing}
              />
              {parsing && <span className="status-text loading">Parsing resume...</span>}
              {!parsing && fileName && (
                <span className="status-text success">Uploaded: {fileName}</span>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* Profile Form */}
          <form className="profile-form" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="name">
                Full Name <span className="req">*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Class / Grade */}
            <div className="form-group">
              <label htmlFor="class">
                Class / Grade / Major <span className="req">*</span>
              </label>
              <input
                id="class"
                type="text"
                placeholder="e.g. 12th Grade, B.Tech 2nd Year, BCA"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="description">
                  About Yourself <span className="req">*</span>
                </label>
                <span className="char-count">{description.length} chars</span>
              </div>
              <textarea
                id="description"
                rows="4"
                placeholder="Tell us about your interests, favorite subjects, projects, or hobbies..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Skills */}
            <div className="form-group">
              <label htmlFor="skills">
                Skills & Strengths <span className="req">*</span>
              </label>

              <div className="skills-input-area">
                {skillsList.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => removeSkill(index)}
                      aria-label={`Remove ${skill}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  id="skills"
                  type="text"
                  placeholder={skillsList.length === 0 ? "Type skill & press Enter or comma..." : "Add another skill..."}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={() => skillInput.trim() && addSkill(skillInput)}
                />
              </div>

              {/* Suggestions */}
              <div className="suggestions">
                <span className="suggestions-label">Suggestions:</span>
                <div className="suggestions-list">
                  {SUGGESTED_SKILLS.filter((s) => !skillsList.includes(s)).map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      className="suggest-btn"
                      onClick={() => addSkill(skill)}
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving Profile...' : 'Get Career Suggestions →'}
            </button>
          </form>
        </div>

        {/* Weekly Digest Section (Clean companion card) */}
        <div className="digest-card">
          <div className="digest-header">
            <h3>Weekly Career Digest</h3>
            <p>Schedule or trigger updates to receive curated career insights directly.</p>
          </div>
          <div className="digest-controls">
            <DigestScheduler />
            <DigestButton />
          </div>
        </div>

      </div>
    </div>
  );
}