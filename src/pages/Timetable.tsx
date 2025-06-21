
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SUBJECT_NAMES, SUBJECT_COLORS } from "@/data/subjects";
import ToggleButton from "@/components/ToggleButton";
import TimerComponent from "@/components/TimerComponent";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
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

const Timetable = () => {
  const { toast } = useToast();
  const { user, isGuest } = useAuth();
  const { saveDailyTask, loadDailyTasks } = useSupabaseData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timetableData, setTimetableData] = useState<TimetableData>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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

  const dayProgress = calculateDayProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Daily Tasks</h1>
              <p className="text-gray-600">{format(selectedDate, 'EEEE, MMMM do, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <Card className="p-4 mb-6 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Select Date</h2>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(selectedDate, 'MMM dd, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </Card>

        {/* Day Progress Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Progress for {format(selectedDate, 'MMM dd')}
            </h2>
            <Button 
              onClick={clearAllTasks}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Clear All Tasks
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-white/50 rounded-full h-4">
                <div 
                  className="h-4 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${dayProgress}%` }}
                />
              </div>
            </div>
            <span className="font-bold text-2xl text-blue-800">{dayProgress}%</span>
          </div>
        </Card>

        {/* Tasks Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-4 text-left min-w-[150px]">
                    Subject
                  </th>
                  <th className="border border-gray-300 p-4 text-center min-w-[200px]">
                    Lectures
                  </th>
                  <th className="border border-gray-300 p-4 text-center min-w-[200px]">
                    Notes
                  </th>
                  <th className="border border-gray-300 p-4 text-center min-w-[200px]">
                    Homework
                  </th>
                  <th className="border border-gray-300 p-4 text-center min-w-[200px]">
                    Modules
                  </th>
                  <th className="border border-gray-300 p-4 text-center min-w-[200px]">
                    PYQs
                  </th>
                  <th className="border border-gray-300 p-4 text-center min-w-[150px]">
                    Total Time
                  </th>
                  <th className="border border-gray-300 p-4 text-center min-w-[250px]">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(SUBJECT_NAMES).map(subject => {
                  const task = getTask(subject);
                  return (
                    <tr key={subject} className="hover:bg-gray-50">
                      <td className={`border border-gray-300 p-4 ${SUBJECT_COLORS[subject]} font-semibold`}>
                        {SUBJECT_NAMES[subject]}
                      </td>
                      
                      {/* Lectures Column */}
                      <td className="border border-gray-300 p-4">
                        <div className="space-y-2">
                          <Input
                            value={task.lectures.text}
                            onChange={(e) => updateTask(subject, 'lectures', 'text', e.target.value)}
                            placeholder="What lectures will you watch?"
                            className="w-full"
                          />
                          <div className="flex justify-center">
                            <TimerComponent
                              onTimeUpdate={(timeSpent) => updateTask(subject, 'lectures', 'timeSpent', timeSpent)}
                              size="sm"
                            />
                          </div>
                          <div className="flex justify-center">
                            <ToggleButton
                              value={task.lectures.completed}
                              onChange={(value) => updateTask(subject, 'lectures', 'completed', value)}
                              size="sm"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Notes Column */}
                      <td className="border border-gray-300 p-4">
                        <div className="space-y-2">
                          <Input
                            value={task.notes.text}
                            onChange={(e) => updateTask(subject, 'notes', 'text', e.target.value)}
                            placeholder="What notes will you make?"
                            className="w-full"
                          />
                          <div className="flex justify-center">
                            <TimerComponent
                              onTimeUpdate={(timeSpent) => updateTask(subject, 'notes', 'timeSpent', timeSpent)}
                              size="sm"
                            />
                          </div>
                          <div className="flex justify-center">
                            <ToggleButton
                              value={task.notes.completed}
                              onChange={(value) => updateTask(subject, 'notes', 'completed', value)}
                              size="sm"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Homework Column */}
                      <td className="border border-gray-300 p-4">
                        <div className="space-y-2">
                          <Input
                            value={task.homework.text}
                            onChange={(e) => updateTask(subject, 'homework', 'text', e.target.value)}
                            placeholder="What homework will you do?"
                            className="w-full"
                          />
                          <div className="flex justify-center">
                            <TimerComponent
                              onTimeUpdate={(timeSpent) => updateTask(subject, 'homework', 'timeSpent', timeSpent)}
                              size="sm"
                            />
                          </div>
                          <div className="flex justify-center">
                            <ToggleButton
                              value={task.homework.completed}
                              onChange={(value) => updateTask(subject, 'homework', 'completed', value)}
                              size="sm"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Modules Column */}
                      <td className="border border-gray-300 p-4">
                        <div className="space-y-2">
                          <Input
                            value={task.modules.text}
                            onChange={(e) => updateTask(subject, 'modules', 'text', e.target.value)}
                            placeholder="Which modules will you solve?"
                            className="w-full"
                          />
                          <div className="flex justify-center">
                            <TimerComponent
                              onTimeUpdate={(timeSpent) => updateTask(subject, 'modules', 'timeSpent', timeSpent)}
                              size="sm"
                            />
                          </div>
                          <div className="flex justify-center">
                            <ToggleButton
                              value={task.modules.completed}
                              onChange={(value) => updateTask(subject, 'modules', 'completed', value)}
                              size="sm"
                            />
                          </div>
                        </div>
                      </td>

                      {/* PYQs Column */}
                      <td className="border border-gray-300 p-4">
                        <div className="space-y-2">
                          <Input
                            value={task.pyqs.text}
                            onChange={(e) => updateTask(subject, 'pyqs', 'text', e.target.value)}
                            placeholder="Which PYQs will you solve?"
                            className="w-full"
                          />
                          <div className="flex justify-center">
                            <TimerComponent
                              onTimeUpdate={(timeSpent) => updateTask(subject, 'pyqs', 'timeSpent', timeSpent)}
                              size="sm"
                            />
                          </div>
                          <div className="flex justify-center">
                            <ToggleButton
                              value={task.pyqs.completed}
                              onChange={(value) => updateTask(subject, 'pyqs', 'completed', value)}
                              size="sm"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Total Time Column */}
                      <td className="border border-gray-300 p-4 text-center">
                        <div className="font-mono text-lg font-semibold text-blue-800">
                          {calculateTotalTime(subject)}
                        </div>
                      </td>

                      {/* Remarks Column */}
                      <td className="border border-gray-300 p-4">
                        <Textarea
                          value={task.remarks}
                          onChange={(e) => updateRemarks(subject, e.target.value)}
                          placeholder="Any additional notes or observations..."
                          className="w-full min-h-[80px] resize-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Tips Section */}
        <Card className="p-6 mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">💡 Study Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
            <div>
              <strong>📚 Lectures:</strong> Be specific about which topics or chapters you'll cover
            </div>
            <div>
              <strong>📝 Notes:</strong> Mention the format (mind maps, summary sheets, formula cards)
            </div>
            <div>
              <strong>📋 Homework:</strong> Include assignments and practice problems
            </div>
            <div>
              <strong>🧩 Modules:</strong> Specify module numbers or problem-solving techniques
            </div>
            <div>
              <strong>🎯 PYQs:</strong> Include year range or specific topics you'll practice
            </div>
            <div>
              <strong>⏱️ Timer:</strong> Use the timer to track time spent on each activity
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Timetable;
