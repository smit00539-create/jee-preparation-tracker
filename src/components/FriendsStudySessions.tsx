
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SUBJECT_COLORS } from "@/data/subjects";

interface ActiveSession {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  start_time: string;
  is_active: boolean;
  username?: string;
}

interface FriendSession {
  userId: string;
  username: string;
  totalTime: number;
  isActive: boolean;
  sessions: ActiveSession[];
  currentSubject?: string;
}

const FriendsStudySessions = () => {
  const { user, isGuest } = useAuth();
  const [friendsSessions, setFriendsSessions] = useState<FriendSession[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for live timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isGuest || !user) return;

    loadFriendsSessions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('friends-study-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_study_sessions'
        },
        () => {
          loadFriendsSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isGuest]);

  const loadFriendsSessions = async () => {
    if (!user) return;

    try {
      // Get friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (!friendships || friendships.length === 0) {
        setFriendsSessions([]);
        return;
      }

      const friendIds = friendships.map(f => 
        f.user1_id === user.id ? f.user2_id : f.user1_id
      );

      // Get friend profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', friendIds);

      // Get all active sessions for friends (including past sessions from today)
      const today = new Date().toISOString().split('T')[0];
      const { data: allSessions } = await supabase
        .from('active_study_sessions')
        .select('*')
        .in('user_id', friendIds)
        .gte('start_time', today);

      // Group sessions by user
      const friendsData: FriendSession[] = friendIds.map(friendId => {
        const profile = profiles?.find(p => p.id === friendId);
        const userSessions = allSessions?.filter(s => s.user_id === friendId) || [];
        const activeSessions = userSessions.filter(s => s.is_active);
        
        // Calculate total time for today (both active and completed sessions)
        const totalTime = userSessions.reduce((total, session) => {
          const startTime = new Date(session.start_time);
          let elapsed;
          
          if (session.is_active) {
            // For active sessions, calculate from start to now
            elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
          } else {
            // For completed sessions, we'd need end_time, but let's estimate 30 min for now
            // In a real app, you'd store the actual session duration
            elapsed = 30 * 60; // 30 minutes default
          }
          
          return total + elapsed;
        }, 0);

        // Get current subject being studied
        const currentSubject = activeSessions.length > 0 ? activeSessions[0].subject : undefined;

        return {
          userId: friendId,
          username: profile?.username || 'Unknown',
          totalTime,
          isActive: activeSessions.length > 0,
          sessions: activeSessions,
          currentSubject
        };
      }).filter(friend => friend.totalTime > 0); // Show friends who have studied today

      setFriendsSessions(friendsData);
    } catch (error) {
      console.error('Error loading friends sessions:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isGuest || friendsSessions.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <h3 className="text-lg font-semibold text-purple-800 mb-6 text-center">
        📊 Friends Study Sessions Today
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {friendsSessions.map((friend) => (
          <div key={friend.userId} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
            {/* Profile Avatar */}
            <div className="flex justify-center mb-3">
              <Avatar className="h-16 w-16 border-2 border-gray-200">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                  {friend.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Username */}
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">
              {friend.username}
            </h4>
            
            {/* Current Subject (if studying) */}
            {friend.isActive && friend.currentSubject && (
              <div className="mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${SUBJECT_COLORS[friend.currentSubject] || 'bg-gray-100 text-gray-600'}`}>
                  {friend.currentSubject}
                </span>
              </div>
            )}
            
            {/* Study Time */}
            <div className="mb-2">
              <div className="text-xl font-mono font-bold text-gray-800">
                {formatTime(friend.totalTime)}
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center justify-center space-x-1">
              {friend.isActive ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">LIVE</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500 font-medium">TODAY</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Study together and motivate each other! 💪
        </p>
      </div>
    </Card>
  );
};

export default FriendsStudySessions;
