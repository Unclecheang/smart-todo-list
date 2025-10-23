// src/utils/helpers.js
export const formatDate = (date) => {
  if (!date) return 'No deadline';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const isOverdue = (deadline) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return '#ff4444';
    case 'Medium': return '#ffaa00';
    case 'Low': return '#44ff44';
    default: return '#cccccc';
  }
};