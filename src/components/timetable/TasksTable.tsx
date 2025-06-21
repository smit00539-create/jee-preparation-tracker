
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { SUBJECT_NAMES, SUBJECT_COLORS } from "@/data/subjects";
import ToggleButton from "@/components/ToggleButton";
import TimerComponent from "@/components/TimerComponent";

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

interface TasksTableProps {
  getTask: (subject: string) => DailyTask;
  updateTask: (subject: string, category: keyof Omit<DailyTask, 'remarks'>, field: 'text' | 'completed' | 'timeSpent', value: any) => void;
  updateRemarks: (subject: string, value: string) => void;
  calculateTotalTime: (subject: string) => string;
}

const TasksTable = ({ getTask, updateTask, updateRemarks, calculateTotalTime }: TasksTableProps) => {
  return (
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
                          subject={subject}
                          category="lectures"
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
                          subject={subject}
                          category="notes"
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
                          subject={subject}
                          category="homework"
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
                          subject={subject}
                          category="modules"
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
                          subject={subject}
                          category="pyqs"
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
  );
};

export default TasksTable;
