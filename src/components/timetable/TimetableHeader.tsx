
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface TimetableHeaderProps {
  selectedDate: Date;
}

const TimetableHeader = ({ selectedDate }: TimetableHeaderProps) => {
  return (
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
  );
};

export default TimetableHeader;
