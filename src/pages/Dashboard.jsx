// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import TaskItem from '../components/Task/TaskItem';
import TaskForm from '../components/Task/TaskForm';
import SmartSchedule from '../components/Schedule/SmartSchedule';
import ProgressTracker from '../components/Report/ProgressTracker';
import AuthForm from '../components/Auth/AuthForm';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Get ALL tasks due today (both completed and pending)
  const allTasksDueToday = useMemo(() => {
    if (!tasks) return [];
    
    const today = new Date().toDateString();
    const todayTasks = tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline).toDateString();
      return taskDate === today;
    });
    
    console.log('📅 All tasks due today:', todayTasks.length);
    return todayTasks;
  }, [tasks]);

  // Today's schedule (only pending tasks for the schedule view)
  const todaySchedule = useMemo(() => {
    const pendingTasks = allTasksDueToday.filter(task => task.status !== 'done');
    
    const scheduled = pendingTasks.sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.deadline) - new Date(b.deadline);
    });
    
    console.log('📋 Today schedule (pending):', scheduled.length, 'tasks');
    return scheduled;
  }, [allTasksDueToday]);

  // Calculate stats for Today's Overview - based on ALL tasks due today
  const todayStats = useMemo(() => {
    const totalDueToday = allTasksDueToday.length;
    const completedToday = allTasksDueToday.filter(t => t.status === 'done').length;
    const pendingToday = allTasksDueToday.filter(t => t.status !== 'done').length;
    const highPriorityToday = allTasksDueToday.filter(t => t.priority === 'High').length;
    
    const completionPercentage = totalDueToday > 0 ? (completedToday / totalDueToday) * 100 : 0;
    
    console.log('📊 Today Stats:', {
      total: totalDueToday,
      completed: completedToday,
      pending: pendingToday,
      highPriority: highPriorityToday,
      completionPercentage: completionPercentage
    });
    
    return {
      total: totalDueToday,
      completed: completedToday,
      pending: pendingToday,
      highPriority: highPriorityToday,
      completionPercentage: completionPercentage
    };
  }, [allTasksDueToday]);

  const handleCreateTask = async (taskData) => {
    try {
      if (!user) {
        console.error('No user found when creating task');
        return;
      }
      await taskService.createTask(taskData, user.uid);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      await taskService.updateTask(editingTask.taskID, taskData);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.completeTask(taskId);
      console.log('Task completed, todaySchedule should update automatically');
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Add this helper function inside the Dashboard component
  const getProgressColor = (percentage) => {
    if (percentage === 0) return '#e9ecef';
    if (percentage < 25) return '#ff6b6b';    // Red
    if (percentage < 50) return '#ffa726';    // Orange
    if (percentage < 75) return '#42a5f5';    // Blue
    if (percentage < 100) return '#66bb6a';   // Green
    return '#4caf50'; // Dark green for 100%
  };

  // Loading states
  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading Smart To-Do List...</div>
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-header">
            <h1>📝 Smart To-Do List</h1>
            <p>Your intelligent task management assistant</p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  // Safe user display name
  const userDisplayName = user?.displayName || user?.email || 'User';

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          <h1>📝 Smart To-Do List</h1>
          <div className="user-details">
            <span className="welcome">Welcome, {userDisplayName}!</span>
            <span className="user-stats">{tasks?.length || 0} total tasks</span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowTaskForm(true)}
            disabled={tasksLoading}
          >
            {tasksLoading ? 'Loading...' : '+ New Task'}
          </button>
          <button 
            className="btn-secondary"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Left Panel - Schedule & Quick Actions */}
        <div className="left-panel">
          <SmartSchedule 
            tasks={todaySchedule}
            onTaskComplete={handleCompleteTask}
          />
          
          {/* Quick Stats Card */}
          <div className="quick-stats">
            <h3>Today's Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{todayStats.total}</span>
                <span className="stat-label">Total Due</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{todayStats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{todayStats.pending}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
            
            {/* Progress Bar for Today's Completion */}
            <div className="completion-percentage">
              <div className="progress-header">
                <span>Today's Progress</span>
                <span className="progress-text">
                  {todayStats.completed}/{todayStats.total}
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${todayStats.completionPercentage}%`,
                    backgroundColor: getProgressColor(todayStats.completionPercentage)
                  }}
                >
                  {todayStats.completionPercentage > 0 && (
                    <span className="progress-percentage">
                      {Math.round(todayStats.completionPercentage)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="progress-label">
                {todayStats.total > 0 
                  ? `${Math.round(todayStats.completionPercentage)}% of today's tasks completed`
                  : 'No tasks due today'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Progress & Task List */}
        <div className="right-panel">
          <ProgressTracker tasks={tasks || []} />
          
          <div className="tasks-section">
            <div className="section-header">
              <h3>All Tasks</h3>
              <div className="task-count-badge">
                {(tasks || []).filter(t => t.status !== 'done').length} active
              </div>
            </div>
            
            {tasksLoading ? (
              <div className="loading-tasks">Loading tasks...</div>
            ) : !tasks || tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h4>No tasks yet</h4>
                <p>Create your first task to get started!</p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowTaskForm(true)}
                >
                  Create Your First Task
                </button>
              </div>
            ) : (
              <div className="tasks-list">
                {tasks.map(task => (
                  <TaskItem
                    key={task.taskID}
                    task={task}
                    onEdit={setEditingTask}
                    onDelete={handleDeleteTask}
                    onComplete={handleCompleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {(showTaskForm || editingTask) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
              >
                ×
              </button>
            </div>
            <TaskForm
              task={editingTask}
              onSubmit={editingTask ? handleEditTask : handleCreateTask}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;