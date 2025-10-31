import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AnswerSheetCreator from './pages/AnswerSheetCreator';
import Certificate from './Certificate';
import DownloadCertificates from './DownloadCertificates';

// Protected Route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Home page component
const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Exam Management System
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Complete solution for university exam management and digital marking
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Admin Login
          </a>
          <a
            href="/certificate/110101"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            View Sample Certificate
          </a>
        </div>
      </div>
    </div>
  );
};

// Dashboard Home component
const DashboardHome = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h2>
        <p className="text-gray-600">
          You are logged in as <span className="font-semibold">{user?.role}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Students</h3>
          <p className="text-blue-700">Manage student records and import data</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Exams</h3>
          <p className="text-green-700">Create and manage examinations</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Answer Sheets</h3>
          <p className="text-purple-700">Generate QR-coded answer booklets</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">🚀 Quick Start</h3>
        <ol className="list-decimal list-inside space-y-2 text-yellow-800">
          <li>Add students via CSV import or manual entry</li>
          <li>Create subjects and assign teachers</li>
          <li>Define exams with all parameters</li>
          <li>Use the Answer Sheet Creator to generate booklets</li>
          <li>Print and conduct the exam</li>
          <li>Upload scanned copies for marking</li>
          <li>Mark using digital tools and rubrics</li>
          <li>Export final results</li>
        </ol>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Legacy certificate routes */}
          <Route path="/certificate/:hi" element={<Certificate />} />
          <Route path="/download" element={<DownloadCertificates />} />
          
          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route
              path="answer-sheet-creator"
              element={
                <ProtectedRoute adminOnly>
                  <AnswerSheetCreator />
                </ProtectedRoute>
              }
            />
            {/* Placeholder routes for other sections */}
            <Route
              path="students"
              element={
                <ProtectedRoute adminOnly>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Student Management</h2>
                    <p className="text-gray-600">Student management interface coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="exams"
              element={
                <ProtectedRoute adminOnly>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Exam Management</h2>
                    <p className="text-gray-600">Exam management interface coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="marking"
              element={
                <ProtectedRoute>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Digital Marking</h2>
                    <p className="text-gray-600">Marking interface coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
