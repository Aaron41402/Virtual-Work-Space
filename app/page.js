import ButtonLogin from "@/components/ButtonLogin";
import ParallaxHero from "@/components/ParallaxHero";
import { auth } from "@/auth";
import Image from "next/image";
import "./pixel-styles.css";


export default async function Home() {
  const session = await auth();
  
  // Define carousel images
  const carouselImages = [
    { src: '/landing1.png', alt: 'TaskHero Dashboard' },
    { src: '/landing2.png', alt: 'TaskHero Features' },
    // Add more images if you have them
  ];

  return (
    <main className="font-pixel">
      {/* Header */}
      <section className="bg-[#2A2136] text-white border-b-4 border-[#E6C86E]">
        <div className="flex justify-between items-center px-8 py-4 mx-auto max-w-5xl">
          <div className="font-extrabold flex items-center">
            <Image 
              src="/favicon.ico" 
              alt="TaskHero Logo" 
              width={32} 
              height={32} 
              className="mr-2"
            />
            <span className="text-[#E6C86E] pixel-shadow text-xl">TaskHero</span>
          </div>
          <div><ButtonLogin session={session}/></div>
        </div>
      </section>

      {/* Hero - replaced with ParallaxHero component */}
      <ParallaxHero session={session} />
      
      {/* About Section with Video Showcase */}
      <section className="bg-[#2A2136] text-white py-16 border-t-4 border-b-4 border-[#E6C86E]">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center text-[#E6C86E] mb-8 pixel-shadow">How TaskHero Works</h2>
          
          {/* Simple explanation - moved to top */}
          <div className="mb-8">
            <div className="bg-[#3A2E56] p-6 border-4 border-[#8BABBF] rounded-lg shadow-pixel">
              <p className="text-white text-lg leading-relaxed">
                TaskHero turns productivity into a game. Complete tasks to earn XP, level up with AI assistance, and stay focused with your capybara companion. Make work fun in our pixel art world!
              </p>
            </div>
          </div>
          
          {/* Video showcase - now full width */}
          <div className="w-full">
            <div className="border-4 border-[#FF6B97] shadow-pixel overflow-hidden bg-[#3A2E56] rounded-lg">
              <video 
                width="100%" 
                height="auto" 
                controls 
                className="w-full"
                poster="/video-poster.png"
              >
                <source src="/taskhero-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Capybara Pomodoro Section */}
      <section className="bg-[#3A2E56] text-white py-20 border-t-4 border-b-4 border-[#E6C86E]">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center text-[#E6C86E] mb-8 pixel-shadow">Meet Your Productivity Companion</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <div className="bg-[#2A2136] p-6 border-4 border-[#FF6B97] rounded-lg shadow-pixel">
                <h3 className="text-2xl font-bold text-[#FF6B97] mb-4">Train Your Capybara!</h3>
                <p className="text-[#8BABBF] mb-6 text-lg">
                  Work with your capybara friend using the Pomodoro technique. Stay focused, take breaks, and boost productivity!
                </p>
                <ul className="list-disc list-inside text-[#8BABBF] mb-6 space-y-2">
                  <li>Customize with fun skins and outfits</li>
                  <li>Take timed breaks together</li>
                  <li>Boost productivity with a furry friend</li>
                </ul>
                
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative">
                {/* Video showcase */}
                <div className="border-4 border-[#E6C86E] shadow-pixel mb-6 overflow-hidden">
                  <video 
                    width="100%" 
                    height="auto" 
                    controls 
                    className="bg-[#2A2136]"
                  >
                    <source src="/capydoro.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                {/* Capybara animations */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-[#8BABBF] p-2 bg-[#2A2136] shadow-pixel">
                    <img src="/Capybara_walk_left_chicken.gif" alt="Chicken Hat Capybara" className="w-full" />
                    <p className="text-center text-sm mt-2 text-[#8BABBF]">Chicken Hat</p>
                  </div>
                  <div className="border-2 border-[#8BABBF] p-2 bg-[#2A2136] shadow-pixel">
                    <img src="/Capybara_walk_left_pumpkin.gif" alt="Pumpkin Hat Capybara" className="w-full" />
                    <p className="text-center text-sm mt-2 text-[#8BABBF]">Pumpkin Hat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Emi Section */}
      <section className="bg-[#2A2136] text-white py-20 border-t-4 border-[#E6C86E]">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center text-[#E6C86E] mb-8 pixel-shadow">Meet Emi, Your AI Companion</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 order-2 md:order-1">
              <div className="relative">
                {/* Video showcase */}
                <div className="border-4 border-[#FF6B97] shadow-pixel mb-6 overflow-hidden">
                  <video 
                    width="100%" 
                    height="auto" 
                    controls 
                    className="bg-[#2A2136]"
                  >
                    <source src="/Emi_exhibition.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                {/* Emi's expressions */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="border-2 border-[#8BABBF] p-2 bg-[#3A2E56] shadow-pixel">
                    <img src="/woman_nice.png" alt="Emi being nice" className="w-full" />
                  </div>
                  <div className="border-2 border-[#8BABBF] p-2 bg-[#3A2E56] shadow-pixel">
                    <img src="/woman_happy.png" alt="Emi being happy" className="w-full" />
                  </div>
                  <div className="border-2 border-[#8BABBF] p-2 bg-[#3A2E56] shadow-pixel">
                    <img src="/woman_impressed.png" alt="Emi being impressed" className="w-full" />
                  </div>
                  <div className="border-2 border-[#8BABBF] p-2 bg-[#3A2E56] shadow-pixel">
                    <img src="/woman_angry.png" alt="Emi being stern" className="w-full" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 order-1 md:order-2">
              <div className="bg-[#3A2E56] p-6 border-4 border-[#8BABBF] rounded-lg shadow-pixel">
                <h3 className="text-2xl font-bold text-[#FF6B97] mb-4">Your Intelligent Assistant</h3>
                <p className="text-white mb-6 text-lg">
                  Emi helps you stay on track and maximize your potential every day.
                </p>
                <ul className="space-y-4 mb-6">
                  <li className="flex items-start">
                    <span className="text-[#E6C86E] mr-2">✓</span>
                    <span className="text-[#8BABBF]">Tracks your schedule and tasks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#E6C86E] mr-2">✓</span>
                    <span className="text-[#8BABBF]">Analyzes productivity patterns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#E6C86E] mr-2">✓</span>
                    <span className="text-[#8BABBF]">Provides timely reminders and tips</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#E6C86E] mr-2">✓</span>
                    <span className="text-[#8BABBF]">Answers questions with AI intelligence</span>
                  </li>
                </ul>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Features */}
      <section className="bg-[#2A2136] text-white py-20">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center text-[#E6C86E] mb-16 pixel-shadow">Epic Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏆",
                title: "Gamified Tasks",
                description: "Transform to-dos into quests with rewards and achievements"
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                description: "Watch your productivity level up with visual stats"
              },
              {
                icon: "🎵",
                title: "Immersive Experience",
                description: "Pixel art themes and music to enhance focus"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-[#4A3F6B] p-6 border-4 border-[#8BABBF] pixel-container">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[#FF6B97] mb-2">{feature.title}</h3>
                <p className="text-[#8BABBF]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#4A3F6B] text-white py-16 border-t-4 border-[#E6C86E]">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-[#E6C86E] mb-6 pixel-shadow">Begin Your Hero's Journey</h2>
          <p className="text-lg mb-8">Join thousands of heroes conquering their daily quests</p>
          <div className="flex justify-center">
            <ButtonLogin session={session} extraClass="px-8 py-3 bg-[#FF6B97] text-white font-bold rounded-none border-4 border-[#E6C86E] pixel-button hover:bg-[#FF8CAD] transition-transform"/>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2A2136] text-[#8BABBF] py-8 border-t-4 border-[#4A3F6B]">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Image 
              src="/favicon.ico" 
              alt="TaskHero Logo" 
              width={24} 
              height={24} 
              className="mr-2"
            />
            <span className="text-[#E6C86E] font-bold">TaskHero</span>
          </div>
          <p>© 2023 TaskHero. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
