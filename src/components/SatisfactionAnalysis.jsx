import React, { useState, useMemo } from 'react';
import './SatisfactionAnalysis.css';

const SatisfactionAnalysis = ({ activities }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [...new Set(activities.map(a => a.category))];

  const getTimeRangeStart = (date, range) => {
    const d = new Date(date);
    switch (range) {
      case 'day':
        d.setHours(0, 0, 0, 0);
        return d;
      case 'week':
        d.setDate(d.getDate() - d.getDay());
        d.setHours(0, 0, 0, 0);
        return d;
      case 'month':
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
      default:
        return d;
    }
  };

  const analyzeTimePatterns = (filteredActivities) => {
    const timeSlots = {
      morning: { count: 0, satisfaction: 0, activities: [] },
      afternoon: { count: 0, satisfaction: 0, activities: [] },
      evening: { count: 0, satisfaction: 0, activities: [] },
      night: { count: 0, satisfaction: 0, activities: [] }
    };

    filteredActivities.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      let slot;
      if (hour >= 5 && hour < 12) slot = 'morning';
      else if (hour >= 12 && hour < 17) slot = 'afternoon';
      else if (hour >= 17 && hour < 22) slot = 'evening';
      else slot = 'night';

      timeSlots[slot].count++;
      timeSlots[slot].satisfaction += activity.satisfaction;
      timeSlots[slot].activities.push(activity);
    });

    Object.keys(timeSlots).forEach(slot => {
      timeSlots[slot].avgSatisfaction = 
        timeSlots[slot].count > 0 ? 
        (timeSlots[slot].satisfaction / timeSlots[slot].count).toFixed(2) : 0;
    });

    return timeSlots;
  };

  const analyzeDayOfWeekPatterns = (filteredActivities) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = days.reduce((acc, day) => {
      acc[day] = { count: 0, satisfaction: 0, activities: [] };
      return acc;
    }, {});

    filteredActivities.forEach(activity => {
      const day = days[new Date(activity.timestamp).getDay()];
      dayStats[day].count++;
      dayStats[day].satisfaction += activity.satisfaction;
      dayStats[day].activities.push(activity);
    });

    Object.keys(dayStats).forEach(day => {
      dayStats[day].avgSatisfaction = 
        dayStats[day].count > 0 ? 
        (dayStats[day].satisfaction / dayStats[day].count).toFixed(2) : 0;
    });

    return dayStats;
  };

  const analyzeActivityCombinations = (filteredActivities) => {
    const combinations = {};
    
    // Look at activities on the same day
    const activitiesByDate = filteredActivities.reduce((acc, activity) => {
      const date = new Date(activity.timestamp).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(activity);
      return acc;
    }, {});

    Object.values(activitiesByDate).forEach(dayActivities => {
      if (dayActivities.length < 2) return;
      
      for (let i = 0; i < dayActivities.length; i++) {
        for (let j = i + 1; j < dayActivities.length; j++) {
          const combo = [dayActivities[i].category, dayActivities[j].category].sort().join(' + ');
          if (!combinations[combo]) {
            combinations[combo] = {
              count: 0,
              totalSatisfaction: 0,
              activities: []
            };
          }
          combinations[combo].count++;
          combinations[combo].totalSatisfaction += 
            (dayActivities[i].satisfaction + dayActivities[j].satisfaction) / 2;
          combinations[combo].activities.push([dayActivities[i], dayActivities[j]]);
        }
      }
    });

    return Object.entries(combinations)
      .map(([combo, stats]) => ({
        combination: combo,
        count: stats.count,
        avgSatisfaction: (stats.totalSatisfaction / stats.count).toFixed(2)
      }))
      .sort((a, b) => b.avgSatisfaction - a.avgSatisfaction)
      .slice(0, 5);
  };

  const analyzeStreaks = (filteredActivities) => {
    const sortedActivities = [...filteredActivities]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const streaks = {};
    let currentStreak = { category: null, count: 0, satisfaction: 0 };

    sortedActivities.forEach(activity => {
      if (activity.category === currentStreak.category) {
        currentStreak.count++;
        currentStreak.satisfaction += activity.satisfaction;
      } else {
        if (currentStreak.count > 1) {
          if (!streaks[currentStreak.category]) {
            streaks[currentStreak.category] = [];
          }
          streaks[currentStreak.category].push({
            count: currentStreak.count,
            avgSatisfaction: (currentStreak.satisfaction / currentStreak.count).toFixed(2)
          });
        }
        currentStreak = {
          category: activity.category,
          count: 1,
          satisfaction: activity.satisfaction
        };
      }
    });

    return Object.entries(streaks).map(([category, streakList]) => ({
      category,
      maxStreak: Math.max(...streakList.map(s => s.count)),
      avgSatisfaction: (
        streakList.reduce((sum, s) => sum + parseFloat(s.avgSatisfaction), 0) / streakList.length
      ).toFixed(2)
    })).sort((a, b) => b.maxStreak - a.maxStreak);
  };

  const analysisData = useMemo(() => {
    const now = new Date();
    const rangeStart = getTimeRangeStart(now, timeRange);
    
    const filteredActivities = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return (
        activityDate >= rangeStart &&
        (selectedCategory === 'all' || activity.category === selectedCategory)
      );
    });

    const timePatterns = analyzeTimePatterns(filteredActivities);
    const dayPatterns = analyzeDayOfWeekPatterns(filteredActivities);
    const combinations = analyzeActivityCombinations(filteredActivities);
    const streaks = analyzeStreaks(filteredActivities);

    return {
      timePatterns,
      dayPatterns,
      combinations,
      streaks
    };
  }, [activities, timeRange, selectedCategory]);

  return (
    <div className="satisfaction-analysis">
      <div className="analysis-controls">
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="analysis-grid">
        <div className="analysis-section">
          <h3>🕒 Time of Day Patterns</h3>
          {Object.entries(analysisData.timePatterns).map(([slot, data]) => (
            <div key={slot} className="pattern-item">
              <strong>{slot.charAt(0).toUpperCase() + slot.slice(1)}</strong>
              <div>Activities: {data.count}</div>
              <div>Avg Satisfaction: {data.avgSatisfaction}⭐</div>
            </div>
          ))}
        </div>

        <div className="analysis-section">
          <h3>📅 Day of Week Patterns</h3>
          {Object.entries(analysisData.dayPatterns).map(([day, data]) => (
            <div key={day} className="pattern-item">
              <strong>{day}</strong>
              <div>Activities: {data.count}</div>
              <div>Avg Satisfaction: {data.avgSatisfaction}⭐</div>
            </div>
          ))}
        </div>

        <div className="analysis-section">
          <h3>🤝 Best Activity Combinations</h3>
          {analysisData.combinations.map((combo, index) => (
            <div key={index} className="pattern-item">
              <strong>{combo.combination}</strong>
              <div>Times Combined: {combo.count}</div>
              <div>Avg Satisfaction: {combo.avgSatisfaction}⭐</div>
            </div>
          ))}
        </div>

        <div className="analysis-section">
          <h3>🔥 Activity Streaks</h3>
          {analysisData.streaks.map((streak, index) => (
            <div key={index} className="pattern-item">
              <strong>{streak.category}</strong>
              <div>Longest Streak: {streak.maxStreak} days</div>
              <div>Avg Satisfaction: {streak.avgSatisfaction}⭐</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SatisfactionAnalysis;
