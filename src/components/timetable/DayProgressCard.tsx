
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface DayProgressCardProps {
  selectedDate: Date;
  dayProgress: number;
  onClearAllTasks: () => void;
}

const DayProgressCard = ({ selectedDate, dayProgress, onClearAllTasks }: DayProgressCardProps) => {
  return (
    <Card className="p-6 mb-8 bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Progress for {format(selectedDate, 'MMM dd')}
        </h2>
        <Button 
          onClick={onClearAllTasks}
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
  );
};

export default DayProgressCard;
