"use client";
import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { Calendar, AlertCircle } from 'lucide-react';

function UserAnalysis() {
  const [report, setReport] = useState('');
  const [efficiencyScore, setEfficiencyScore] = useState(0);
  const [tasksCompleted, setTaskCompleted] = useState(0);
  const [analysisDate, setAnalysisDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    const storageData = localStorage.getItem('analysis');
    const parsedData = storageData ? JSON.parse(storageData) : null;

    if (parsedData && parsedData.report) {
      setReport(parsedData.report);
      setEfficiencyScore(parsedData.efficiencyScore);
      setTaskCompleted(parsedData.tasksCompleted);
      setAnalysisDate(parsedData.date);
      setError(false);
    } else {
      setError(true);
    }
    setLoading(false);
  };

  const regenerateAnalysis = async () => {
    setIsGenerating(true);
    
    try {
      const tasksData = localStorage.getItem('tasks');
      const tasks = tasksData ? JSON.parse(tasksData) : [];

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'analysis',
          data: { tasks }
        })
      });

      if (!response.ok) throw new Error('Failed to fetch analysis');
      
      const data = await response.json();
      
      if (data.response && data.efficiencyScore) {
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const newAnalysis = {
          date: yesterdayStr,
          report: data.response,
          efficiencyScore: data.efficiencyScore,
          tasksCompleted: data.tasksCompleted
        };
        localStorage.setItem('analysis', JSON.stringify(newAnalysis));
        await loadReport();
        setError(false);
      } else {
        throw new Error('Invalid analysis data received');
      }
    } catch (error) {
      console.error('Error regenerating analysis:', error);
      setError(true);
    } finally {
      setIsGenerating(false);
      loadReport()
    }
  };

  // Format date to be more readable
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Create date in local timezone
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-based in Date constructor
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC' // Ensure consistent date display
    });
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 mt-24 relative z-10">
        <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow p-4">
          <h2 className="text-2xl text-[#E6C86E] font-bold mb-4" style={{
            fontFamily: "'Press Start 2P', monospace",
            letterSpacing: "0.5px",
            textShadow: "2px 2px 0 #000"
          }}>Analysis</h2>
          <p>Loading your efficiency analysis <span className="loading loading-dots loading-xs"></span></p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 mt-24 relative z-10">
        <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow p-4">
          <h2 className="text-2xl text-[#E6C86E] font-bold mb-4" style={{
            fontFamily: "'Press Start 2P', monospace",
            letterSpacing: "0.5px",
            textShadow: "2px 2px 0 #000"
          }}>Analysis</h2>
          <div className="flex items-center text-red-500 mb-2">
            <AlertCircle size={18} className="mr-2" />
            <p>No analysis found</p>
          </div>
          <p className="text-sm text-gray-600">
            You can generate an analysis by clicking the "Generate Analysis" button.
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={regenerateAnalysis}
              className={`px-3 py-1 rounded transition-colors ${
                  isGenerating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
            >
              {isGenerating ? 'Generating Analysis...' : 'Generate Analysis'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 mt-24 relative z-10">
      <div className="bg-white/70 backdrop-blur-sm w-3/4 max-w-2xl mx-auto mt-8 rounded-lg shadow-lg p-4">
        <div className="flex flex-row justify-between">
          <h2 className="text-xl text-[#E6C86E] font-bold mb-4" style={{
            fontFamily: "'Press Start 2P', monospace",
            letterSpacing: "0.5px",
            textShadow: "2px 2px 0 #000"
          }}>Analysis</h2>
          <div className="flex items-center mb-3 text-sm text-gray-700">
            <Calendar size={16} className="mr-1" />
            <span>{formatDate(analysisDate)}</span>
          </div>
        </div>

        <div className="max-h-[450px] overflow-y-auto pr-2">
          {/* Circles row with default values */}
          <div className="flex justify-evenly mb-4">
            <div className="flex flex-col items-center">
              <p className="text-sm mb-1 font-semibold">Efficiency Score</p>
              <div className="w-20 h-20 flex items-center justify-center rounded-full border-2 bg-blue-50/90">
                <span className="text-xl font-semibold">{efficiencyScore}</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-sm mb-1 font-semibold">Tasks Completed</p>
              <div className="w-20 h-20 flex items-center justify-center rounded-full border-2 bg-green-50/90">
                <span className="text-xl font-semibold">{tasksCompleted}</span>
              </div>
            </div>
          </div>

          <div className="w-full border rounded-lg p-4 bg-white">
            <h3 className="text-lg font-bold text-center mb-2">Report Summary</h3>
            <div className="prose prose-sm max-w-none text-sm">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserAnalysis;

<style jsx>{`
  .font-pixel {
    font-family: 'Press Start 2P', monospace;
    letter-spacing: 0.5px;
  }
  
  .pixel-shadow {
    text-shadow: 2px 2px 0 #000;
  }

  .backface-hidden {
    backface-visibility: hidden;
  }
  
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
`}</style>
