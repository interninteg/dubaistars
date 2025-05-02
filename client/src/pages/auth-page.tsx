import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Loader2, RocketIcon } from 'lucide-react';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const { toast } = useToast();
  
  // Check if we should show the register tab
  useEffect(() => {
    const storedTab = localStorage.getItem('authTab');
    if (storedTab === 'register') {
      setActiveTab('register');
      // Clear after using it once
      localStorage.removeItem('authTab');
    }
  }, []);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.username, data.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Handle register form submission
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      await register(data);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  // If already authenticated, redirect to home page
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Column: Auth Form */}
      <div className="w-full md:w-1/2 p-6 md:p-10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Dubai to the Stars</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one to book your space adventure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Your username"
                        {...loginForm.register('username')}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-red-500 text-sm">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Your password"
                        {...loginForm.register('password')}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-red-500 text-sm">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reg-username">Username</Label>
                      <Input
                        id="reg-username"
                        placeholder="Choose a username"
                        {...registerForm.register('username')}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-red-500 text-sm">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="Your email address"
                        {...registerForm.register('email')}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-red-500 text-sm">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="First name"
                          {...registerForm.register('firstName')}
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-red-500 text-sm">
                            {registerForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Last name"
                          {...registerForm.register('lastName')}
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-red-500 text-sm">
                            {registerForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Choose a password"
                        {...registerForm.register('password')}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-red-500 text-sm">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                        </>
                      ) : (
                        'Register'
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-10 flex-col justify-center items-center">
        <div className="max-w-md space-y-6">
          <RocketIcon className="h-16 w-16 text-purple-400" />
          <h1 className="text-4xl font-bold">The Ultimate Space Travel Experience</h1>
          <p className="text-xl">
            Join our exclusive interplanetary travel platform and explore the wonders of our solar system.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-purple-400"></div>
              <p>Interactive solar system exploration</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-purple-400"></div>
              <p>Luxury space accommodations</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-purple-400"></div>
              <p>AI-powered travel recommendations</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-purple-400"></div>
              <p>Seamless booking experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;