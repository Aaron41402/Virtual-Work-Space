import ButtonLogin from "@/components/ButtonLogin";
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

      {/* Hero */}
      <section className="bg-[url('/background.png')] bg-cover bg-center min-h-screen relative">
        <div className="absolute inset-0 bg-[#2A2136]/70"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-8 py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-[#E6C86E] mb-6 pixel-shadow leading-tight">
              Turn Your Tasks Into <span className="text-[#FF6B97]">Epic Quests</span>
            </h1>
            <p className="text-white text-lg mb-8 pixel-shadow">
              Level up your productivity with TaskHero's gamified task management system. Complete quests, earn rewards, and conquer your day!
            </p>
            <div className="pixel-button-container flex items-center">
              <Image 
                src="/favicon.ico" 
                alt="TaskHero Logo" 
                width={32} 
                height={32} 
                className="mr-2"
              />
              <ButtonLogin session={session} extraClass="px-8 py-3 bg-[#FF6B97] text-white font-bold rounded-none border-4 border-[#E6C86E] pixel-button hover:bg-[#FF8CAD] transition-transform"/>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <div className="pixel-frame border-4 border-[#E6C86E] shadow-pixel overflow-hidden">
                <img
                  src="/landing1.png"
                  alt="TaskHero Dashboard"

                />
              </div>
              <div className="absolute -bottom-12 -right-12 pixel-frame border-4 border-[#FF6B97] shadow-pixel overflow-hidden">
                <img
                  src="/landing2.png"
                  alt="TaskHero Features"

                />
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
                description: "Transform boring to-dos into exciting quests with rewards and achievements"
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                description: "Watch your productivity level up with visual stats and analytics"
              },
              {
                icon: "🎵",
                title: "Immersive Experience",
                description: "Pixel art themes and background music to enhance your productivity journey"
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
          <p className="text-lg mb-8">Join thousands of productivity heroes conquering their daily quests</p>
          <ButtonLogin session={session} extraClass="px-8 py-3 bg-[#FF6B97] text-white font-bold rounded-none border-4 border-[#E6C86E] pixel-button hover:bg-[#FF8CAD] transition-transform"/>
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
