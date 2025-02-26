'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function TalkingAvatar() {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const speechSynthesis = useRef(null);

  const messages = [
    "Welcome to FirstTest! I'm here to help you get started.",
    "Would you like to know more about our feedback collection system?",
    "Feel free to explore our pricing plans and FAQ section.",
    "Need help? Just click on me and I'll guide you through!"
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis.current = window.speechSynthesis;
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = speechSynthesis.current.getVoices();
        const englishVoices = availableVoices.filter(voice => voice.lang.includes('en'));
        setVoices(englishVoices);
        // Set default voice (preferring female voice)
        const defaultVoice = englishVoices.find(voice => voice.name.includes('Female')) || englishVoices[0];
        setSelectedVoice(defaultVoice);
      };

      // Chrome needs this event to load voices
      speechSynthesis.current.onvoiceschanged = loadVoices;
      loadVoices(); // Initial load for other browsers
    }
    
    return () => {
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
      }
    };
  }, []);

  const speak = (text) => {
    if (speechSynthesis.current && !isMuted && selectedVoice) {
      speechSynthesis.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = 1.0;
      utterance.pitch = 0.9;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesis.current.speak(utterance);
    }
  };

  const handleAvatarClick = () => {
    setIsTyping(true);
    setCurrentMessage('');
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    let index = 0;

    const typingInterval = setInterval(() => {
      setCurrentMessage((prev) => {
        if (index < randomMessage.length) {
          index++;
          return randomMessage.slice(0, index);
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          speak(randomMessage);
          return randomMessage;
        }
      });
    }, 50);
  };

  const toggleMute = () => {
    if (isSpeaking && !isMuted) {
      speechSynthesis.current?.cancel();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    handleAvatarClick();
  }, []);

  return (
    <section className="bg-base-100 py-16">
      <div className="max-w-3xl mx-auto px-8 flex items-center gap-8">
        <div className="relative">
          <div 
            className="relative w-32 h-32 cursor-pointer transition-transform hover:scale-105"
            onClick={handleAvatarClick}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse" />
            <Image
              src="/avatar-ai.png"
              alt="AI Assistant"
              width={128}
              height={128}
              className={`rounded-full relative z-10 ${isSpeaking ? 'animate-bounce-subtle' : ''}`}
              priority
            />
            {(isTyping || isSpeaking) && (
              <span className="absolute bottom-0 right-0 size-4 bg-green-500 rounded-full z-20 animate-bounce" />
            )}
          </div>
          
          {/* Speech Controls */}
          <div className="absolute -bottom-4 right-0 z-30 flex items-center gap-2">
            <button
              onClick={() => setShowControls(!showControls)}
              className="bg-base-100 rounded-full p-2 shadow-md hover:bg-base-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={toggleMute}
              className="bg-base-100 rounded-full p-2 shadow-md hover:bg-base-200"
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06z" />
                </svg>
              )}
            </button>
          </div>

            {/* Voice Selection Panel */}
            {showControls && (
              <div className="absolute -left-4 -bottom-24 z-30 bg-base-100 p-4 rounded-lg shadow-lg w-64">
                <div>
                  <label className="text-sm opacity-70 block mb-2">Voice</label>
                  <select 
                    value={selectedVoice?.name || ''}
                    onChange={(e) => setSelectedVoice(voices.find(v => v.name === e.target.value))}
                    className="select select-bordered select-sm w-full"
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="chat chat-start">
              <div className="chat-bubble min-h-12">
                {currentMessage}
                {isTyping && <span className="animate-pulse">▋</span>}
              </div>
            </div>
          </div>
        </div>
      </section>
  );
} 