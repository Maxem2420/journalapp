import React, { useState, useEffect } from 'react';
import './MoodTracker.css';

const moods = [
  { emoji: '😄', label: 'Very Happy', value: 5 },
  { emoji: '🙂', label: 'Happy', value: 4 },
  { emoji: '😐', label: 'Neutral', value: 3 },
  { emoji: '😕', label: 'Sad', value: 2 },
  { emoji: '😢', label: 'Very Sad', value: 1 }
];

const MoodTracker = () => {
  const [moodEntries, setMoodEntries] = useState(() => {
    const saved = localStorage.getItem('moodEntries');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [note, setNote] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);

  useEffect(() => {
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
  }, [moodEntries]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMood) return;

    const newEntry = {
      id: Date.now(),
      mood: selectedMood,
      note,
      timestamp: new Date().toISOString()
    };

    setMoodEntries(prev => [newEntry, ...prev]);
    setNote('');
    setSelectedMood(null);
  };

  const getMoodStats = () => {
    if (moodEntries.length === 0) return null;

    const total = moodEntries.reduce((sum, entry) => sum + entry.mood.value, 0);
    const average = total / moodEntries.length;
    const mostFrequent = moods.reduce((prev, current) => {
      const prevCount = moodEntries.filter(entry => entry.mood.value === prev.value).length;
      const currentCount = moodEntries.filter(entry => entry.mood.value === current.value).length;
      return currentCount > prevCount ? current : prev;
    });

    return {
      average: average.toFixed(1),
      mostFrequent
    };
  };

  const stats = getMoodStats();

  return (
    <div className="mood-tracker">
      <div className="mood-input-section">
        <h2>How are you feeling?</h2>
        <div className="mood-selector">
          {moods.map((mood) => (
            <button
              key={mood.value}
              className={`mood-button ${selectedMood === mood ? 'selected' : ''}`}
              onClick={() => handleMoodSelect(mood)}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mood-form">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about your mood (optional)"
            className="mood-note"
          />
          <button type="submit" className="submit-button" disabled={!selectedMood}>
            Save Mood
          </button>
        </form>
      </div>

      {stats && (
        <div className="mood-stats">
          <h3>Mood Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Average Mood</h4>
              <p>{stats.average} / 5</p>
            </div>
            <div className="stat-card">
              <h4>Most Frequent Mood</h4>
              <p>{stats.mostFrequent.emoji} {stats.mostFrequent.label}</p>
            </div>
            <div className="stat-card">
              <h4>Total Entries</h4>
              <p>{moodEntries.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mood-history">
        <h3>Mood History</h3>
        <div className="entries-list">
          {moodEntries.map((entry) => (
            <div key={entry.id} className="mood-entry">
              <div className="entry-header">
                <span className="entry-mood">{entry.mood.emoji}</span>
                <span className="entry-timestamp">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              {entry.note && <p className="entry-note">{entry.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
