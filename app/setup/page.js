"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Loader from "@/components/Loader";

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
  const [showSurvey, setShowSurvey] = useState(false);
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

  // Add this effect to ensure video plays
  useEffect(() => {
    if (!showSurvey) {
      const videoElement = document.querySelector('video');
      if (videoElement) {
        const playPromise = videoElement.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Autoplay was prevented:", error);
            // Show a play button or message if autoplay is blocked
          });
        }
      }
    }
  }, [showSurvey]);

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

  const handleVideoEnded = () => {
    setShowSurvey(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/setupBackground.png" 
          alt="Setup Background" 
          layout="fill" 
          objectFit="cover" 
          priority
        />
      </div>

      {!showSurvey ? (
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 overflow-hidden">
            <video 
              className="w-full h-full object-cover"
              autoPlay 
              muted
              playsInline
              controls={false}
              onEnded={handleVideoEnded}
            >
              <source src="/TASKHERO.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="relative z-20 mt-auto mb-8">
            <button 
              onClick={() => setShowSurvey(true)} 
              className="px-6 py-2 bg-black hover:bg-slate-800 text-white rounded-md mx-auto block"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
</svg>

            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full mx-auto p-6 bg-white/70 shadow-md rounded-lg">
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
      )}
    </div>
  );
}
