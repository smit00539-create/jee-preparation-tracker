
import { Link } from "react-router-dom";
import { BookOpen, Calendar, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              JEE Prepometer
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your JEE preparation journey across Physics, Chemistry, and Mathematics. 
            Stay organized, monitor progress, and achieve your goals!
          </p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  Portion Completed
                </h2>
                <p className="text-gray-600 mb-6">
                  Track your chapter-wise progress across all three subjects. 
                  Monitor lectures, notes, practice problems, and revisions.
                </p>
              </div>
              <Link to="/portion-completed" className="block">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg">
                  View Progress
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  Timetable / Daily Tasks
                </h2>
                <p className="text-gray-600 mb-6">
                  Plan and track your daily study activities. 
                  Set goals for lectures, notes, and practice questions.
                </p>
              </div>
              <Link to="/timetable" className="block">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg">
                  Manage Tasks
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8">
            Everything you need to ace JEE
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-semibold text-gray-800 mb-2">Complete Syllabus</h4>
              <p className="text-sm text-gray-600">
                All JEE chapters for Physics, Chemistry, and Mathematics
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6">
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-semibold text-gray-800 mb-2">Mobile Friendly</h4>
              <p className="text-sm text-gray-600">
                Access your progress anywhere, anytime on any device
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6">
              <div className="text-2xl mb-2">💾</div>
              <h4 className="font-semibold text-gray-800 mb-2">Auto Save</h4>
              <p className="text-sm text-gray-600">
                Your progress is automatically saved locally
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
