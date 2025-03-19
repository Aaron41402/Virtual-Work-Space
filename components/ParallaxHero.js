'use client';
import { useEffect, useRef } from 'react';
import ButtonLogin from '@/components/ButtonLogin';
import Image from 'next/image';

export default function ParallaxHero({ session }) {
  const parallaxRef = useRef(null);
  
  useEffect(() => {
    const parallaxContainer = parallaxRef.current;
    if (!parallaxContainer) return;
    
    // Get the cloud layers
    const cloudLayers = parallaxContainer.querySelectorAll('.cloud-layer');
    let animationFrameId;
    let positions = [0, 0]; // Starting positions for cloud layers
    const speeds = [1.5, 2.5]; // Different speeds for each cloud layer
    
    const animate = () => {
      cloudLayers.forEach((layer, index) => {
        // Update position
        positions[index] -= speeds[index] * 0.5;
        
        // Reset position when image is fully out of view
        const layerWidth = layer.offsetWidth / 2;
        if (positions[index] <= -layerWidth) {
          positions[index] += layerWidth;
        }
        
        // Apply the new position
        layer.style.transform = `translateX(${positions[index]}px)`;
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start the animation
    animate();
    
    // Debug - check if we're finding the cloud layers
    console.log('Cloud layers found:', cloudLayers.length);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <section className="relative h-screen overflow-hidden bg-[#2A2136]">
      <div ref={parallaxRef} className="absolute inset-0">
        {/* Static background layers (1.png and 2.png) */}
        <div className="static-layer absolute inset-0 z-0">
          <Image 
            src="/background/1.png" 
            alt="Background layer 1"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="static-layer absolute inset-0 z-10">
          <Image 
            src="/background/2.png" 
            alt="Background layer 2"
            fill
            priority
            className="object-cover"
          />
        </div>
        
        {/* Moving cloud layers (3.png and 4.png) with explicit z-index */}
        <div className="cloud-layer absolute inset-0 flex z-20" style={{ width: '200%' }}>
          <Image 
            src="/background/3.png" 
            alt="Cloud layer 3"
            width={1920}
            height={1080}
            className="object-cover h-full w-1/2"
          />
          <Image 
            src="/background/3.png" 
            alt="Cloud layer 3 duplicate"
            width={1920}
            height={1080}
            className="object-cover h-full w-1/2"
          />
        </div>
        
        <div className="cloud-layer absolute inset-0 flex z-30" style={{ width: '200%' }}>
          <Image 
            src="/background/4.png" 
            alt="Cloud layer 4"
            width={1920}
            height={1080}
            className="object-cover h-full w-1/2"
          />
          <Image 
            src="/background/4.png" 
            alt="Cloud layer 4 duplicate"
            width={1920}
            height={1080}
            className="object-cover h-full w-1/2"
          />
        </div>
      </div>
      
      {/* Content overlay with higher z-index */}
      <div className="relative z-40 flex items-center justify-center h-full">
        <div className="text-center px-8 max-w-3xl">
          <h1 className="text-6xl md:text-5xl font-bold text-[#E6C86E] mb-6 pixel-shadow leading-tight">
            TaskHero
          </h1>
          <p className="text-white text-lg mb-8 pixel-shadow">
          Level up with TaskHero! Complete quests, earn rewards, and conquer your day!
          </p>
          <div className="pixel-button-container flex items-center justify-center">
            <Image 
              src="/favicon.ico" 
              alt="TaskHero Logo" 
              width={32} 
              height={32} 
              className="mr-2"
            />
            <ButtonLogin 
              session={session} 
              extraClass="px-8 py-3 bg-[#FF6B97] text-white font-bold rounded-none border-4 border-[#E6C86E] pixel-button hover:bg-[#FF8CAD] transition-transform"
            />
          </div>
        </div>
      </div>
    </section>
  );
} 