'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function BackGround() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Different speeds for each layer (higher number = slower movement)
  const layers = [
    { src: '/parallax_background_layer_1.png', speed: 1.0 },
    { src: '/parallax_background_layer_2.png', speed: 1.2 },
    { src: '/parallax_background_layer_3.png', speed: 1.4 },
    { src: '/parallax_background_layer_4.png', speed: 1.6 },
    { src: '/parallax_background_layer_5.png', speed: 1.8 },
    { src: '/parallax_background_layer_6.png', speed: 2.0 },
  ];

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      {layers.map((layer, index) => (
        <div
          key={index}
          className="absolute inset-0 w-[120%] h-full"
          style={{
            transform: `translateX(${-(scrollPosition * (1 / layer.speed)) % 100}%)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Double the image to create seamless loop */}
          <div className="flex">
            <Image
              src={layer.src}
              alt={`Parallax Layer ${index + 1}`}
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
              priority={index === 0}
            />
            <Image
              src={layer.src}
              alt={`Parallax Layer ${index + 1} duplicate`}
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
