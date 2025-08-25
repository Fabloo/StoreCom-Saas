'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/lib/auth-client';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
      router.push('/admin');
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Start Google OAuth flow
      const returnTo = encodeURIComponent('/login');
      const response = await fetch(`/api/google-business/auth?mode=oauth&returnTo=${returnTo}`);
      const data = await response.json();
      
      if (data.authUrl) {
        // Store the return path for after OAuth
        localStorage.setItem('oauth_return_to', '/admin');
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get OAuth URL');
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Failed to start Google authentication process.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Already Authenticated</CardTitle>
            <CardDescription>Redirecting to admin dashboard...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Storecom</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard and manage your brands and stores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Connecting...' : 'Sign in with Google'}
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            <p>This will give you access to:</p>
            <ul className="mt-2 space-y-1">
              <li>• Brand management</li>
              <li>• Store management</li>
              <li>• Google Business integration</li>
              <li>• Analytics and insights</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


