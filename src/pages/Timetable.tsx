
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SUBJECT_NAMES, SUBJECT_COLORS } from "@/data/subjects";
import ToggleButton from "@/components/ToggleButton";
import { useToast } from "@/hooks/use-toast";

interface DailyTask {
  lectures: {
    text: string;
    completed: boolean | null;
  };
  notes: {
    text: string;
    completed: boolean | null;
  };
  pyqs: {
    text: string;
    completed: boolean | null;
  };
  remarks: string;
}

type TimetableData = {
  [subject: string]: DailyTask;
};

const Timetable = () => {
  const { toast } = useToast();
  const [timetableData, setTimetableData] = useState<TimetableData>({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("jee-prepometer-timetable");
    if (savedData) {
      try {
        setTimetableData(JSON.parse(savedData));
      } catch (error) {
        console.error("Error loading timetable data:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever timetableData changes
  useEffect(() => {
    localStorage.setItem("jee-prepometer-timetable", JSON.stringify(timetableData));
  }, [timetableData]);

  const updateTask = (subject: string, category: keyof Omit<DailyTask, 'remarks'>, field: 'text' | 'completed', value: any) => {
    setTimetableData(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [category]: {
          ...prev[subject]?.[category],
          [field]: value
        }
      }
    }));
  };

  const updateRemarks = (subject: string, value: string) => {
    setTimetableData(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        remarks: value
      }
    }));
  };

  const getTask = (subject: string): DailyTask => {
    return timetableData[subject] || {
      lectures: { text: "", completed: null },
      notes: { text: "", completed: null },
      pyqs: { text: "", completed: null },
      remarks: ""
    };
  };

  const clearAllTasks = () => {
    setTimetableData({});
    toast({
      title: "Tasks Cleared",
      description: "All daily tasks have been cleared"
    });
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDayProgress = () => {
    const subjects = Object.keys(SUBJECT_NAMES);
    let totalTasks = 0;
    let completedTasks = 0;

    subjects.forEach(subject => {
      const task = getTask(subject);
      const categories = [task.lectures, task.notes, task.pyqs];
      
      categories.forEach(category => {
        if (category.text.trim()) {
          totalTasks++;
          if (category.completed === true) {
            completedTasks++;
          }
        }
      });
    });

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
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
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Daily Tasks</h1>
              <p className="text-gray-600">{getTodayDate()}</p>
            </div>
          </div>
        </div>

        {/* Day Progress Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Today's Progress</h2>
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
                    PYQs
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
                            <ToggleButton
                              value={task.notes.completed}
                              onChange={(value) => updateTask(subject, 'notes', 'completed', value)}
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
                            <ToggleButton
                              value={task.pyqs.completed}
                              onChange={(value) => updateTask(subject, 'pyqs', 'completed', value)}
                              size="sm"
                            />
                          </div>
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
              <strong>🎯 PYQs:</strong> Include year range or specific topics you'll practice
            </div>
            <div>
              <strong>🔄 Daily Review:</strong> Use remarks to note difficulty levels and areas to revisit
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Timetable;
