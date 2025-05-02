import React from 'react';
import { Redirect, Route } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  path,
  component: Component
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          );
        }

        if (!isAuthenticated) {
          return <Redirect to="/auth" />;
        }

        return <Component />;
      }}
    </Route>
  );
};