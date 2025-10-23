// src/components/Task/TaskItem.jsx
import React from 'react';
import { getPriorityColor, formatDate, isOverdue } from '../../utils/helpers';

const TaskItem = ({ task, onEdit, onDelete, onComplete }) => {
  const overdue = isOverdue(task.deadline) && task.status !== 'done';

  return (
    <div 
      className={`task-item ${task.status === 'done' ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}
      style={{ borderLeft: `4px solid ${getPriorityColor(task.priority)}` }}
    >
      <div className="task-header">
        <div className="task-title">
          <h3>{task.title}</h3>
          {overdue && <span className="overdue-badge">Overdue</span>}
          {task.status === 'done' && <span className="completed-badge">Completed</span>}
        </div>
        <div className="task-actions">
          {task.status !== 'done' && (
            <button 
              onClick={() => onComplete(task.taskID)}
              className="btn-complete"
              title="Complete Task"
            >
              ✓
            </button>
          )}
          <button 
            onClick={() => onEdit(task)}
            className="btn-edit"
            title="Edit Task"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(task.taskID)}
            className="btn-delete"
            title="Delete Task"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="task-details">
        <span className="deadline">Deadline: {formatDate(task.deadline)}</span>
        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority} Priority
        </span>
      </div>
      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskItem;