import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Seed skills
const skills = [
  { name: 'Python Fundamentals', category: 'AI/ML', difficulty: 'beginner', description: 'Learn Python basics for AI and ML' },
  { name: 'Machine Learning Basics', category: 'AI/ML', difficulty: 'intermediate', description: 'Introduction to ML algorithms' },
  { name: 'Deep Learning', category: 'AI/ML', difficulty: 'advanced', description: 'Neural networks and deep learning' },
  { name: 'React.js', category: 'Web Development', difficulty: 'beginner', description: 'Build modern web apps with React' },
  { name: 'Node.js Backend', category: 'Web Development', difficulty: 'intermediate', description: 'Server-side development with Node.js' },
  { name: 'Full Stack Development', category: 'Web Development', difficulty: 'advanced', description: 'Complete web development stack' },
  { name: 'Data Analysis', category: 'Data Science', difficulty: 'beginner', description: 'Analyze data with Python and Pandas' },
  { name: 'SQL & Databases', category: 'Data Science', difficulty: 'intermediate', description: 'Database design and SQL queries' },
  { name: 'Data Visualization', category: 'Data Science', difficulty: 'intermediate', description: 'Create compelling data visualizations' },
  { name: 'UI Design Principles', category: 'Design', difficulty: 'beginner', description: 'Fundamentals of user interface design' },
  { name: 'UX Research', category: 'Design', difficulty: 'intermediate', description: 'User experience research methods' },
  { name: 'Figma Mastery', category: 'Design', difficulty: 'intermediate', description: 'Professional design with Figma' },
  { name: 'React Native', category: 'Mobile Development', difficulty: 'intermediate', description: 'Build mobile apps with React Native' },
  { name: 'Flutter Basics', category: 'Mobile Development', difficulty: 'beginner', description: 'Cross-platform mobile development' },
  { name: 'AWS Cloud', category: 'Cloud Computing', difficulty: 'intermediate', description: 'Deploy and manage apps on AWS' },
  { name: 'Docker & Kubernetes', category: 'Cloud Computing', difficulty: 'advanced', description: 'Containerization and orchestration' },
];

for (const skill of skills) {
  await connection.execute(
    'INSERT INTO skills (name, category, difficulty, description) VALUES (?, ?, ?, ?)',
    [skill.name, skill.category, skill.difficulty, skill.description]
  );
}

console.log('✓ Seeded skills');

// Seed achievements
const achievements = [
  { name: 'First Steps', description: 'Complete your first task', requirement: 'complete_1_task' },
  { name: 'Task Master', description: 'Complete 5 tasks', requirement: 'complete_5_tasks' },
  { name: 'Guild Founder', description: 'Create your first guild', requirement: 'create_guild' },
  { name: 'Skill Seeker', description: 'Enroll in 3 skills', requirement: 'enroll_3_skills' },
  { name: 'Level 5', description: 'Reach level 5', requirement: 'reach_level_5' },
  { name: 'Level 10', description: 'Reach level 10', requirement: 'reach_level_10' },
  { name: 'Collaborator', description: 'Join a guild', requirement: 'join_guild' },
  { name: 'Leaderboard', description: 'Reach top 10 leaderboard', requirement: 'top_10_leaderboard' },
  { name: 'Chat Master', description: 'Send 50 messages in guild chat', requirement: 'send_50_messages' },
  { name: 'Study Buddy', description: 'Attend 10 study sessions', requirement: 'attend_10_sessions' },
];

for (const achievement of achievements) {
  await connection.execute(
    'INSERT INTO achievements (name, description, requirement) VALUES (?, ?, ?)',
    [achievement.name, achievement.description, achievement.requirement]
  );
}

console.log('✓ Seeded achievements');

await connection.end();
console.log('✓ Database seeded successfully!');
