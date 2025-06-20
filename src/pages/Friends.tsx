
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Search, Users, Inbox, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string;
}

interface FriendRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  requester_profile?: Profile;
  recipient_profile?: Profile;
}

const Friends = () => {
  const { toast } = useToast();
  const { user, isGuest } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [myFriends, setMyFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    if (!isGuest && user) {
      loadFriendRequests();
      loadMyFriends();
    }
  }, [user, isGuest]);

  const loadFriendRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        *,
        requester_profile:profiles!friend_requests_requester_id_fkey(id, username),
        recipient_profile:profiles!friend_requests_recipient_id_fkey(id, username)
      `)
      .eq('recipient_id', user.id)
      .eq('status', 'pending');

    if (error) {
      console.error('Error loading friend requests:', error);
    } else {
      setFriendRequests(data || []);
    }
  };

  const loadMyFriends = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        user1_profile:profiles!friendships_user1_id_fkey(id, username),
        user2_profile:profiles!friendships_user2_id_fkey(id, username)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (error) {
      console.error('Error loading friends:', error);
    } else {
      const friends = (data || []).map(friendship => {
        return friendship.user1_id === user.id 
          ? friendship.user2_profile 
          : friendship.user1_profile;
      });
      setMyFriends(friends);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim() || !user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', `%${searchTerm}%`)
      .neq('id', user.id)
      .limit(10);

    if (error) {
      toast({
        title: "Search Error",
        description: "Failed to search for users",
        variant: "destructive"
      });
    } else {
      setSearchResults(data || []);
    }
    setLoading(false);
  };

  const sendFriendRequest = async (recipientId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('friend_requests')
      .insert({
        requester_id: user.id,
        recipient_id: recipientId
      });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Request Already Sent",
          description: "You have already sent a friend request to this user",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send friend request",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully"
      });
      setSearchResults(prev => prev.filter(user => user.id !== recipientId));
    }
  };

  const respondToFriendRequest = async (requestId: string, accept: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('friend_requests')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to respond to friend request",
        variant: "destructive"
      });
      return;
    }

    if (accept) {
      const request = friendRequests.find(req => req.id === requestId);
      if (request) {
        const { error: friendshipError } = await supabase
          .from('friendships')
          .insert({
            user1_id: request.requester_id,
            user2_id: request.recipient_id
          });

        if (friendshipError) {
          console.error('Error creating friendship:', friendshipError);
        }
      }
    }

    toast({
      title: accept ? "Friend Request Accepted" : "Friend Request Declined",
      description: accept ? "You are now friends!" : "Friend request declined"
    });

    loadFriendRequests();
    loadMyFriends();
  };

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Friends</h1>
          </div>

          <Card className="p-8 text-center">
            <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Friends Feature Not Available</h2>
            <p className="text-gray-600 mb-6">
              The friends feature is only available for registered users. 
              Create an account to add friends and share your study journey!
            </p>
            <Link to="/auth">
              <Button>Create Account</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Friends</h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Requests
              {friendRequests.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                  {friendRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              My Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Search Users</h2>
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Enter username to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                />
                <Button onClick={searchUsers} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              <div className="space-y-3">
                {searchResults.map(profile => (
                  <div key={profile.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {profile.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{profile.username}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendFriendRequest(profile.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friend
                    </Button>
                  </div>
                ))}
                {searchResults.length === 0 && searchTerm && !loading && (
                  <p className="text-center text-gray-500 py-8">No users found</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
              <div className="space-y-3">
                {friendRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {request.requester_profile?.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{request.requester_profile?.username}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => respondToFriendRequest(request.id, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondToFriendRequest(request.id, false)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {friendRequests.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No pending friend requests</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="friends">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">My Friends</h2>
              <div className="space-y-3">
                {myFriends.map(friend => (
                  <div key={friend.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{friend.username}</span>
                  </div>
                ))}
                {myFriends.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No friends yet. Start by searching for users!</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;
