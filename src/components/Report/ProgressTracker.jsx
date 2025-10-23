// src/components/Report/ProgressTracker.jsx
import React from 'react';

const ProgressTracker = ({ tasks }) => {
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const highPriorityTasks = tasks.filter(task => task.priority === 'High' && task.status !== 'done').length;
  const overdueTasks = tasks.filter(task => {
    if (!task.deadline || task.status === 'done') return false;
    return new Date(task.deadline) < new Date();
  }).length;

  return (
    <div className="progress-tracker">
      <h3>Progress Overview</h3>
      <div className="progress-stats">
        <div className="stat">
          <div className="stat-value">{completionRate.toFixed(1)}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
        <div className="stat">
          <div className="stat-value">{completedTasks}/{totalTasks}</div>
          <div className="stat-label">Tasks Completed</div>
        </div>
        <div className="stat">
          <div className="stat-value warning">{highPriorityTasks}</div>
          <div className="stat-label">High Priority</div>
        </div>
        <div className="stat">
          <div className="stat-value danger">{overdueTasks}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;