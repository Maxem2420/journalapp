const categories = [
  'Work',
  'Exercise',
  'Study',
  'Leisure',
  'Social',
  'Self-care',
  'Other'
];

const activities = {
  Work: [
    'Project Meeting',
    'Code Review',
    'Client Presentation',
    'Documentation',
    'Team Sync',
    'Planning Session',
    'Bug Fixing'
  ],
  Exercise: [
    'Morning Jog',
    'Gym Workout',
    'Yoga Session',
    'Swimming',
    'Cycling',
    'Home Workout',
    'Basketball'
  ],
  Study: [
    'Online Course',
    'Reading Technical Book',
    'Language Practice',
    'Tutorial Videos',
    'Research Paper',
    'Practice Coding',
    'Study Group'
  ],
  Leisure: [
    'Movie Night',
    'Video Games',
    'Reading Novel',
    'Gardening',
    'Cooking',
    'Music Practice',
    'Art & Crafting'
  ],
  Social: [
    'Coffee with Friends',
    'Family Dinner',
    'Virtual Meetup',
    'Board Game Night',
    'Birthday Party',
    'Group Chat',
    'Community Event'
  ],
  'Self-care': [
    'Meditation',
    'Journaling',
    'Spa Day',
    'Nature Walk',
    'Reading Self-help',
    'Mindfulness Practice',
    'Relaxation Time'
  ],
  Other: [
    'House Cleaning',
    'Shopping',
    'Doctor Appointment',
    'Car Maintenance',
    'Home Organization',
    'Pet Care',
    'Random Tasks'
  ]
};

const durations = [
  '15 minutes',
  '30 minutes',
  '1 hour',
  '2 hours',
  '45 minutes',
  '1.5 hours',
  '20 minutes'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateDescription(category, activity) {
  const positiveDescriptions = [
    'Really enjoyed this session',
    'Made good progress today',
    'Feeling accomplished',
    'Great experience',
    'Very productive time'
  ];
  const neutralDescriptions = [
    'Regular session',
    'Nothing special',
    'Routine activity',
    'Standard progress',
    'Normal day'
  ];
  const negativeDescriptions = [
    'Could have been better',
    'Feeling tired',
    'Not very focused',
    'Struggled a bit',
    'Need improvement'
  ];

  const satisfaction = Math.random();
  if (satisfaction > 0.7) return getRandomElement(positiveDescriptions);
  if (satisfaction > 0.3) return getRandomElement(neutralDescriptions);
  return getRandomElement(negativeDescriptions);
}

function generateSatisfactionLevel(category, hour) {
  // Base satisfaction level
  let base = Math.random() * 2 + 3; // 3-5 range

  // Category-specific adjustments
  const categoryModifiers = {
    'Self-care': 0.5,
    Exercise: 0.3,
    Social: 0.4,
    Leisure: 0.2,
    Work: -0.2,
    Study: -0.1
  };

  // Time of day adjustments
  const timeModifier = 
    (hour >= 9 && hour <= 11) ? 0.3 :  // Morning boost
    (hour >= 14 && hour <= 16) ? -0.2 : // Afternoon slump
    (hour >= 20 || hour <= 5) ? -0.4 :  // Late night/early morning
    0;

  // Apply modifiers
  base += (categoryModifiers[category] || 0) + timeModifier;

  // Ensure the result is between 1 and 5
  return Math.max(1, Math.min(5, base));
}

function generateFakeActivities() {
  const activities = [];
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setFullYear(endDate.getFullYear() - 2); // Generate 2 years of data

  // Generate activities for each day
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    // Generate 2-5 activities per day
    const numActivities = Math.floor(Math.random() * 4) + 2;
    
    // Track used hours to avoid duplicates in the same day
    const usedHours = new Set();
    
    for (let i = 0; i < numActivities; i++) {
      // Generate a random hour that hasn't been used today
      let hour;
      do {
        hour = Math.floor(Math.random() * 24);
      } while (usedHours.has(hour));
      usedHours.add(hour);

      const category = getRandomElement(categories);
      const title = getRandomElement(activities[category]);
      const timestamp = new Date(date);
      timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

      const activity = {
        id: Date.now() + i + timestamp.getTime(),
        title,
        category,
        duration: getRandomElement(durations),
        description: generateDescription(category, title),
        satisfaction: generateSatisfactionLevel(category, hour),
        timestamp: timestamp.toISOString()
      };

      activities.push(activity);
    }
  }

  // Sort activities by timestamp in descending order (newest first)
  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export default generateFakeActivities;
