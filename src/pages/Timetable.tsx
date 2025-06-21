
import { useState } from "react";
import TimetableHeader from "@/components/timetable/TimetableHeader";
import DateNavigation from "@/components/timetable/DateNavigation";
import DayProgressCard from "@/components/timetable/DayProgressCard";
import TasksTable from "@/components/timetable/TasksTable";
import StudyTipsCard from "@/components/timetable/StudyTipsCard";
import FriendsStudySessions from "@/components/FriendsStudySessions";
import { useTimetableData } from "@/hooks/useTimetableData";

const Timetable = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const {
    getTask,
    updateTask,
    updateRemarks,
    clearAllTasks,
    calculateDayProgress,
    calculateTotalTime
  } = useTimetableData(selectedDate);

  const dayProgress = calculateDayProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <TimetableHeader selectedDate={selectedDate} />
        
        <DateNavigation 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />

        <DayProgressCard 
          selectedDate={selectedDate}
          dayProgress={dayProgress}
          onClearAllTasks={clearAllTasks}
        />

        <TasksTable
          getTask={getTask}
          updateTask={updateTask}
          updateRemarks={updateRemarks}
          calculateTotalTime={calculateTotalTime}
        />

        <FriendsStudySessions />

        <StudyTipsCard />
      </div>
    </div>
  );
};

export default Timetable;
