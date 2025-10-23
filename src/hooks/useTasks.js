// src/hooks/useTasks.js
import { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from './useAuth';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    console.log('🔄 useTasks: Setting up task subscription for user:', user.uid);
    
    const unsubscribe = taskService.subscribeToUserTasks(user.uid, (tasksData) => {
      console.log('🔄 useTasks: Received tasks data:', tasksData);
      setTasks(tasksData);
      setLoading(false);
      setError(null);
    });

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ useTasks: Loading timeout reached');
        setLoading(false);
        setError('Loading timeout - check Firestore connection');
      }
    }, 10000); // 10 second timeout

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [user]);

  return { tasks, loading, error };
};