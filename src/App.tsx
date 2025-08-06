import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';

// Components
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ProjectEditor from './pages/ProjectEditor';
import ProjectList from './pages/ProjectList';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Calculator from './pages/Calculator';
import Demo from './pages/Demo';
import AIAssistant from './pages/AIAssistant';
import FurnitureBuilder from './components/FurnitureBuilder';

// Styles
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🪑</div>
          <div className="text-2xl font-bold text-white mb-2">CraftRuv</div>
          <div className="text-blue-200">Загрузка приложения...</div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/builder" element={<FurnitureBuilder />} />

                {/* Admin routes */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } />

                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/projects" element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectList />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/projects/new" element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectEditor />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/projects/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectEditor />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
          <Toaster position="top-right" richColors />
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
