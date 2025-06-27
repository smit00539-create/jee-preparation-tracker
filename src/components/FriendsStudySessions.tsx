
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
  liveTimer?: number;
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
        (payload) => {
          console.log('Real-time update:', payload);
          loadFriendsSessions();
        }
      )
      .subscribe();

    // Refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      loadFriendsSessions();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
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

      // Get all sessions for friends from today
      const today = new Date().toISOString().split('T')[0];
      const { data: allSessions } = await supabase
        .from('active_study_sessions')
        .select('*')
        .in('user_id', friendIds)
        .gte('start_time', today)
        .order('start_time', { ascending: false });

      // Group sessions by user
      const friendsData: FriendSession[] = friendIds.map(friendId => {
        const profile = profiles?.find(p => p.id === friendId);
        const userSessions = allSessions?.filter(s => s.user_id === friendId) || [];
        const activeSessions = userSessions.filter(s => s.is_active);
        
        // Calculate total time for today
        let totalTime = 0;
        let liveTimer = 0;
        
        userSessions.forEach(session => {
          const startTime = new Date(session.start_time);
          
          if (session.is_active) {
            // For active sessions, calculate live time
            const elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
            totalTime += elapsed;
            liveTimer = elapsed; // Current live session time
          } else {
            // For completed sessions, estimate 30 minutes (in real app, you'd store end_time)
            totalTime += 30 * 60; // 30 minutes
          }
        });

        // Get current subject being studied
        const currentSubject = activeSessions.length > 0 ? activeSessions[0].subject : undefined;

        return {
          userId: friendId,
          username: profile?.username || 'Unknown',
          totalTime,
          isActive: activeSessions.length > 0,
          sessions: activeSessions,
          currentSubject,
          liveTimer: activeSessions.length > 0 ? liveTimer : undefined
        };
      }).filter(friend => friend.totalTime > 0 || friend.isActive); // Show friends who have studied today or are currently studying

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

  if (isGuest) {
    return (
      <Card className="p-6 mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">
            👥 Friends Study Sessions
          </h3>
          <p className="text-yellow-700 mb-4">
            Create an account to see your friends' study sessions and motivate each other!
          </p>
          <div className="text-sm text-yellow-600">
            With an account, you can track live study sessions and see who's studying what in real-time.
          </div>
        </div>
      </Card>
    );
  }

  if (friendsSessions.length === 0) {
    return (
      <Card className="p-6 mt-8 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            👥 Friends Study Sessions
          </h3>
          <p className="text-gray-600 mb-4">
            No friends are currently studying or have studied today.
          </p>
          <div className="text-sm text-gray-500">
            Add friends to see their study progress and motivate each other!
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <h3 className="text-lg font-semibold text-purple-800 mb-6 text-center">
        👥 Friends Study Sessions Today
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {friendsSessions.map((friend) => (
          <div key={friend.userId} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
            {/* Profile Avatar */}
            <div className="flex justify-center mb-4">
              <Avatar className="h-20 w-20 border-3 border-gray-200">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl">
                  {friend.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Username */}
            <h4 className="font-semibold text-gray-800 mb-3 text-base">
              {friend.username}
            </h4>
            
            {/* Current Subject (if studying) */}
            {friend.isActive && friend.currentSubject && (
              <div className="mb-4">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${SUBJECT_COLORS[friend.currentSubject] || 'bg-gray-100 text-gray-600'}`}>
                  📚 {friend.currentSubject}
                </span>
              </div>
            )}
            
            {/* Live Timer (if currently studying) */}
            {friend.isActive && friend.liveTimer !== undefined && (
              <div className="mb-3">
                <div className="text-sm text-green-600 font-medium mb-1">LIVE NOW</div>
                <div className="text-2xl font-mono font-bold text-green-700 mb-1">
                  {formatTime(friend.liveTimer)}
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">Currently Studying</span>
                </div>
              </div>
            )}
            
            {/* Total Study Time Today */}
            <div className="mb-3">
              <div className="text-sm text-gray-500 mb-1">Total Today</div>
              <div className="text-xl font-mono font-bold text-gray-800">
                {formatTime(friend.totalTime)}
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center justify-center space-x-1">
              {friend.isActive ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">ACTIVE</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-xs text-blue-600 font-medium">STUDIED TODAY</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-purple-600 font-medium">
          🔥 Study together and achieve your goals! 💪
        </p>
      </div>
    </Card>
  );
};

export default FriendsStudySessions;
