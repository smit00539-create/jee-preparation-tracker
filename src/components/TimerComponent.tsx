
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TimerComponentProps {
  onTimeUpdate: (timeSpent: number) => void;
  size?: "sm" | "md";
  subject?: string;
  category?: string;
}

const TimerComponent = ({ onTimeUpdate, size = "md", subject, category }: TimerComponentProps) => {
  const { user, isGuest } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
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

  const startSession = async () => {
    if (isGuest || !user || !subject || !category) return null;

    try {
      const { data, error } = await supabase
        .from('active_study_sessions')
        .insert({
          user_id: user.id,
          subject,
          category,
          start_time: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting session:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  };

  const stopSession = async (sessionId: string) => {
    if (isGuest || !user) return;

    try {
      await supabase
        .from('active_study_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error stopping session:', error);
    }
  };

  const handleToggle = async () => {
    if (isRunning) {
      // Stop timer
      setIsRunning(false);
      if (sessionId) {
        await stopSession(sessionId);
        setSessionId(null);
      }
    } else {
      // Start timer
      setIsRunning(true);
      if (subject && category) {
        const newSessionId = await startSession();
        setSessionId(newSessionId);
      }
    }
  };

  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const timerSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex items-center gap-2">
      <div className={`font-mono text-gray-600 ${timerSize}`}>
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
