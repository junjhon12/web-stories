import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const MoodMap = ({ grades }) => {
  // Convert letter grades to numeric values for the chart
  const gradeToNumber = (grade) => {
    const g = grade?.toUpperCase()[0];
    const map = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 };
    return map[g] || 0;
  };

  const data = [
    { subject: 'Structure', A: gradeToNumber(grades.structure) },
    { subject: 'Goal', A: gradeToNumber(grades.goal) },
    { subject: 'Characters', A: gradeToNumber(grades.characters) },
    { subject: 'Details', A: gradeToNumber(grades.details) },
    { subject: 'Pacing', A: gradeToNumber(grades.pacing) },
    { subject: 'Connective', A: gradeToNumber(grades.connective) },
    { subject: 'Resolution', A: gradeToNumber(grades.resolution) },
  ];

  return (
    <div style={{ width: '100%', height: 300, backgroundColor: 'var(--bg-body)', borderRadius: '8px', padding: '10px' }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="var(--border-color)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
          <Radar
            name="Critique"
            dataKey="A"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodMap;