// src/components/Calendar/TaskCalendar.jsx
import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const TaskCalendar = ({ tasks, onSelectTask, onSelectSlot }) => {
  // Convert tasks to calendar events
  const events = useMemo(() => {
    return tasks.map(task => ({
      id: task.taskID,
      title: task.title,
      start: new Date(task.deadline),
      end: new Date(task.deadline),
      allDay: true,
      resource: task, // Store the entire task object
      status: task.status,
      priority: task.priority
    }));
  }, [tasks]);

  // Custom event styling based on priority and status
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad'; // Default blue
    
    if (event.status === 'done') {
      backgroundColor = '#28a745'; // Green for completed
    } else {
      // Color by priority for pending tasks
      switch (event.priority) {
        case 'High':
          backgroundColor = '#dc3545'; // Red
          break;
        case 'Medium':
          backgroundColor = '#ffc107'; // Yellow
          break;
        case 'Low':
          backgroundColor = '#17a2b8'; // Teal
          break;
        default:
          backgroundColor = '#3174ad'; // Blue
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: event.status === 'done' ? 0.7 : 1,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectEvent = (event) => {
    if (onSelectTask) {
      onSelectTask(event.resource);
    }
  };

  const handleSelectSlot = (slotInfo) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo.start);
    }
  };

  return (
    <div className="task-calendar">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        views={['month', 'week', 'day']}
        defaultView="month"
        popup
        messages={{
          next: "Next",
          previous: "Prev",
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
          agenda: "Agenda",
          date: "Date",
          time: "Time",
          event: "Task",
          noEventsInRange: "No tasks in this range"
        }}
      />
    </div>
  );
};

export default TaskCalendar;