"use client";

import { useState, useRef, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HintPopupProps {
  hints: Array<{ id: string; content: string }>;
  isLoading: boolean;
  isError: boolean;
}

export function HintPopup({ hints, isLoading, isError }: HintPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Click-away handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={popupRef}>
      <Button
        onClick={handleToggle}
        variant="ghost"
        size="sm"
        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 p-2"
        disabled={isLoading}
        tabIndex={0}
      >
        <Lightbulb className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div
          className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 min-w-[260px] max-w-xs"
        >
          <Card className="bg-white/95 border-none shadow-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Hints
              </CardTitle>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                tabIndex={-1}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center text-gray-600">Loading hints...</div>
              ) : isError ? (
                <div className="text-center text-red-600">Failed to load hints.</div>
              ) : hints.length === 0 ? (
                <div className="text-center text-gray-600">
                  No hints available yet. Check back later!
                </div>
              ) : (
                <div className="space-y-3">
                  {hints.map((hint, index) => (
                    <div
                      key={hint.id}
                      className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="text-sm font-medium text-yellow-800 mb-1">
                        Hint {index + 1}
                      </div>
                      <div className="text-sm text-yellow-700">{hint.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 