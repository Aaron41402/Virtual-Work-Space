"use client";
import React, { useState } from "react";

function ToDoList() {
    const [tasks, setTasks] = useState([
        {
          id: 1,
          title: "Task 1",
          completed: false,
          dueDate: "3/1",
        },
        {
          id: 2,
          title: "Task 2",
          completed: false,
          dueDate: "3/1",
          subTasks: [
            { id: 21, title: "Task 2-1", completed: false },
            {
              id: 22,
              title: "Task 2-2",
              completed: false,
            },
          ],
        },
        {
          id: 3,
          title: "Task 3",
          completed: false,
          dueDate: "3/2",
        },
        {
            id: 4,
            title: "Task 4",
            completed: false,
            dueDate: "3/1",
            subTasks: [
              { id: 21, title: "Task 2-1", completed: false },
              {
                id: 22,
                title: "Task 2-2",
                completed: false,
              },
            ],
          },
          {
            id: 5,
            title: "Task 2",
            completed: false,
            dueDate: "3/1",
            subTasks: [
              { id: 21, title: "Task 2-1", completed: false },
              {
                id: 22,
                title: "Task 2-2",
                completed: false,
              },
            ],
          },
    ]);

    // For the Add-Task modal
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDueDate, setNewTaskDueDate] = useState("");
    const [newSubTasks, setNewSubTasks] = useState([]);

    // ------------------------- Handlers -------------------------
    const handleToggleTaskCompletion = (taskId) => {
        if (!taskId) return;

        setTasks((prevTasks) =>
        prevTasks.map((task) => {
            // Toggle main task
            if (task.id === taskId) {
            return { ...task, completed: !task.completed };
            }
            // Otherwise, check subTasks
            if (task.subTasks && task.subTasks.length > 0) {
            return {
                ...task,
                subTasks: task.subTasks.map((sub) =>
                sub.id === taskId ? { ...sub, completed: !sub.completed } : sub
                ),
            };
            }
            return task;
        })
        );
    };

    const handleOpenAddTaskModal = () => {
        setShowAddTaskModal(true);
    };

    const handleCloseAddTaskModal = () => {
        setShowAddTaskModal(false);
        setNewTaskTitle("");
        setNewTaskDueDate("");
        setNewSubTasks([]);
    };

    const handleAddSubTask = () => {
        const newId = Date.now() + Math.random();
        setNewSubTasks((prev) => [
        ...prev,
        { id: newId, title: "", completed: false },
        ]);
    };

    const handleRemoveSubTask = (index) => {
        setNewSubTasks((prev) => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
        });
    };

    const handleSubTaskTitleChange = (index, value) => {
        setNewSubTasks((prev) => {
        const updated = [...prev];
        updated[index].title = value;
        return updated;
        });
    };

    const handleSaveTask = () => {
        if (!newTaskTitle.trim()) return;

        const newId = Date.now();
        const finalSubTasks = newSubTasks
        .filter((sub) => sub.title.trim().length > 0)
        .map((sub) => ({ ...sub, title: sub.title.trim() }));

        const newTask = {
        id: newId,
        title: newTaskTitle.trim(),
        completed: false,
        dueDate: newTaskDueDate.trim(),
        subTasks: finalSubTasks.length > 0 ? finalSubTasks : undefined,
        };

        setTasks((prev) => [...prev, newTask]);
        handleCloseAddTaskModal();
    };

    return (
        <div className="flex-1 p-8 mt-24 relative z-10">
            {/* Main Content */}
            <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow-lg p-4">
            <h2 className="text-xl text-[#E6C86E] font-bold mb-4" style={{
            fontFamily: "'Press Start 2P', monospace",
            letterSpacing: "0.5px",
            textShadow: "2px 2px 0 #000"
          }}>Quests</h2>
                <div className="mb-4 flex flex-col space-y-2">
                    {tasks.map((task) => (
                    <div key={task.id} className="flex-1 bg-gray-50/90 p-2 rounded text-sm">
                        <div className="flex items-center justify-between space-x-4">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTaskCompletion(task.id)}
                                className="cursor-pointer"
                                aria-label={`Mark ${task.title} as completed`}
                            />
                            <span className={`flex-1 p-1 rounded ${task.completed ? "line-through text-gray-400" : ""}`}>{task.title}</span>
                            <span className="p-1 rounded text-gray-400">{task.dueDate}</span>
                        </div>

                        {/* SUBTASKS */}
                        {task.subTasks && task.subTasks.length > 0 && (
                        <div className="ml-6 mt-2">
                            {task.subTasks.map((sub) => (
                                <div key={sub.id} className="flex items-center space-x-2 mb-1 p-2 rounded bg-gray-200 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={sub.completed}
                                        onChange={() => handleToggleTaskCompletion(sub.id)}
                                        className="cursor-pointer"
                                        aria-label={`Mark ${sub.title} as completed`}
                                    />
                                    <span className={ sub.completed ? "line-through text-gray-400" : "" }>{sub.title}</span>
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                    ))}
                </div>

                {/* Add Task button */}
                <div className="flex justify-end">
                    <button
                        tabIndex={0}
                        aria-label="Open Add Task Modal"
                        onClick={handleOpenAddTaskModal}
                        className="bg-orange-400 text-white px-3 py-1 rounded"
                    >
                        Add Task
                    </button>
                </div>
            </div>

            {/* ADD-TASK MODAL */}
            {showAddTaskModal && (
                <div
                    aria-label="Add Task Modal Overlay"
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                >
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Add New To Do</h3>
                        {/* TITLE INPUT */}
                        <div className="mb-2">
                            <label className="text-sm text-gray-600 block mb-1">Title</label>
                            <input 
                                id="taskTitle"
                                type="text" 
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="Enter to do name"
                                className="w-full p-2 text-sm border rounded"
                                autoFocus
                            />
                        </div>

                        {/* DUE DATE INPUT */}
                        <div className="mb-4">
                            <label className="text-sm text-gray-600 block mb-1">Due Date</label>
                            <input 
                                id="taskTitle"
                                type="text" 
                                value={newTaskDueDate}
                                nChange={(e) => setNewTaskDueDate(e.target.value)}
                                placeholder="Enter due date"
                                className="w-full p-2 text-sm border rounded"
                                autoFocus
                            />
                        </div>

                        {/* SUB-TASKS */}
                        <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">Sub-Tasks</span>
                            <button
                                tabIndex={0}
                                aria-label="Add subtask"
                                onClick={handleAddSubTask}
                                className="bg-gray-200 text-xs px-2 py-1 rounded"
                            >
                                + Add
                            </button>
                        </div>

                        {newSubTasks.map((sub, index) => (
                            <div key={sub.id} className="flex items-center mb-1">
                                <input
                                    type="text"
                                    value={sub.title}
                                    onChange={(e) => handleSubTaskTitleChange(index, e.target.value)}
                                    placeholder={`Sub-task #${index + 1}`}
                                    className="border rounded p-1 w-full mr-2"
                                />
                                <button
                                    tabIndex={0}
                                    aria-label="Remove subtask"
                                    onClick={() => handleRemoveSubTask(index)}
                                    className="text-gray-500 hover:text-red-500"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 
                                            2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-8V5a1 
                                            1 0 00-1-1h-4a1 1 0 00-1 1v2m-3 0h12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex justify-end space-x-3">
                            <button 
                                aria-label="Cancel add to do"
                                onClick={handleCloseAddTaskModal}
                                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                            >
                                Cancel
                            </button>
                            <button 
                                aria-label="Save new to do"
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
    )
}

export default ToDoList