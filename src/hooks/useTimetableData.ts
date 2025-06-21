
import { useState, useEffect } from "react";
import { SUBJECT_NAMES } from "@/data/subjects";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DailyTask {
  lectures: {
    text: string;
    completed: boolean | null;
    timeSpent: number;
  };
  notes: {
    text: string;
    completed: boolean | null;
    timeSpent: number;
  };
  homework: {
    text: string;
    completed: boolean | null;
    timeSpent: number;
  };
  modules: {
    text: string;
    completed: boolean | null;
    timeSpent: number;
  };
  pyqs: {
    text: string;
    completed: boolean | null;
    timeSpent: number;
  };
  remarks: string;
}

type TimetableData = {
  [subject: string]: DailyTask;
};

export const useTimetableData = (selectedDate: Date) => {
  const { toast } = useToast();
  const { user, isGuest } = useAuth();
  const { saveDailyTask, loadDailyTasks } = useSupabaseData();
  const [timetableData, setTimetableData] = useState<TimetableData>({});

  // Load data when component mounts or date changes
  useEffect(() => {
    loadTasksForDate(selectedDate);
  }, [selectedDate, user, isGuest]);

  const loadTasksForDate = async (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const tasks = await loadDailyTasks(dateString);
    setTimetableData(tasks);
  };

  const updateTask = async (subject: string, category: keyof Omit<DailyTask, 'remarks'>, field: 'text' | 'completed' | 'timeSpent', value: any) => {
    const newTimetableData = {
      ...timetableData,
      [subject]: {
        ...getTask(subject),
        [category]: {
          ...getTask(subject)[category],
          [field]: value
        }
      }
    };
    
    setTimetableData(newTimetableData);
    
    // Save to database
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    await saveDailyTask(dateString, subject, newTimetableData[subject]);
  };

  const updateRemarks = async (subject: string, value: string) => {
    const newTimetableData = {
      ...timetableData,
      [subject]: {
        ...getTask(subject),
        remarks: value
      }
    };
    
    setTimetableData(newTimetableData);
    
    // Save to database
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    await saveDailyTask(dateString, subject, newTimetableData[subject]);
  };

  const getDefaultTask = (): DailyTask => ({
    lectures: { text: "", completed: null, timeSpent: 0 },
    notes: { text: "", completed: null, timeSpent: 0 },
    homework: { text: "", completed: null, timeSpent: 0 },
    modules: { text: "", completed: null, timeSpent: 0 },
    pyqs: { text: "", completed: null, timeSpent: 0 },
    remarks: ""
  });

  const getTask = (subject: string): DailyTask => {
    const task = timetableData[subject];
    if (!task) {
      return getDefaultTask();
    }
    
    return {
      lectures: task.lectures || { text: "", completed: null, timeSpent: 0 },
      notes: task.notes || { text: "", completed: null, timeSpent: 0 },
      homework: task.homework || { text: "", completed: null, timeSpent: 0 },
      modules: task.modules || { text: "", completed: null, timeSpent: 0 },
      pyqs: task.pyqs || { text: "", completed: null, timeSpent: 0 },
      remarks: task.remarks || ""
    };
  };

  const clearAllTasks = async () => {
    const emptyData: TimetableData = {};
    setTimetableData(emptyData);
    
    // Clear from database for current date
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    for (const subject of Object.keys(SUBJECT_NAMES)) {
      await saveDailyTask(dateString, subject, getDefaultTask());
    }
    
    toast({
      title: "Tasks Cleared",
      description: `All tasks for ${format(selectedDate, 'MMM dd, yyyy')} have been cleared`
    });
  };

  const calculateDayProgress = () => {
    const subjects = Object.keys(SUBJECT_NAMES);
    let totalTasks = 0;
    let completedTasks = 0;

    subjects.forEach(subject => {
      const task = getTask(subject);
      const categories = [task.lectures, task.notes, task.homework, task.modules, task.pyqs];
      
      categories.forEach(category => {
        if (category && category.text && category.text.trim()) {
          totalTasks++;
          if (category.completed === true) {
            completedTasks++;
          }
        }
      });
    });

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const calculateTotalTime = (subject: string) => {
    const task = getTask(subject);
    const totalSeconds = task.lectures.timeSpent + task.notes.timeSpent + 
                        task.homework.timeSpent + task.modules.timeSpent + task.pyqs.timeSpent;
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timetableData,
    getTask,
    updateTask,
    updateRemarks,
    clearAllTasks,
    calculateDayProgress,
    calculateTotalTime
  };
};
