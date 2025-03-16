"use client";
import React, { useState, useEffect } from "react";
import { Edit2, Check, X, Trash2, Filter } from 'lucide-react';

function ToDoList() {
    const [tasks, setTasks] = useState([]);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        priority: "Medium",
        status: "Pending"
    });
    const [editingTask, setEditingTask] = useState(null);
    const [filters, setFilters] = useState({
        priorities: [],
        statuses: []
    });
    const [sortConfig, setSortConfig] = useState({
        field: 'none',
        direction: 'asc'
    });
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [titleError, setTitleError] = useState(false);

    // Fetch tasks on component mount
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const cachedTasks = localStorage.getItem('tasks');
        if (cachedTasks) {
        setTasks(JSON.parse(cachedTasks));
        }
    };

    // ------------------------- Handlers -------------------------
    const handleStatusChange = async (taskId, updates) => {
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

            if (response.ok) {
                const updatedTasks = tasks.map(task => 
                    task._id === taskId ? { ...task, ...updates } : task
                );
                setTasks(updatedTasks);
                localStorage.setItem('tasks', JSON.stringify(updatedTasks));
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
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

    const saveEdit = async () => {
        if (!editingTask.title.trim()) return;

        try {
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
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            const response = await fetch(`/api/task?id=${taskId}`, {
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

        // Apply sorting
        if (sortConfig.field === 'priority') {
            const priorityOrder = { High: 1, Medium: 2, Low: 3 };
            filteredTasks.sort((a, b) => {
                const comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }

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

    return (
        <div className="flex-1 p-8 mt-24 relative z-10">
            {/* Main Content */}
            <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl text-[#E6C86E] font-bold" style={{
                        fontFamily: "'Press Start 2P', monospace",
                        letterSpacing: "0.5px",
                        textShadow: "2px 2px 0 #000"
                    }}>Quests</h2>
                    
                    <button
                        onClick={handleFilterClick}
                        className={`p-2 rounded-full border ${
                            showFilterPanel 
                                ? 'bg-blue-500 text-white border-blue-500' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        <Filter size={16} />
                    </button>
                </div>

                {/* Combined Filter & Sort Panel */}
                {showFilterPanel && (
                    <div className="mb-4 bg-white/50 p-4 rounded-lg">
                        <div className="space-y-4">
                            {/* Priority Filter */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-600 block">Priority:</label>
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
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Status Filter */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-600 block">Status:</label>
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
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort Options */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-600 block">Sort by:</label>
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={sortConfig.field}
                                        onChange={(e) => setSortConfig(prev => ({ ...prev, field: e.target.value }))}
                                        className="text-sm border rounded p-1"
                                    >
                                        <option value="none">None</option>
                                        <option value="priority">Priority</option>
                                    </select>
                                    {sortConfig.field !== 'none' && (
                                        <button
                                            onClick={() => setSortConfig(prev => ({
                                                ...prev,
                                                direction: prev.direction === 'asc' ? 'desc' : 'asc'
                                            }))}
                                            className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                                        >
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Apply Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowFilterPanel(false)}
                                    className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                                >
                                    Apply Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Task List */}
                {!showFilterPanel && (
                    <div className="mb-4 flex flex-col max-h-[350px] overflow-y-auto pr-2 space-y-2">
                        {getFilteredAndSortedTasks().length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">No quests available</p>
                                <p className="text-xs mt-1">Click 'Add Quest' to create your first quest</p>
                            </div>
                        ) : (
                            getFilteredAndSortedTasks().map((task) => (
                                <div key={task._id} className="flex-1 bg-gray-50/90 p-4 rounded relative">
                                    {editingTask && editingTask._id === task._id ? (
                                        <div className="space-y-4 mt-4">
                                            <div>
                                                <label className="text-sm text-gray-600 block mb-1">Title</label>
                                                <input 
                                                    type="text"
                                                    name="title"
                                                    value={editingTask.title}
                                                    onChange={handleEditChange}
                                                    className="w-full p-2 text-sm border rounded"
                                                    placeholder="Enter quest title"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600 block mb-1">Description</label>
                                                <textarea
                                                    name="description"
                                                    value={editingTask.description}
                                                    onChange={handleEditChange}
                                                    className="w-full p-2 text-sm border rounded"
                                                    placeholder="Enter quest description"
                                                    rows="2"
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                                <button 
                                                    onClick={saveEdit}
                                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                                                >
                                                    <span className="flex items-center">
                                                        <Check size={14} className="mr-1" />
                                                        Save
                                                    </span>
                                                </button>
                                                <button 
                                                    onClick={cancelEdit}
                                                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
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
                                                <div className="flex flex-row justify-between">
                                                    <h3 className="font-semibold">{task.title}</h3>
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
                                                {task.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <select
                                                    value={task.priority}
                                                    onChange={(e) => handleStatusChange(task._id, { priority: e.target.value })}
                                                    className={`text-sm border rounded p-1 ${
                                                        task.priority === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                                                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                        'bg-green-100 text-green-800 border-green-200'
                                                    }`}
                                                >
                                                    <option value="Low">Low Priority</option>
                                                    <option value="Medium">Medium Priority</option>
                                                    <option value="High">High Priority</option>
                                                </select>
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleStatusChange(task._id, { status: e.target.value })}
                                                    className="text-sm border rounded p-1"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
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
                        className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                        Add Quest
                    </button>
                </div>
            </div>

            {/* ADD-TASK MODAL */}
            {showAddTaskModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Add New Quest</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Title</label>
                                <input 
                                    type="text" 
                                    name="title"
                                    value={newTask.title}
                                    onChange={handleInputChange}
                                    className={`w-full p-2 text-sm border rounded ${titleError ? 'border-red-500' : ''}`}
                                    placeholder="Enter title"
                                />
                                {titleError && (
                                    <p className="text-red-500 text-xs mt-1">Title is required</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Description</label>
                                <textarea 
                                    name="description"
                                    value={newTask.description}
                                    onChange={handleInputChange}
                                    className="w-full p-2 text-sm border rounded"
                                    placeholder="Enter description"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Priority</label>
                                <select
                                    name="priority"
                                    value={newTask.priority}
                                    onChange={handleInputChange}
                                    className="w-full p-2 text-sm border rounded"
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
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveTask}
                                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
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