// src/services/taskService.js
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Make sure you're using export (not export default)
export const taskService = {
  createTask: async (taskData, userId) => {
    try {
      console.log('Creating task for user:', userId);
      
      const taskWithMetadata = {
        title: taskData.title,
        deadline: taskData.deadline ? new Date(taskData.deadline) : null,
        priority: taskData.priority || 'Medium',
        description: taskData.description || '',
        userId: userId,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        attachments: taskData.attachments || []
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), taskWithMetadata);
      console.log('Task created with ID:', docRef.id);
      
      return { 
        taskID: docRef.id, 
        ...taskWithMetadata 
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        deadline: updates.deadline ? new Date(updates.deadline) : null,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  completeTask: async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: 'done',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },

  subscribeToUserTasks: (userId, callback) => {
    if (!userId) {
      console.log('No user ID provided for task subscription');
      callback([]);
      return () => {};
    }

    try {
      console.log('Setting up Firestore listener for user:', userId);
      
      // Simple query without orderBy to avoid index issues
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      
      return onSnapshot(q, 
        (snapshot) => {
          console.log('Firestore snapshot received, docs:', snapshot.docs.length);
          
          const tasks = snapshot.docs.map(doc => {
            const data = doc.data();
            
            // Handle timestamps safely
            let createdAt = new Date();
            let deadline = null;
            let updatedAt = new Date();
            
            try {
              if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                createdAt = data.createdAt.toDate();
              }
              if (data.deadline && typeof data.deadline.toDate === 'function') {
                deadline = data.deadline.toDate();
              }
              if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
                updatedAt = data.updatedAt.toDate();
              }
            } catch (timestampError) {
              console.warn('Timestamp conversion error:', timestampError);
            }
            
            return {
              taskID: doc.id,
              ...data,
              createdAt,
              deadline,
              updatedAt
            };
          });
          
          // Sort manually on client side
          tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          console.log('Processed tasks:', tasks.length);
          callback(tasks);
        },
        (error) => {
          console.error('Firestore listener error:', error);
          console.error('Error code:', error.code, 'Message:', error.message);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up Firestore listener:', error);
      callback([]);
      return () => {};
    }
  }
};
