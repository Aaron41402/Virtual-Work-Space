"use client";
import React, { useState, useEffect, useRef } from "react";
import { Edit2, Check, X, Trash2, Filter, Circle, Clock, CheckCircle2 } from 'lucide-react';
import { createPortal } from 'react-dom';

function ToDoList() {
    // Define text style for VT323 font
    const textStyle = {
        fontFamily: "'VT323', monospace",
        fontSize: "1.2rem",
        color: "#000000"
    };
    
    const [tasks, setTasks] = useState([]);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        priority: "Medium",
        status: "Pending"
    });
    const [editingTask, setEditingTask] = useState(null);
    const [filters, setFilters] = useState(() => {
        const savedFilters = localStorage.getItem('taskFilters');
        return savedFilters ? JSON.parse(savedFilters) : {
            priorities: [],
            statuses: []
        };
    });
    const [sortConfig, setSortConfig] = useState(() => {
        const savedSortConfig = localStorage.getItem('taskSortConfig');
        return savedSortConfig ? JSON.parse(savedSortConfig) : {
            field: 'priority',
            direction: 'desc'
        };
    });
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [titleError, setTitleError] = useState(false);
    const [activeStatusDropdown, setActiveStatusDropdown] = useState(null);
    const [loading, setLoading] = useState(true);

    // Add priority and status order maps
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    const statusOrder = { Pending: 1, 'In Progress': 2, Completed: 3 };

    // Add refs
    const taskListRef = useRef(null);
    const taskRefs = useRef({});
    const buttonRefs = useRef({});

    // Add this near the top of your component
    const inputStyle = {
        fontFamily: "'VT323', monospace",
        fontSize: "1.2rem",
        color: "#333333",
        backgroundColor: "#ffffff",
        border: "1px solid #cccccc"
    };

    // Fetch tasks on component mount
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const cachedTasks = localStorage.getItem('tasks');
        if (cachedTasks) {
            setTasks(JSON.parse(cachedTasks));
        }
        setLoading(false);
    };

    // Add effects to save changes to localStorage
    useEffect(() => {
        localStorage.setItem('taskFilters', JSON.stringify(filters));
    }, [filters]);

    useEffect(() => {
        localStorage.setItem('taskSortConfig', JSON.stringify(sortConfig));
    }, [sortConfig]);

    // ------------------------- Handlers -------------------------
    const handleStatusChange = async (taskId, updates) => {
        // Find the current task and return if status is unchanged
        const currentTask = tasks.find(task => task._id === taskId);
        if (currentTask.status === updates.status) {
            setActiveStatusDropdown(null);
            return;
        }

        // First, update the local state and localStorage immediately
        const updatedTasks = tasks.map(task => 
            task._id === taskId ? { ...task, ...updates } : task
        );
        setTasks(updatedTasks);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));

        if (taskId.startsWith('schedule-task-')) return

        // Then, try to sync with the database
        try {
            const response = await fetch('/api/task', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: taskId,
                    ...updates
                }),
            });

            if (!response.ok) {
                // If the API call fails, revert the changes
                const originalTasks = tasks;
                setTasks(originalTasks);
                localStorage.setItem('tasks', JSON.stringify(originalTasks));
                console.error('Failed to update task in database');
            }
        } catch (error) {
            // If there's an error, revert the changes
            const originalTasks = tasks;
            setTasks(originalTasks);
            localStorage.setItem('tasks', JSON.stringify(originalTasks));
            console.error('Error updating task:', error);
        }

        // After successful update
        setTimeout(() => scrollToTask(taskId), 100); // Small delay to allow for re-render
    };

    const handleOpenAddTaskModal = () => {
        setShowAddTaskModal(true);
    };

    const handleCloseAddTaskModal = () => {
        setShowAddTaskModal(false);
        setNewTask({
            title: "",
            description: "",
            priority: "Medium",
            status: "Pending"
        });
        setTitleError(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Edit task handlers
    const startEditing = (task) => {
        setEditingTask({
            ...task,
            isEditing: true
        });
    };

    const cancelEdit = () => {
        setEditingTask(null);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingTask(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveEdit = async (itemId) => {
        if (!editingTask.title.trim()) return;

        try {
            // If it's a schedule task, just update localStorage
            if (editingTask._id.startsWith('schedule-task-')) {
                const updatedTasks = tasks.map(t => 
                    t._id === editingTask._id ? editingTask : t
                );
                setTasks(updatedTasks);
                localStorage.setItem('tasks', JSON.stringify(updatedTasks));
                setEditingTask(null);
                
                // Add scroll after update
                setTimeout(() => scrollToTask(itemId), 100);
                return;
            }

            // For regular tasks, call the API
            const response = await fetch('/api/task', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingTask._id,
                    title: editingTask.title,
                    description: editingTask.description,
                    priority: editingTask.priority,
                    status: editingTask.status
                }),
            });

            if (response.ok) {
                const { task } = await response.json();
                const updatedTasks = tasks.map(t => 
                    t._id === task._id ? task : t
                );
                setTasks(updatedTasks);
                localStorage.setItem('tasks', JSON.stringify(updatedTasks));
                setEditingTask(null);
                
                // Add scroll after update
                setTimeout(() => scrollToTask(itemId), 100);
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            // If it's a schedule task, just remove from localStorage
            if (taskId.startsWith('schedule-task-')) {
                const updatedTasks = tasks.filter(task => task._id !== taskId);
                setTasks(updatedTasks);
                localStorage.setItem('tasks', JSON.stringify(updatedTasks));
                return;
            }

            // For regular tasks, call the API
            const response = await fetch(`/api/task?ids=${taskId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const updatedTasks = tasks.filter(task => task._id !== taskId);
                setTasks(updatedTasks);
                localStorage.setItem('tasks', JSON.stringify(updatedTasks));
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleSaveTask = async () => {
        setTitleError(false);
        
        if (!newTask.title.trim()) {
            setTitleError(true);
            return;
        }

        try {
            const response = await fetch('/api/task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTask),
            });

            if (response.ok) {
                const data = await response.json();
                const updatedTasks = [...tasks, data.task];
                setTasks(updatedTasks);
                localStorage.setItem('tasks', JSON.stringify(updatedTasks));
                handleCloseAddTaskModal();
            }
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const getFilteredAndSortedTasks = () => {
        let filteredTasks = [...tasks];

        // Apply filters
        if (filters.priorities.length > 0) {
            filteredTasks = filteredTasks.filter(task => filters.priorities.includes(task.priority));
        }
        if (filters.statuses.length > 0) {
            filteredTasks = filteredTasks.filter(task => filters.statuses.includes(task.status));
        }

        // Always apply sorting
        filteredTasks.sort((a, b) => {
            let comparison = 0;
            
            if (sortConfig.field === 'priority') {
                comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (sortConfig.field === 'status') {
                comparison = statusOrder[a.status] - statusOrder[b.status];
            }

            // For desc (default), we want High to Low (priority) or Completed to Pending (status)
            // For asc, we want Low to High (priority) or Pending to Completed (status)
            return sortConfig.direction === 'desc' ? comparison : -comparison;
        });

        return filteredTasks;
    };

    const handleFilterPriorityChange = (priority) => {
        setFilters(prev => {
            const priorities = prev.priorities.includes(priority)
                ? prev.priorities.filter(p => p !== priority)
                : [...prev.priorities, priority];
            return { ...prev, priorities };
        });
    };

    const handleFilterStatusChange = (status) => {
        setFilters(prev => {
            const statuses = prev.statuses.includes(status)
                ? prev.statuses.filter(s => s !== status)
                : [...prev.statuses, status];
            return { ...prev, statuses };
        });
    };

    const handleFilterClick = () => {
        setShowFilterPanel(!showFilterPanel);
    };

    const handleApplyChanges = () => {
        // Save current filters and sort config to localStorage
        localStorage.setItem('taskFilters', JSON.stringify(filters));
        localStorage.setItem('taskSortConfig', JSON.stringify(sortConfig));
        setShowFilterPanel(false);
    };

    const StatusButton = ({ taskId, currentStatus }) => {
        const textStyle = {
            fontFamily: "'VT323', monospace",
            fontSize: "1.2rem"
        };
        
        const getStatusStyles = () => {
            switch (currentStatus) {
                case 'Pending':
                    return 'border-blue-200 text-blue-800 bg-blue-50/90 hover:bg-blue-100';
                case 'In Progress':
                    return 'border-blue-400 text-white bg-blue-500 hover:bg-blue-600';
                case 'Completed':
                    return 'border-blue-900 text-white bg-blue-900 hover:bg-blue-950';
                default:
                    return 'border-blue-200 text-blue-800';
            }
        };

        const getStatusIcon = () => {
            switch (currentStatus) {
                case 'Pending':
                    return <Circle size={16} />;
                case 'In Progress':
                    return <Clock size={16} />;
                case 'Completed':
                    return <CheckCircle2 size={16} />;
                default:
                    return <Circle size={16} />;
            }
        };

        return (
            <div className="relative">
                <button
                    ref={el => buttonRefs.current[taskId] = el}
                    onClick={() => setActiveStatusDropdown(activeStatusDropdown === taskId ? null : taskId)}
                    className={`flex items-center px-3 py-1 rounded-md border ${getStatusStyles()}`}
                    style={textStyle}
                >
                    <span className="flex items-center gap-2 text-sm">
                        {getStatusIcon()}
                        {currentStatus}
                    </span>
                </button>
                
                {activeStatusDropdown === taskId && createPortal(
                    <>
                        <div 
                            className="fixed inset-0 bg-black/10"
                            style={{ zIndex: 999 }}
                            onClick={() => setActiveStatusDropdown(null)}
                        />
                        
                        <div 
                            className="fixed bg-white rounded-md shadow-lg border border-gray-200 whitespace-nowrap"
                            style={{
                                zIndex: 1000,
                                top: buttonRefs.current[taskId]?.getBoundingClientRect().bottom + 4,
                                left: buttonRefs.current[taskId]?.getBoundingClientRect().left,
                            }}
                        >
                            {['Pending', 'In Progress', 'Completed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        handleStatusChange(taskId, { status });
                                        setActiveStatusDropdown(null);
                                    }}
                                    className={`flex items-center gap-2 w-full px-4 py-2 text-left text-sm
                                        bg-white text-gray-700
                                        ${status === 'Pending' 
                                            ? 'hover:bg-blue-50/90 hover:text-blue-800 rounded-t-md border-b-2' :
                                        status === 'In Progress' 
                                            ? 'hover:bg-blue-500 hover:text-white border-b-2' :
                                        'hover:bg-blue-900 hover:text-white rounded-b-md'
                                    }`}
                                    style={textStyle}
                                >
                                    {status === 'Pending' && <Circle size={16} />}
                                    {status === 'In Progress' && <Clock size={16} />}
                                    {status === 'Completed' && <CheckCircle2 size={16} />}
                                    {status}
                                </button>
                            ))}
                        </div>
                    </>,
                    document.body
                )}
            </div>
        );
    };

    // Add function to scroll to task
    const scrollToTask = (taskId) => {
        if (taskListRef.current && taskRefs.current[taskId]) {
            const taskElement = taskRefs.current[taskId];
            const listElement = taskListRef.current;
            
            // Calculate scroll position
            const taskTop = taskElement.offsetTop;
            const listHeight = listElement.clientHeight;
            
            // Scroll the task into view with some padding
            listElement.scrollTo({
                top: taskTop - listHeight / 3,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex-1 p-8 mt-24 relative z-10">
                <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow p-4">
                    <h2 className="text-2xl text-[#E6C86E] font-bold mb-4" style={{
                        fontFamily: "'Press Start 2P', monospace",
                        letterSpacing: "0.5px",
                        textShadow: "2px 2px 0 #000"
                    }}>Quests</h2>
                    <p style={textStyle}>Loading your quests <span className="loading loading-dots loading-xs"></span></p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 mt-24 relative z-10">
            {/* Main Content */}
            <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl text-[#E6C86E] font-bold" style={{
                        fontFamily: "'Press Start 2P', monospace",
                        letterSpacing: "0.5px",
                        textShadow: "2px 2px 0 #000"
                    }}>Quests</h2>
                    
                    <button
                        onClick={handleFilterClick}
                        className={`p-2 rounded-full ${
                            showFilterPanel 
                                ? 'bg-blue-500 text-white border-blue-500' 
                                : 'text-gray-700 hover:bg-blue-500 hover:text-white'
                        }`}
                    >
                        <Filter size={18} />
                    </button>
                </div>

                {/* Add Legend */}
                <div className="flex flex-wrap gap-2 mb-3 ml-2">
                    <div className="flex items-center text-xs" style={textStyle}>
                        <div className="w-3 h-3 bg-green-100 border border-green-500 rounded mr-1"></div>
                        <span>Low Priority</span>
                    </div>
                    <div className="flex items-center text-xs" style={textStyle}>
                        <div className="w-3 h-3 bg-yellow-100 border border-yellow-500 rounded mr-1"></div>
                        <span>Medium Priority</span>
                    </div>
                    <div className="flex items-center text-xs" style={textStyle}>
                        <div className="w-3 h-3 bg-red-100 border border-red-500 rounded mr-1"></div>
                        <span>High Priority</span>
                    </div>
                </div>

                {showFilterPanel ? (
                    <div className="mb-4 bg-white/50 p-4 rounded-lg ml-2">
                        <div className="space-y-4">
                            {/* Priority Filter */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-600 block" style={textStyle}>Priority:</label>
                                <div className="flex flex-wrap gap-2">
                                    {['High', 'Medium', 'Low'].map(priority => (
                                        <button
                                            key={priority}
                                            onClick={() => handleFilterPriorityChange(priority)}
                                            className={`px-3 py-1 text-sm rounded-full border ${
                                                filters.priorities.includes(priority)
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                            }`}
                                            style={textStyle}
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Status Filter */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-600 block" style={textStyle}>Status:</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Pending', 'In Progress', 'Completed'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleFilterStatusChange(status)}
                                            className={`px-3 py-1 text-sm rounded-full border ${
                                                filters.statuses.includes(status)
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                            }`}
                                            style={textStyle}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort Options */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-600 block" style={textStyle}>Sort by:</label>
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={sortConfig.field}
                                        onChange={(e) => setSortConfig(prev => ({ ...prev, field: e.target.value }))}
                                        className="text-sm border rounded p-1"
                                        style={textStyle}
                                    >
                                        <option value="priority">Priority</option>
                                        <option value="status">Status</option>
                                    </select>
                                    <button
                                        onClick={() => setSortConfig(prev => ({
                                            ...prev,
                                            direction: prev.direction === 'asc' ? 'desc' : 'asc'
                                        }))}
                                        className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                                        style={textStyle}
                                    >
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </button>
                                </div>
                            </div>

                            {/* Apply Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleApplyChanges}
                                    className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                                    style={textStyle}
                                >
                                    Apply Changes
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div 
                        ref={taskListRef}
                        className="mb-3 ml-2 flex flex-col max-h-[350px] overflow-y-auto pr-2 space-y-2"
                    >
                        {getFilteredAndSortedTasks().length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm" style={textStyle}>No quests available</p>
                                <p className="text-xs mt-1" style={textStyle}>You can create a new quest by clicking the 'Add Quest' button.</p>
                            </div>
                        ) : (
                            getFilteredAndSortedTasks().map((task) => (
                                <div 
                                    key={task._id} 
                                    ref={el => taskRefs.current[task._id] = el}
                                    className={`flex-1 p-4 rounded relative ${
                                        task.priority === 'High' ? 'bg-red-100/90' :
                                        task.priority === 'Medium' ? 'bg-yellow-100/90' :
                                        'bg-green-100/90'
                                    }`}
                                >
                                    {editingTask && editingTask._id === task._id ? (
                                        <div className="space-y-4 mt-4">
                                            <div>
                                                <label className="text-sm text-gray-600 block mb-1" style={textStyle}>Title</label>
                                                <input 
                                                    type="text"
                                                    name="title"
                                                    value={editingTask.title}
                                                    onChange={handleEditChange}
                                                    className="w-full p-2 text-sm border rounded"
                                                    placeholder="Enter quest title"
                                                    style={{...textStyle, ...inputStyle}}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600 block mb-1" style={textStyle}>Description</label>
                                                <textarea
                                                    name="description"
                                                    value={editingTask.description}
                                                    onChange={handleEditChange}
                                                    className="w-full p-2 text-sm border rounded"
                                                    placeholder="Enter quest description"
                                                    rows="2"
                                                    style={{...textStyle, ...inputStyle}}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600 block mb-1" style={textStyle}>Priority</label>
                                                <select
                                                    name="priority"
                                                    value={editingTask.priority}
                                                    onChange={handleEditChange}
                                                    className="w-full p-2 text-sm border rounded"
                                                    style={{...textStyle, ...inputStyle}}
                                                >
                                                    <option value="Low">Low Priority</option>
                                                    <option value="Medium">Medium Priority</option>
                                                    <option value="High">High Priority</option>
                                                </select>
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                                <button 
                                                    onClick={() => saveEdit(task._id)}
                                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                                                    style={textStyle}
                                                >
                                                    <span className="flex items-center">
                                                        <Check size={14} className="mr-1" />
                                                        Save
                                                    </span>
                                                </button>
                                                <button 
                                                    onClick={cancelEdit}
                                                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                                                    style={textStyle}
                                                >
                                                    <span className="flex items-center">
                                                        <X size={14} className="mr-1" />
                                                        Cancel
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex-1">
                                                <div className="flex flex-row items-center gap-2">
                                                    <StatusButton
                                                        taskId={task._id}
                                                        currentStatus={task.status}
                                                    />
                                                    <div className="flex flex-row justify-between flex-1">
                                                        <h3 className={`font-semibold ${task.status === 'Completed' ? 'line-through text-gray-500' : ''}`} style={textStyle}>
                                                            {task.title}
                                                        </h3>
                                                        <div className="flex space-x-1 items-start pt-1">
                                                            <button 
                                                                onClick={() => startEditing(task)}
                                                                className="text-gray-500 hover:text-blue-500"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteTask(task._id)}
                                                                className="text-gray-500 hover:text-red-500"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {task.description && (
                                                    <p className={`text-sm text-gray-600 mt-1 ${task.status === 'Completed' ? 'line-through' : ''}`} style={textStyle}>
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Add Task button */}
                <div className="flex justify-end pr-2">
                    <button
                        onClick={handleOpenAddTaskModal}
                        className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md font-pixel"
                    >
                        Add Quest
                    </button>
                </div>
            </div>

            {/* ADD-TASK MODAL */}
            {showAddTaskModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg text-[#E6C86E] font-semibold mb-4" style={{
                            fontFamily: "'Press Start 2P', monospace",
                            letterSpacing: "0.5px",
                            textShadow: "2px 2px 0 #000"
                        }}>Add New Quest</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600 block mb-1" style={textStyle}>Title</label>
                                <input 
                                    type="text" 
                                    name="title"
                                    value={newTask.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter task title"
                                    className="w-full p-2 text-sm border rounded"
                                    style={{...textStyle, ...inputStyle}}
                                />
                                {titleError && (
                                    <p className="text-red-500 text-xs mt-1" style={textStyle}>Title is required</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1" style={textStyle}>Description</label>
                                <textarea 
                                    name="description"
                                    value={newTask.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter task description (optional)"
                                    className="w-full p-2 text-sm border rounded"
                                    style={{...textStyle, ...inputStyle}}
                                    rows="3"
                                ></textarea>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1" style={textStyle}>Priority</label>
                                <select
                                    name="priority"
                                    value={newTask.priority}
                                    onChange={handleInputChange}
                                    className="w-full p-2 text-sm border rounded"
                                    style={{...textStyle, ...inputStyle}}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button 
                                onClick={handleCloseAddTaskModal}
                                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                                style={textStyle}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveTask}
                                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                                style={textStyle}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ToDoList;