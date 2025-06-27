
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Calendar, GraduationCap, UserPlus, LogOut, User, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const Index = () => {
  const { user, isGuest, guestId, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user && !isGuest) {
      navigate('/auth');
    }

    // Check if app can be installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInWebApp = window.matchMedia('(display-mode: fullscreen)').matches;
    const isInstalled = isStandalone || isInWebAppiOS || isInWebApp;
    
    setShowInstallButton(!isInstalled);

    // Listen for the install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [user, isGuest, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`Install prompt outcome: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowInstallButton(false);
      }
      
      // Clear the saved prompt since it can only be used once
      setDeferredPrompt(null);
      
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with User Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-12 w-12 text-blue-600" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                JEE Prepometer
              </h1>
              <p className="text-sm text-gray-600">
                {isGuest ? `Guest User (${guestId?.slice(-8)})` : `Welcome back!`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {showInstallButton && (
              <Button 
                variant="outline" 
                onClick={handleInstallApp}
                className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <Download className="h-4 w-4" />
                Install App
              </Button>
            )}
            {!isGuest && (
              <Link to="/friends">
                <Button variant="outline" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Friends
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              {isGuest ? 'Exit Guest' : 'Sign Out'}
            </Button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-12">
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your JEE preparation journey across Physics, Chemistry, and Mathematics. 
            Stay organized, monitor progress, and achieve your goals!
          </p>
          {isGuest && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-yellow-800">
                You're using Guest mode. <Link to="/auth" className="font-semibold underline">Create an account</Link> to access the friends feature and sync your data across devices!
              </p>
            </div>
          )}
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
                  Plan and track your daily study activities with calendar navigation.
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
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
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
                Your progress is automatically saved and synced
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6">
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-semibold text-gray-800 mb-2">Friends System</h4>
              <p className="text-sm text-gray-600">
                {isGuest ? 'Create an account to add friends' : 'Connect with study partners'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
