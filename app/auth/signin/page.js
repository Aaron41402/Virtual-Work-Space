"use client";

import { useEffect, useRef } from 'react';
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignIn() {
  const parallaxRef = useRef(null);

  useEffect(() => {
    const parallaxContainer = parallaxRef.current;
    if (!parallaxContainer) return;

    const cloudLayers = parallaxContainer.querySelectorAll('.cloud-layer');
    let animationFrameId;
    let positions = [0, 0];
    const speeds = [1.5, 2.5];

    const animate = () => {
      cloudLayers.forEach((layer, index) => {
        positions[index] -= speeds[index] * 0.5;

        const layerWidth = layer.offsetWidth / 2;
        if (positions[index] <= -layerWidth) {
          positions[index] += layerWidth;
        }

        layer.style.transform = `translateX(${positions[index]}px)`;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative h-screen overflow-hidden bg-[#2A2136]">
      <div ref={parallaxRef} className="absolute inset-0">
        <div className="static-layer absolute inset-0 z-0">
          <Image src="/background/1.png" alt="Background layer 1" fill priority className="object-cover" />
        </div>
        <div className="static-layer absolute inset-0 z-10">
          <Image src="/background/2.png" alt="Background layer 2" fill priority className="object-cover" />
        </div>

        <div className="cloud-layer absolute inset-0 flex z-20" style={{ width: '200%' }}>
          <Image src="/background/3.png" alt="Cloud layer 3" width={1920} height={1080} className="object-cover h-full w-1/2" />
          <Image src="/background/3.png" alt="Cloud layer 3 duplicate" width={1920} height={1080} className="object-cover h-full w-1/2" />
        </div>

        <div className="cloud-layer absolute inset-0 flex z-30" style={{ width: '200%' }}>
          <Image src="/background/4.png" alt="Cloud layer 4" width={1920} height={1080} className="object-cover h-full w-1/2" />
          <Image src="/background/4.png" alt="Cloud layer 4 duplicate" width={1920} height={1080} className="object-cover h-full w-1/2" />
        </div>
      </div>

      <div className="relative z-40 flex min-h-screen flex-col items-center justify-center">
        <div className="font-extrabold flex items-center mb-8 font-pixel">
          <Image src="/favicon.ico" alt="TaskHero Logo" width={60} height={60} className="mr-2" />
          <span className="text-[#E6C86E] text-4xl">TaskHero</span>
        </div>
        <button 
            className="flex items-center px-5 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
            onClick={() => signIn("google", { callbackUrl: "/setup" })}
        >
            {/* Google Icon */}
            <Image
                src="/google-icon.svg"   // Update with the path to your Google icon
                alt="Google Logo"
                width={20}
                height={20}
                className="mr-4"
            />
            <span className="text-gray-700 font-medium text-lg">Sign in with Google</span>
        </button>
      </div>
    </section>
  );
}