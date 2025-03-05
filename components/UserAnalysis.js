"use client";
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function UserAnalysis() {
  // 30 data points, each with date, efficiency score, and tasksCompleted
  const [efficiencyData] = useState([
    { date: "2023-01-01", score: 75, tasksCompleted: 5 },
    { date: "2023-01-02", score: 80, tasksCompleted: 7 },
    { date: "2023-01-03", score: 60, tasksCompleted: 3 },
    { date: "2023-01-04", score: 90, tasksCompleted: 9 },
    { date: "2023-01-05", score: 55, tasksCompleted: 4 },
    { date: "2023-01-06", score: 70, tasksCompleted: 6 },
    { date: "2023-01-07", score: 67, tasksCompleted: 5 },
    { date: "2023-01-08", score: 65, tasksCompleted: 3 },
    { date: "2023-01-09", score: 58, tasksCompleted: 2 },
    { date: "2023-01-10", score: 72, tasksCompleted: 4 },
    { date: "2023-01-11", score: 68, tasksCompleted: 5 },
    { date: "2023-01-12", score: 81, tasksCompleted: 7 },
    { date: "2023-01-13", score: 66, tasksCompleted: 3 },
    { date: "2023-01-14", score: 59, tasksCompleted: 3 },
    { date: "2023-01-15", score: 79, tasksCompleted: 6 },
    { date: "2023-01-16", score: 90, tasksCompleted: 9 },
    { date: "2023-01-17", score: 84, tasksCompleted: 8 },
    { date: "2023-01-18", score: 76, tasksCompleted: 6 },
    { date: "2023-01-19", score: 60, tasksCompleted: 3 },
    { date: "2023-01-20", score: 73, tasksCompleted: 5 },
    { date: "2023-01-21", score: 77, tasksCompleted: 7 },
    { date: "2023-01-22", score: 82, tasksCompleted: 8 },
    { date: "2023-01-23", score: 69, tasksCompleted: 4 },
    { date: "2023-01-24", score: 62, tasksCompleted: 3 },
    { date: "2023-01-25", score: 91, tasksCompleted: 9 },
    { date: "2023-01-26", score: 88, tasksCompleted: 7 },
    { date: "2023-01-27", score: 70, tasksCompleted: 4 },
    { date: "2023-01-28", score: 66, tasksCompleted: 3 },
    { date: "2023-01-29", score: 85, tasksCompleted: 6 },
    { date: "2023-01-30", score: 79, tasksCompleted: 5 },
  ]);

  // Duration can be "today", "7", or "30"
  const [chartDuration, setChartDuration] = useState("today");

  // Filter data based on duration
  let filtered;
  if (chartDuration === "today") {
    // "Today" => last data point only (or real date check if desired)
    filtered = [efficiencyData[efficiencyData.length - 1]];
  } else if (chartDuration === "7") {
    filtered = efficiencyData.slice(-7);
  } else {
    filtered = efficiencyData; // all 30
  }

  // Compute average efficiency & total tasks
  const totalScore = filtered.reduce((acc, dp) => acc + dp.score, 0);
  const averageEfficiency = Math.round(totalScore / filtered.length);
  const totalTasksCompleted = filtered.reduce((acc, dp) => acc + dp.tasksCompleted, 0);

  // ChartJS data (dates & scores from filtered slice)
  const labels = filtered.map((dp) => dp.date);
  const scores = filtered.map((dp) => dp.score);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Efficiency",
        data: scores,
        borderColor: "rgb(249 115 22 / 0.6)", // orange-500
        backgroundColor: "rgb(249 115 22)",
        tension: 0.3,
      },
    ],
  };
  // Simplify the chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="flex-1 p-8 relative z-10">
      <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow-lg p-4">
        <div className="flex flex-row justify-between mb-6">
          <h2 className="text-xl font-bold">Analysis</h2>
          <select
            tabIndex={0}
            aria-label="Select chart duration"
            value={chartDuration}
            onChange={(e) => setChartDuration(e.target.value)}
            className="border bg-white rounded px-3 py-1 text-sm"
          >
            <option value="today">Today</option>
            <option value="7">Past 7 days</option>
            <option value="30">Past 30 days</option>
          </select>
        </div>

        {/* Circles row */}
        <div className="flex justify-evenly mb-8">
          {/* Efficiency Score */}
          <div className="flex flex-col items-center">
            <p className="text-sm mb-1">Efficiency Score</p>
            <div className="w-20 h-20 flex items-center justify-center rounded-full border-2 bg-blue-50/90">
              <span className="text-xl font-semibold">{averageEfficiency}</span>
            </div>
          </div>

          {/* Tasks Completed */}
          <div className="flex flex-col items-center">
            <p className="text-sm mb-1">Tasks Completed</p>
            <div className="w-20 h-20 flex items-center justify-center rounded-full border-2 bg-green-50/90">
              <span className="text-xl font-semibold">{totalTasksCompleted}</span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="border rounded-lg p-4 bg-white mt-6">
          <div style={{ width: '100%', height: '400px', position: 'relative' }}>
            {filtered.length > 0 ? (
              <Line 
                data={chartData}
                options={chartOptions}
              />
            ) : (
              <div>No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserAnalysis