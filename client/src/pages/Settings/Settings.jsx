import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import SectionTitle from '../../components/Shared/SectionTitle/SectionTitle';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { toast } from 'react-toastify';

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    privacySettings: 'public',
    language: 'english',
  });
  
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // In a real app, you would fetch user settings from the backend
    // For now, we'll just use default values
    const fetchSettings = async () => {
      try {
        // Simulating API call
        setLoading(true);
        // const response = await fetch(`/api/users/${currentUser.uid}/settings`);
        // const data = await response.json();
        // setSettings(data);
        
        // For demo purposes, we'll just use default values
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setLoading(false);
        toast.error('Failed to load settings');
      }
    };
    
    if (currentUser) {
      fetchSettings();
    }
  }, [currentUser]);
  
  const handleToggleChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // In a real app, you would save settings to the backend
      // await fetch(`/api/users/${currentUser.uid}/settings`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(settings),
      // });
      
      // Simulating API call
      setTimeout(() => {
        setLoading(false);
        toast.success('Settings saved successfully');
      }, 800);
    } catch (error) {
      console.error('Error saving settings:', error);
      setLoading(false);
      toast.error('Failed to save settings');
    }
  };
  
  const handleDeleteAccount = () => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, you would delete the user account
      toast.info('Account deletion would be implemented in a real app');
    }
  };
  
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>You need to be logged in to access settings</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/login')}>Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle 
        title="Account Settings" 
        subtitle="Manage your account preferences and settings" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start bg-accent text-accent-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Security
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  Billing
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Settings */}
              <div>
                <h3 className="text-lg font-medium">Notifications</h3>
                <Separator className="my-2" />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive emails about your account activity</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={() => handleToggleChange('emailNotifications')}
                  />
                </div>
              </div>
              
              {/* Appearance Settings */}
              <div>
                <h3 className="text-lg font-medium">Appearance</h3>
                <Separator className="my-2" />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle dark mode on or off</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={settings.darkMode}
                    onCheckedChange={() => handleToggleChange('darkMode')}
                  />
                </div>
              </div>
              
              {/* Privacy Settings */}
              <div>
                <h3 className="text-lg font-medium">Privacy</h3>
                <Separator className="my-2" />
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={settings.privacySettings === 'public' ? 'default' : 'outline'}
                      onClick={() => setSettings({...settings, privacySettings: 'public'})}
                    >
                      Public
                    </Button>
                    <Button 
                      variant={settings.privacySettings === 'private' ? 'default' : 'outline'}
                      onClick={() => setSettings({...settings, privacySettings: 'private'})}
                    >
                      Private
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {settings.privacySettings === 'public' 
                      ? 'Anyone can view your profile and recipes' 
                      : 'Only followers can view your profile and recipes'}
                  </p>
                </div>
              </div>
              
              {/* Language Settings */}
              <div>
                <h3 className="text-lg font-medium">Language</h3>
                <Separator className="my-2" />
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={settings.language === 'english' ? 'default' : 'outline'}
                      onClick={() => setSettings({...settings, language: 'english'})}
                    >
                      English
                    </Button>
                    <Button 
                      variant={settings.language === 'spanish' ? 'default' : 'outline'}
                      onClick={() => setSettings({...settings, language: 'spanish'})}
                    >
                      Spanish
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div>
                <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                <Separator className="my-2" />
                <div className="py-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button onClick={handleSaveSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;