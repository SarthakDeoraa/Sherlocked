
import React from 'react';

export default function HeroSection() {
  return (
   
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="font-vonca text-center sm:text-left text-white">
          <h1 className="text-4xl sm:text-6xl md:text-7xl xl:text-9xl" >
         <span className="font-light text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            WELCOME TO
            </span>
            <br />
            <span className="font-bold">
            SHERLOCKED
            </span>
          </h1>
          
          <p className="mt-4 sm:mt-6 md:mt-1 text-lg sm:text-xl md:text-2xl lg:text-3xl">
            UNRAVEL THE MYSTERY
          </p>
        </div>
      </div>
 
  );
}