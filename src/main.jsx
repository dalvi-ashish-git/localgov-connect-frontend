import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import 'leaflet/dist/leaflet.css';

// Humare pages import karein
import LandingPage from './components/LandingPage.jsx';
import LoginPage from './components/LoginPage.jsx'
import CreateAccountPage from './components/CreateAccountPage.jsx'
import MainLayout from './components/MainLayout.jsx'
import HomePage from './components/HomePage.jsx'
import ReportIssuePage from './components/ReportIssuePage.jsx'
import ProfilePage from './components/ProfilePage.jsx'
import MapPage from './components/MapPage.jsx'
import MyActivityPage from './components/MyActivityPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminLayout from './components/AdminLayout.jsx';
import AdminDashboardPage from './components/AdminDashboardPage.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';
import OfficialLoginPage from './components/OfficialLoginPage.jsx';
import AdminReportsPage from './components/AdminReportsPage.jsx';
import AdminDepartmentsPage from './components/AdminDepartmentsPage.jsx';
import AdminAnalyticsPage from './components/AdminAnalyticsPage.jsx';
import IssueDetailPage from './components/IssueDetailPage.jsx';

const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <CreateAccountPage />,
  },
  {
    path: '/official-login',
    element: <OfficialLoginPage />,
  },
  // Protected Citizen Routes
  {
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'report-issue', element: <ReportIssuePage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'map', element: <MapPage /> },
          { path: 'my-activity', element: <MyActivityPage /> },
          { path: 'issue/:id', element: <IssueDetailPage />  },
        ]
      }
    ]
  },
  // Protected Admin Routes
  {
    path: '/admin',
    element: <AdminProtectedRoute />, // Admin protection yahan lagaya gaya hai
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: 'dashboard',
            element: <AdminDashboardPage />
          },
          {
            path: 'reports',
            element: <AdminReportsPage />
          },
          {
            path: 'departments',
            element: <AdminDepartmentsPage />
          },
          {
            path: 'analytics',
            element: <AdminAnalyticsPage />
          }
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
