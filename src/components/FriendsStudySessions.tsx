
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

      // Get active sessions for friends
      const { data: activeSessions } = await supabase
        .from('active_study_sessions')
        .select('*')
        .in('user_id', friendIds)
        .eq('is_active', true);

      // Group sessions by user
      const friendsData: FriendSession[] = friendIds.map(friendId => {
        const profile = profiles?.find(p => p.id === friendId);
        const userSessions = activeSessions?.filter(s => s.user_id === friendId) || [];
        
        const totalTime = userSessions.reduce((total, session) => {
          const startTime = new Date(session.start_time);
          const elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
          return total + elapsed;
        }, 0);

        return {
          userId: friendId,
          username: profile?.username || 'Unknown',
          totalTime,
          isActive: userSessions.length > 0,
          sessions: userSessions
        };
      }).filter(friend => friend.isActive); // Only show friends who are currently studying

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

  const getSubjectFromSessions = (sessions: ActiveSession[]) => {
    return sessions.length > 0 ? sessions[0].subject : '';
  };

  if (isGuest || friendsSessions.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">
        🔥 Friends Currently Studying
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friendsSessions.map((friend) => {
          const subject = getSubjectFromSessions(friend.sessions);
          return (
            <div key={friend.userId} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {friend.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <p className="font-semibold text-gray-800">{friend.username}</p>
                  {subject && (
                    <p className={`text-xs px-2 py-1 rounded-full ${SUBJECT_COLORS[subject] || 'bg-gray-100 text-gray-600'} mt-1`}>
                      {subject}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-green-600">
                    {formatTime(friend.totalTime)}
                  </div>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">LIVE</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  {friend.sessions.length} active session{friend.sessions.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default FriendsStudySessions;
