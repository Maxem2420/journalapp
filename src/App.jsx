import React, { useState } from 'react';
import ActivityJournal from './components/ActivityJournal';
import MoodTracker from './components/MoodTracker';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('activity');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Mood & Activity Tracker</h1>
        <p>Track your daily moods and activities to understand their relationships</p>
        <nav className="app-nav">
          <button 
            className={`nav-button ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity Journal
          </button>
          <button 
            className={`nav-button ${activeTab === 'mood' ? 'active' : ''}`}
            onClick={() => setActiveTab('mood')}
          >
            Mood Tracker
          </button>
        </nav>
      </header>
      <main className="app-main">
        {activeTab === 'activity' ? <ActivityJournal /> : <MoodTracker />}
      </main>
    </div>
  );
}

export default App;
