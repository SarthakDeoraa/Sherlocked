import React from "react";

interface AboutSectionProps {
  className?: string;
}

export default function AboutSection({ className }: AboutSectionProps) {
  return (
    <section id="about" className={`py-16 px-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-vonca text-4xl md:text-5xl font-bold text-white mb-4">
            About Us
          </h2>
          <p className="font-vonca text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Discover the thrill of solving mysteries in our immersive cryptic
            hunt experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Image Square */}
          <div className="aspect-square bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 flex items-center justify-center relative overflow-hidden">
            {/* Blurred Icons Grid */}
          </div>

          {/* Right Side - Text Square */}
          <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12 flex flex-col justify-center">
            <div className="space-y-6">
              <h3 className="font-vonca text-3xl md:text-4xl font-bold text-white">
                Lorem Ipsum Dolor
              </h3>

              <div className="space-y-4 text-gray-300">
                <p className="font-vonca text-lg leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>

                <p className="font-vonca text-lg leading-relaxed">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.
                </p>

                <p className="font-vonca text-lg leading-relaxed">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae ab illo inventore veritatis et quasi architecto
                  beatae vitae dicta sunt explicabo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
