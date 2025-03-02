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
        <div className="flex-1 p-8 relative z-10">
            <div className="bg-white/90 backdrop-blur-sm w-1/2 mx-auto mt-16 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">To-Do List</h2>
                <div className="mb-4 flex flex-col space-y-2">
                    {tasks.map((task) => (
                    <div key={task.id} className="pl-2 border rounded p-2">
                        <div className="flex items-center justify-between space-x-4">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTaskCompletion(task.id)}
                                className="cursor-pointer"
                                aria-label={`Mark ${task.title} as completed`}
                            />
                            <span className="flex-1 p-3 rounded">{task.title}</span>
                            <span className="w-12 text-gray-600">{task.dueDate}</span>
                        </div>

                        {/* SUBTASKS */}
                        {task.subTasks && task.subTasks.length > 0 && (
                        <div className="ml-6 mt-2">
                            {task.subTasks.map((sub) => (
                                <div key={sub.id} className="flex items-center space-x-2 mb-1">
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
                    tabIndex={0}
                    aria-label="Add Task Modal Overlay"
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                >
                    <div className="bg-white p-4 rounded shadow w-80">
                        <h2 className="text-lg font-bold mb-2">Add New Task</h2>
                        
                        {/* TITLE INPUT */}
                        <label className="block mb-1" htmlFor="taskTitle">Title</label>
                        <input
                            id="taskTitle"
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="border rounded p-1 w-full mb-2"
                        />

                        {/* DUE DATE INPUT */}
                        <label className="block mb-1" htmlFor="dueDate">Due Date</label>
                        <input
                            id="dueDate"
                            type="text"
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            className="border rounded p-1 w-full mb-2"
                        />

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
                        <div className="flex justify-end space-x-2">
                            <button
                                tabIndex={0}
                                aria-label="Cancel add task"
                                onClick={handleCloseAddTaskModal}
                                className="bg-gray-300 px-3 py-1 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                tabIndex={0}
                                aria-label="Save new task"
                                onClick={handleSaveTask}
                                className="bg-orange-400 text-white px-3 py-1 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ToDoList