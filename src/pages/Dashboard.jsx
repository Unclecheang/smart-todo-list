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
  // 🔔 添加状态管理弹窗提醒

  // 🔔 任务提醒功能：请求通知权限
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  };

  // 🔔 任务提醒功能：显示风格弹窗通知

  // 🔔 任务提醒功能：检查任务提醒
  const checkTaskReminders = () => {
    if (!user || !tasks || tasks.length === 0) return;
    
    const now = new Date();
    const nowTime = now.getTime();
    
    tasks.forEach(task => {
      if (!task.deadline || task.status === 'done') return;
      
      const deadline = new Date(task.deadline);
      const deadlineTime = deadline.getTime();
      console.log('deadline', deadline);
      console.log('now', now);
      
      
      // 计算剩余天数
      const timeDiff = deadlineTime - nowTime;
      console.log('nowTime', nowTime)
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      // 检查是否需要提醒
      let shouldRemind = false;
      let reminderMessage = '';
      
      // 前三天、两天、一天和当天提醒
      if (daysDiff === 3 || daysDiff === 2 || daysDiff === 1 || daysDiff === 0) {
        shouldRemind = true;
        if (daysDiff === 3) {
          reminderMessage = `Task "${task.title}" is due in 3 days`;
        } else if (daysDiff === 2) {
          reminderMessage = `Task "${task.title}" is due in 2 days`;
        } else if (daysDiff === 1) {
          reminderMessage = `Task "${task.title}" is due tomorrow`;
        } else {
          reminderMessage = `Task "${task.title}" is due today`;
        }
      }
      console.log('提示',daysDiff);
      // reminderMessage = `Task "${task.title}" is due today`;
      // showPopupNotification(reminderMessage, task);
      
      // 检查具体时间提醒
      if (daysDiff === 0) {
        const hoursDiff = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesDiff = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        // 如果任务有具体时间，并且当前时间接近设定时间
        if (hoursDiff === 0 && minutesDiff <= 5) {
          shouldRemind = true;
          reminderMessage = `Task "${task.title}" is due in ${minutesDiff} minutes`;
        }
      }
      
      // 0点提醒（对于只有日期的任务）
      if (daysDiff === 0 && now.getHours() === 0 && now.getMinutes() < 5 && !task.time) {
        shouldRemind = true;
        reminderMessage = `Task "${task.title}" is due today`;
      }
      
      // 发送提醒
      if (shouldRemind) {
        // 检查是否已经提醒过，避免重复提醒
        const lastReminded = localStorage.getItem(`reminded_${task.taskID}`);
        if (!lastReminded || parseInt(lastReminded) < nowTime - 60 * 60 * 1000) {
          // 一小时内没有提醒过
          setTimeout(() => {
              alert(reminderMessage); // 使用浏览器原生alert
            }, 5000); // 5000毫秒 = 5秒
          localStorage.setItem(`reminded_${task.taskID}`, nowTime.toString());
        }
      }
    });
  };

  // 📊 任务量控制：检查周一到周五任务量是否超限
  const checkWorkload = () => {
    // 只在周一到周五检查
    const today = new Date().getDay();
    if (today === 0 || today === 6) { // 0是周日，6是周六
      return true; // 周末不限制
    }
    
    // 获取本周一到周五的任务数量
    const workdayTasks = tasks.filter(task => {
      const taskDate = new Date(task.deadline);
      const taskDay = taskDate.getDay();
      return taskDay >= 1 && taskDay <= 5; // 周一到周五
    });
    
    // 检查是否超过15个任务
    if (workdayTasks.length >= 15) {
      return window.confirm('You have reached the recommended task limit for the workweek (15 tasks). Adding more tasks may lead to overload. Are you sure you want to continue?');
    }
    
    return true;
  };

  // 📎 附件功能：处理文件上传（现在改为本地存储）
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return [];
    
    try {
      const uploadedFiles = [];
      for (const file of files) {
        // 生成唯一的文件ID
        const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // 读取文件内容并转换为base64
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        // 创建文件对象存储在localStorage中
        const fileObject = {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
          uploadedAt: new Date().toISOString()
        };
        
        // 存储到localStorage
        localStorage.setItem(`file_${fileId}`, JSON.stringify(fileObject));
        
        // 返回文件引用URL
        uploadedFiles.push(`local-file://${fileId}`);
      }
      return uploadedFiles;
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Failed to process files. Please try again.');
      return [];
    }
  };

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

  // 🔥 修改：Today's Overview 基于所有任务计算
  const todayStats = useMemo(() => {
    // 基于所有任务计算，而不是仅今天到期的任务
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
    const pendingTasks = totalTasks - completedTasks;
    
    console.log('📊 Today Stats (All Tasks):', {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks
    });
    
    return {
      total: totalTasks,           // 所有任务数量
      completed: completedTasks,   // 已完成任务数量
      pending: pendingTasks        // 待处理任务数量
    };
  }, [tasks]); // 🔥 依赖改为所有 tasks

  // 📊 任务量控制：修改创建任务逻辑
  const handleCreateTask = async (taskData) => {
    try {
      if (!user) {
        console.error('No user found when creating task');
        return;
      }
      
      // 检查工作负载
      if (!checkWorkload()) {
        return;
      }
      
      // 处理附件
      if (taskData.attachments && taskData.attachments.length > 0) {
        // 过滤掉已经上传的文件URL
        const newAttachments = taskData.attachments.filter(file => file instanceof File);
        if (newAttachments.length > 0) {
          const uploadedFiles = await handleFileUpload(newAttachments);
          // 保留已有的文件URL，添加新上传的URL
          taskData.attachments = [
            ...taskData.attachments.filter(file => typeof file === 'string'),
            ...uploadedFiles
          ];
        }
      }
      
      await taskService.createTask(taskData, user.uid);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  // 📎 附件功能：修改编辑任务逻辑
  const handleEditTask = async (taskData) => {
    try {
      // 处理附件
      if (taskData.attachments && taskData.attachments.length > 0) {
        // 过滤掉已经上传的文件URL
        const newAttachments = taskData.attachments.filter(file => file instanceof File);
        if (newAttachments.length > 0) {
          const uploadedFiles = await handleFileUpload(newAttachments);
          // 保留已有的文件URL，添加新上传的URL
          taskData.attachments = [
            ...taskData.attachments.filter(file => typeof file === 'string'),
            ...uploadedFiles
          ];
        }
      }
      
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

  // 🔔 任务提醒功能：初始化通知和设置定时检查
  useEffect(() => {
    // 请求通知权限
    const initNotifications = async () => {
      await requestNotificationPermission();
    };
    
    initNotifications();
    
    // 每5分钟检查一次提醒
    const reminderInterval = setInterval(checkTaskReminders, 1 * 30 * 1000);
    
    // 立即检查一次
    checkTaskReminders();
    
    return () => {
      clearInterval(reminderInterval);
    };
  }, [user, tasks]);

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
      {/* 🔔 添加弹窗提醒组件 */}

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
                {tasks
                  // 🔥 新增：按照 High > Medium > Low 优先级排序
                  .sort((a, b) => {
                    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .map(task => (
                    <TaskItem
                      key={task.taskID}
                      task={task}
                      onEdit={setEditingTask}
                      onDelete={handleDeleteTask}
                      onComplete={handleCompleteTask}
                    />
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📎 附件功能：修改TaskForm组件，添加onFileUpload prop */}
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
              onFileUpload={handleFileUpload}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;