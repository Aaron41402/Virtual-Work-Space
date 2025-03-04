"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const questions = [
  { id: "wakeTime", question: "What time do you usually wake up?", type: "time" },
  { id: "bedTime", question: "What time do you usually go to bed?", type: "time" },
  { id: "habits", question: "Do you have any recurring habits or activities?", type: "text" },
  { id: "priorities", question: "What are your top priorities for most days?", type: "text" }
];

export default function SetupPage() {
  const { data: session, status } = useSession();
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user has already completed setup
  useEffect(() => {
    const checkSetupStatus = async () => {
      if (status === "loading") return;
      
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/setup");
        const data = await response.json();
        
        if (data.hasSetup) {
          // User has already completed setup, redirect to dashboard
          router.push("/dashboard");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking setup status:", error);
        setLoading(false);
      }
    };

    checkSetupStatus();
  }, [session, status, router]);

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      setMessage("You must be logged in to submit.");
      return;
    }

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      const result = await response.json();
      setMessage(result.message || result.error);
      
      if (response.ok && result.redirect) {
        // Redirect to dashboard after successful submission
        router.push(result.redirect);
      }
    } catch (error) {
      console.error("Error submitting setup:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><span className="loading loading-bars loading-xl"></span></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full mx-auto p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Setup Survey</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((q) => (
            <div key={q.id}>
              <label className="block font-medium">{q.question}</label>
              <input
                type={q.type}
                name={q.id}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded-md"
              />
            </div>
          ))}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md">
            Submit
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
