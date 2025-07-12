// components/footer.tsx
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { Github, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-transparent border-t border-white/10 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* Left Logo */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-transparent flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-xl text-white">Logo</span>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center gap-6">
          {/* Contact Section */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-4 mb-2">
              <a
                href="https://github.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-6 w-6 text-white hover:text-blue-400 transition-colors" />
              </a>
              <a
                href="https://twitter.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6 text-white hover:text-blue-400 transition-colors" />
              </a>
              <a
                href="https://instagram.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6 text-white hover:text-pink-400 transition-colors" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <PhoneIcon className="h-4 w-4" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <EnvelopeIcon className="h-4 w-4" />
              <span>contact@sherlocked.com</span>
            </div>
          </div>
          {/* Made with Love */}
          <div className="text-gray-400 text-xs flex items-center gap-1">
            <span>Made with</span>
            <span className="text-red-500">♥</span>
            <span>by the Sherlocked Team</span>
          </div>
        </div>

        {/* Right Logo */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-xl text-white">Logo</span>
          <div className="h-8 w-8 rounded-lg bg-transparent flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
