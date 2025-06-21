
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface TimerComponentProps {
  onTimeUpdate: (timeSpent: number) => void;
  size?: "sm" | "md";
}

const TimerComponent = ({ onTimeUpdate, size = "md" }: TimerComponentProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          onTimeUpdate(newTime);
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-mono text-gray-600">
        {formatTime(timeElapsed)}
      </div>
      <Button
        variant="outline"
        size="sm"
        className={`${buttonSize} p-0 ${
          isRunning 
            ? "bg-red-100 border-red-300 hover:bg-red-200" 
            : "bg-green-100 border-green-300 hover:bg-green-200"
        }`}
        onClick={handleToggle}
      >
        {isRunning ? (
          <Square className={`${iconSize} text-red-600`} />
        ) : (
          <Play className={`${iconSize} text-green-600`} />
        )}
      </Button>
    </div>
  );
};

export default TimerComponent;
