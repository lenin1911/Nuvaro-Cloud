import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CloudBackground from './components/CloudBackground';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import MyFiles from './pages/MyFiles';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import { Loader } from 'lucide-react';
import './App.css';

// Guard component for authenticated users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center relative z-50">
        <Loader className="h-8 w-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Dynamic root router to show Landing page to guests and Dashboard to members
const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center relative z-50">
        <Loader className="h-8 w-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <ProtectedRoute><Dashboard /></ProtectedRoute>;
  }

  return <Landing />;
};

// Guard component for guests (unauthenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center relative z-50">
        <Loader className="h-8 w-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CloudBackground />
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Dynamic Root Route */}
            <Route 
              path="/" 
              element={
                <RootRoute />
              } 
            />
            <Route 
              path="/files" 
              element={
                <ProtectedRoute>
                  <MyFiles />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />

            {/* 404 Route */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
