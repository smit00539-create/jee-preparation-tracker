
import { Card } from "@/components/ui/card";

const StudyTipsCard = () => {
  return (
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
  );
};

export default StudyTipsCard;
