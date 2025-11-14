// src/components/Task/TaskForm.jsx
import React, { useState, useEffect } from 'react';
import EisenhowerAssessment from './EisenhowerAssessment.jsx';

const TaskForm = ({ task, initialDate, onSubmit, onCancel, onFileUpload }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    deadline: task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : (initialDate ? initialDate.toISOString().slice(0, 16) : ''),
    priority: task?.priority || 'Medium',
    description: task?.description || ''
  });

  // 🔥 新增状态：控制评估弹窗
  const [showAssessment, setShowAssessment] = useState(false);
  const [newlyAddedTask, setNewlyAddedTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 📎 附件功能：添加附件状态
  const [attachments, setAttachments] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // 📅 更新：如果 initialDate 变化，更新截止日期
  useEffect(() => {
    if (initialDate && !task) {
      setFormData(prev => ({
        ...prev,
        deadline: initialDate.toISOString().slice(0, 16)
      }));
    }
  }, [initialDate, task]);

  // 📎 附件功能：解析已有附件（用于编辑时显示）
  useEffect(() => {
    console.log('🔍 解析已有附件');
    console.log(task)
    if (task?.attachments) {
      const parsedAttachments = task.attachments.map(attachment => {
        if (typeof attachment === 'string' && attachment.startsWith('local-file://')) {
          // 解析本地存储的文件
          const fileId = attachment.replace('local-file://', '');
          const fileData = localStorage.getItem(`file_${fileId}`);
          if (fileData) {
            try {
              const fileObj = JSON.parse(fileData);
              return {
                id: fileObj.id,
                name: fileObj.name,
                type: fileObj.type,
                size: fileObj.size,
                url: attachment
              };
            } catch (e) {
              console.error('Error parsing file data:', e);
              return attachment;
            }
          }
          return attachment;
        }
        return attachment;
      });
      setAttachments(parsedAttachments);
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault(); // 🔥 阻止默认表单提交
    if (!formData.title.trim()) return;
    
  
    const submittedTask = {
      ...formData,
      deadline: formData.deadline || null,
      attachments: attachments // 添加附件到提交数据中
    };

    console.log('🔍 表单提交，任务是新建吗？', !task);
    
    // 🔥 修改：如果是新建任务，只显示评估弹窗，不提交
    if (!task) {
      console.log('🔍 显示评估弹窗');
      // 保存新增的任务
      setNewlyAddedTask(submittedTask);
      // 显示评估弹窗
      setShowAssessment(true);
      // 🔥 重要：不调用 onSubmit，等待用户选择象限
    } else {
      // 如果是编辑任务，直接调用 onSubmit
      console.log('🔍 编辑任务，直接提交');
      onSubmit(submittedTask);
    }
  };

  // 🔥 新增：关闭评估弹窗的函数（用户点击关闭按钮）
  const handleCloseAssessment = () => {
    console.log('🔍 用户关闭弹窗');
    setShowAssessment(false);
    setNewlyAddedTask(null);
    // 🔥 注意：不提交任务，用户取消了操作
  };

  // 🔥 新增：处理象限选择的函数（用户确认选择）
  const handleQuadrantSelect = (quadrant) => {
    console.log('🔍 用户选择象限:', quadrant);
    
    if (isSubmitting) return; // 防止重复提交
    
    setIsSubmitting(true);
    
    // 将象限信息添加到任务中
    const taskWithQuadrant = {
      ...newlyAddedTask,
      eisenhowerQuadrant: quadrant // 添加象限信息
    };
    
    console.log('🔍 提交任务:', taskWithQuadrant);
    
    // 调用父组件的 onSubmit 提交任务
    onSubmit(taskWithQuadrant);
    
    // 关闭弹窗
    setShowAssessment(false);
    setNewlyAddedTask(null);
    setIsSubmitting(false);
  };
  
  // 📎 附件功能：处理文件选择
  const handleFileChange = (files) => {
    const fileList = Array.from(files);
    validateAndAddFiles(fileList);
  };
  
  // 📎 附件功能：验证并添加文件
  const validateAndAddFiles = (files) => {
    const validFiles = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    files.forEach(file => {
      // 检查文件类型
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      
      // 检查文件大小
      const isValidSize = file.size <= maxSize;
      
      if (isValidType && isValidSize) {
        validFiles.push(file);
      } else {
        alert(`文件 ${file.name} 不符合要求。请确保文件是图片或PDF格式，且大小不超过5MB。`);
      }
    });
    
    // 更新附件列表，保留已有附件
    setAttachments(prev => {
      // 过滤掉可能的字符串形式的旧附件（非File对象）
      const existingAttachments = prev.filter(att => att instanceof File || (att.url && !att.url.startsWith('local-file://')));
      return [...existingAttachments, ...validFiles];
    });
  };
  
  // 📎 附件功能：移除附件
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // 📎 附件功能：处理拖拽事件
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFileChange(files);
    }
  };
  
  // 📎 附件功能：下载附件
  const downloadAttachment = (attachment) => {
    if (attachment.url && attachment.url.startsWith('local-file://')) {
      // 下载本地存储的文件
      const fileId = attachment.url.replace('local-file://', '');
      const fileData = localStorage.getItem(`file_${fileId}`);
      if (fileData) {
        try {
          const fileObj = JSON.parse(fileData);
          const link = document.createElement('a');
          link.href = fileObj.data;
          link.download = fileObj.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (e) {
          console.error('Error downloading file:', e);
          alert('无法下载文件');
        }
      } else {
        alert('文件不存在');
      }
    } else if (attachment instanceof File) {
      // 下载新选择但尚未上传的文件（创建临时URL）
      const url = URL.createObjectURL(attachment);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label>Task Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="What needs to be done?"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Deadline</label>
          <input
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          />
          {initialDate && !task && (
            <small className="form-hint">
              Pre-filled with selected calendar date
            </small>
          )}
        </div>
        
        <div className="form-group">
          <label>Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Description (Optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Add more details about this task..."
            rows="3"
          />
        </div>
        
        {/* 📎 附件功能：添加附件上传区域 */}
        <div className="form-group">
          <label>Attachments (Optional)</label>
          <div 
            className={`drop-area ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <div className="drop-area-content">
              <span className="drop-icon">📁</span>
              <p>Drag & drop PDF or image files here</p>
              <p className="drop-hint">or click to browse files</p>
              <p className="drop-limit">Supports PDF and images up to 5MB each</p>
            </div>
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={(e) => handleFileChange(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>
          
          {/* 📎 附件功能：显示已选择的附件 */}
          {attachments.length > 0 && (
            <div className="attachments-preview">
              <h4>Selected Files:</h4>
              <ul className="attachments-list">
                {attachments.map((file, index) => (
                  <li key={`${file.name || file.url}-${index}`} className="attachment-item">
                    <span className="attachment-name">
                      {file.name || (file.url ? file.url.split('/').pop() : '')}
                    </span>
                    <span className="attachment-size">
                      {file.size ? `${(file.size / 1024).toFixed(1)} KB` : file.url ? '已上传文件' : ''}
                    </span>
                    <button
                      type="button"
                      className="download-attachment"
                      onClick={() => downloadAttachment(file)}
                      title="Download"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      className="remove-attachment"
                      onClick={() => removeAttachment(index)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : (task ? 'Update Task' : 'Create Task')}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>


      {/* 🔥 新增：评估弹窗的条件渲染 */}
      {showAssessment && newlyAddedTask && (
        <EisenhowerAssessment
          task={newlyAddedTask}
          onClose={handleCloseAssessment}
          onQuadrantSelect={handleQuadrantSelect}
        />
      )}
    </div>
  );
};

export default TaskForm;