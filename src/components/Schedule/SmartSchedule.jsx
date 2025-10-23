// src/components/Schedule/SmartSchedule.jsx
import React from 'react';

const SmartSchedule = ({ tasks, onTaskComplete }) => {
  const completedCount = tasks.filter(task => task.status === 'done').length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="smart-schedule">
      <h2>Today's Schedule</h2>
      <div className="schedule-header">
        <div className="completion-rate">
          <span className="rate">{completionRate}%</span>
          <span className="label">Completion</span>
        </div>
        <div className="task-count">
          <span className="count">{completedCount}/{totalCount}</span>
          <span className="label">Tasks Done</span>
        </div>
      </div>
      
      <div className="schedule-tasks">
        {tasks.length === 0 ? (
          <div className="empty-schedule">
            <p>No tasks scheduled for today!</p>
            <p>Add tasks with today's deadline to see them here.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.taskID} className={`scheduled-task ${task.status === 'done' ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={() => onTaskComplete(task.taskID)}
                className="task-checkbox"
              />
              <div className="task-info">
                <span className={`task-title ${task.status === 'done' ? 'completed' : ''}`}>
                  {task.title}
                </span>
                <div className="task-meta">
                  <span className="task-priority">{task.priority}</span>
                  {task.status === 'done' && (
                    <span className="completed-badge">Done</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SmartSchedule;