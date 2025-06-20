
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, UserPlus, LogIn, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, signIn, continueAsGuest } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (isSignUp && !formData.username) {
      toast({
        title: "Error",
        description: "Username is required for sign up",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(formData.email, formData.password, formData.username);
        if (result.needsConfirmation) {
          setShowConfirmationMessage(true);
          setLoading(false);
          return;
        }
      } else {
        result = await signIn(formData.email, formData.password);
      }

      if (result.error) {
        if (result.error.message.includes('Email not confirmed')) {
          toast({
            title: "Email Not Confirmed",
            description: "Please check your email and click the confirmation link before signing in.",
            variant: "destructive"
          });
        } else if (result.error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid Credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Authentication Error",
            description: result.error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Success",
          description: isSignUp ? "Account created successfully!" : "Signed in successfully!"
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    navigate('/');
  };

  if (showConfirmationMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 bg-white/90 backdrop-blur-sm text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a confirmation link to <strong>{formData.email}</strong>. 
              Please check your email and click the link to activate your account.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              After confirming your email, you can return here to sign in.
            </p>
            <Button 
              onClick={() => setShowConfirmationMessage(false)}
              className="w-full mb-4"
            >
              Back to Sign In
            </Button>
            <Button
              variant="outline"
              onClick={handleGuestMode}
              className="w-full"
            >
              Continue as Guest Instead
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-12 w-12 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">JEE Prepometer</h1>
          </div>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account to add friends!' : 'Welcome back to your study journey'}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-8 bg-white/90 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                {isSignUp 
                  ? 'Join JEE Prepometer to add friends and share your journey!' 
                  : 'Sign in to access your personalized study tracker'
                }
              </p>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required={isSignUp}
                />
                <p className="text-xs text-gray-500">This username will be used by friends to find you</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                'Loading...'
              ) : (
                <>
                  {isSignUp ? <UserPlus className="h-4 w-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGuestMode}
              >
                Continue as Guest
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Guest mode: Limited features, no friends system
              </p>
            </div>
          </form>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
