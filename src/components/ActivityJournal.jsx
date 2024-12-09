import React, { useState, useEffect } from 'react';
import './ActivityJournal.css';
import SatisfactionAnalysis from './SatisfactionAnalysis';
import generateFakeActivities from '../utils/generateFakeData';

const categories = [
  'Work',
  'Exercise',
  'Study',
  'Leisure',
  'Social',
  'Self-care',
  'Other'
];

const durations = [
  '15 minutes',
  '30 minutes',
  '1 hour',
  '2 hours',
  '45 minutes',
  '1.5 hours',
  '20 minutes'
];

const CATEGORY_CONFIG = {
  Work: { icon: '💼', color: '#e3f2fd' },
  Exercise: { icon: '🏃‍♂️', color: '#e8f5e9' },
  Study: { icon: '📚', color: '#fff3e0' },
  Leisure: { icon: '🎮', color: '#f3e5f5' },
  Social: { icon: '👥', color: '#e8eaf6' },
  'Self-care': { icon: '🧘‍♂️', color: '#e0f2f1' },
  Other: { icon: '⭐', color: '#fafafa' }
};

const ActivityJournal = () => {
  // Initialize with fake data or load from localStorage
  const [activities, setActivities] = useState(() => {
    const savedActivities = localStorage.getItem('activities');
    if (savedActivities) {
      const parsedActivities = JSON.parse(savedActivities);
      // Check if we have enough historical data (at least 1 year)
      const oldestActivity = parsedActivities.length > 0 ? 
        new Date(parsedActivities[parsedActivities.length - 1].timestamp) : new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (oldestActivity > oneYearAgo || parsedActivities.length < 100) {
        // Not enough historical data, generate fake data
        console.log("Generating fake historical data...");
        const fakeActivities = generateFakeActivities();
        localStorage.setItem('activities', JSON.stringify(fakeActivities));
        return fakeActivities;
      }
      return parsedActivities;
    }
    // No saved activities, generate fake data
    console.log("No saved activities, generating fake data...");
    const fakeActivities = generateFakeActivities();
    localStorage.setItem('activities', JSON.stringify(fakeActivities));
    return fakeActivities;
  });

  const [newActivity, setNewActivity] = useState({
    title: '',
    category: '',
    duration: '',
    description: '',
    satisfaction: 0
  });

  const [showExtended, setShowExtended] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSatisfactionChange = (value) => {
    setNewActivity(prev => ({
      ...prev,
      satisfaction: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newActivity.title || !newActivity.category) return;

    const activity = {
      ...newActivity,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };

    setActivities(prev => [activity, ...prev]);
    setNewActivity({
      title: '',
      category: '',
      duration: '',
      description: '',
      satisfaction: 0
    });
  };

  const handleDelete = (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
    }
  };

  const renderSatisfactionStars = (satisfaction) => {
    return '⭐'.repeat(satisfaction) + '☆'.repeat(5 - satisfaction);
  };

  // Sort activities by timestamp in descending order
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const getTimelineActivities = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      const hourActivities = activities.filter(activity => {
        const activityHour = new Date(activity.timestamp).getHours();
        return activityHour === hour;
      });
      return { hour, activities: hourActivities };
    });
  };

  return (
    <div className="activity-journal">
      <div className="header-actions">
        <h2>Activity Journal</h2>
        <div className="action-buttons">
          <button
            className="extend-button"
            onClick={() => setShowExtended(!showExtended)}
          >
            {showExtended ? 'Simple View' : 'Extend View'}
          </button>
          {showExtended && (
            <button
              className="analysis-button"
              onClick={() => setShowAnalysis(!showAnalysis)}
            >
              {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="activity-form">
        <div className="form-row">
          <input
            type="text"
            name="title"
            value={newActivity.title}
            onChange={handleInputChange}
            placeholder="Activity Title"
            className="form-input"
          />
          <select
            name="category"
            value={newActivity.category}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <select
            name="duration"
            value={newActivity.duration}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="">Select Duration</option>
            {durations.map(duration => (
              <option key={duration} value={duration}>{duration}</option>
            ))}
          </select>
          <div className="satisfaction-input">
            <span>Satisfaction: </span>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleSatisfactionChange(star)}
                  className={`star-button ${newActivity.satisfaction >= star ? 'active' : ''}`}
                >
                  {newActivity.satisfaction >= star ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <textarea
          name="description"
          value={newActivity.description}
          onChange={handleInputChange}
          placeholder="Activity Description (optional)"
          className="form-textarea"
        />
        <button type="submit" className="submit-button">Add Activity</button>
      </form>

      {showExtended && (
        <div className="extended-features">
          <button
            className="timeline-toggle"
            onClick={() => setShowTimeline(!showTimeline)}
          >
            {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
          </button>
          
          {showTimeline && (
            <div className="daily-timeline">
              <h3>Daily Timeline</h3>
              <div className="timeline-grid">
                {getTimelineActivities().map(({ hour, activities: hourActivities }) => (
                  <div key={hour} className="timeline-hour">
                    <div className="hour-label">{`${hour}:00`}</div>
                    <div className="hour-activities">
                      {hourActivities.map(activity => {
                        const config = CATEGORY_CONFIG[activity.category] || CATEGORY_CONFIG.Other;
                        return (
                          <div
                            key={activity.id}
                            className="timeline-activity"
                            style={{ backgroundColor: config.color }}
                            title={`${activity.title} (Satisfaction: ${activity.satisfaction}/5)`}
                          >
                            <span>{config.icon}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showAnalysis && (
            <SatisfactionAnalysis activities={activities} />
          )}
        </div>
      )}

      <div className="activity-timeline">
        <h3>Activity Timeline</h3>
        <div className="timeline-entries">
          {sortedActivities.map((activity) => (
            <div key={activity.id} className={`activity-entry category-${activity.category.toLowerCase()}`}>
              <div className="activity-header">
                <h4>{activity.title}</h4>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="delete-button"
                  title="Delete activity"
                >
                  ×
                </button>
              </div>
              <div className="activity-details">
                <span className="activity-category">{activity.category}</span>
                <span className="activity-duration">{activity.duration}</span>
                <div className="activity-satisfaction">
                  {renderSatisfactionStars(activity.satisfaction)}
                </div>
              </div>
              {activity.description && (
                <p className="activity-description">{activity.description}</p>
              )}
              <div className="activity-timestamp">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityJournal;
