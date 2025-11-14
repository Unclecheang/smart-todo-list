// src/pages/CalendarPage.jsx
import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskCalendar from '../components/Calendar/TaskCalendar';
import TaskForm from '../components/Task/TaskForm';
import { taskService } from '../services/taskService';
import { useAuth } from '../hooks/useAuth';

const CalendarPage = () => {
  const { tasks, loading } = useTasks();
  const { user } = useAuth();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setShowTaskForm(true);
  };

  const handleSelectSlot = (date) => {
    setSelectedDate(date);
    setSelectedTask(null);
    setShowTaskForm(true);
  };

  const handleCreateTask = async (taskData) => {
    try {
      // If a date was selected, use it as the deadline
      const taskWithDate = {
        ...taskData,
        deadline: selectedDate ? selectedDate.toISOString() : taskData.deadline
      };
      
      await taskService.createTask(taskWithDate, user.uid);
      setShowTaskForm(false);
      setSelectedDate(null);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      await taskService.updateTask(selectedTask.taskID, taskData);
      setShowTaskForm(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading calendar...</div>;
  }

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1>📅 Task Calendar</h1>
        <p>View and manage your tasks on a calendar</p>
      </div>

      <div className="calendar-container">
        <TaskCalendar 
          tasks={tasks}
          onSelectTask={handleSelectTask}
          onSelectSlot={handleSelectSlot}
        />
      </div>

      {/* Task Form Modal */}
      {(showTaskForm) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {selectedTask ? 'Edit Task' : 'Create New Task'}
                {selectedDate && ` for ${selectedDate.toLocaleDateString()}`}
              </h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowTaskForm(false);
                  setSelectedDate(null);
                  setSelectedTask(null);
                }}
              >
                ×
              </button>
            </div>
            <TaskForm
              task={selectedTask}
              initialDate={selectedDate}
              onSubmit={selectedTask ? handleEditTask : handleCreateTask}
              onCancel={() => {
                setShowTaskForm(false);
                setSelectedDate(null);
                setSelectedTask(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;