import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/shared/ProtectedRoute.jsx';

import RegisterPage from './pages/auth/RegisterPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';

import HomePage from './pages/shared/HomePage.jsx';
import TaskListPage from './pages/shared/TaskListPage.jsx';
import TaskDetailPage from './pages/shared/TaskDetailPage.jsx';
import OrderDetailPage from './pages/shared/OrderDetailPage.jsx';
import WalletPage from './pages/shared/WalletPage.jsx';
import ProfilePage from './pages/shared/ProfilePage.jsx';
import SettingsPage from './pages/shared/SettingsPage.jsx';
import NotificationsPage from './pages/shared/NotificationsPage.jsx';
import MessagesPage from './pages/shared/MessagesPage.jsx';
import ConversationPage from './pages/shared/ConversationPage.jsx';
import ReviewsPage from './pages/shared/ReviewsPage.jsx';
import PaymentCallbackPage from './pages/shared/PaymentCallbackPage.jsx';

import PostTaskPage from './pages/client/PostTaskPage.jsx';
import MyTasksPage from './pages/client/MyTasksPage.jsx';
import TaskApplicationsPage from './pages/client/TaskApplicationsPage.jsx';
import ActiveOrdersPage from './pages/client/ActiveOrdersPage.jsx';

import MyApplicationsPage from './pages/worker/MyApplicationsPage.jsx';
import MyJobsPage from './pages/worker/MyJobsPage.jsx';
import WorkerProfileSettingsPage from './pages/worker/WorkerProfileSettingsPage.jsx';

import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Paystack callback must be public */}
      <Route
        path="/payments/callback"
        element={<PaymentCallbackPage />}
      />

      {/* Authenticated app shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/tasks/saved" element={<TaskListPage />} />
          <Route path="/tasks/create" element={<PostTaskPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />

          <Route path="/client/tasks" element={<MyTasksPage />} />
          <Route
            path="/client/tasks/:taskId/applications"
            element={<TaskApplicationsPage />}
          />
          <Route path="/client/orders" element={<ActiveOrdersPage />} />
          <Route
            path="/client/orders/:id"
            element={<OrderDetailPage />}
          />

          <Route
            path="/worker/applications"
            element={<MyApplicationsPage />}
          />
          <Route path="/worker/jobs" element={<MyJobsPage />} />
          <Route
            path="/worker/jobs/:id"
            element={<OrderDetailPage />}
          />

          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/pro" element={<SettingsPage />} />
          <Route
            path="/settings/worker-profile"
            element={<WorkerProfileSettingsPage />}
          />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route
            path="/messages/:conversationId"
            element={<ConversationPage />}
          />
          <Route
            path="/reviews/:userId"
            element={<ReviewsPage />}
          />
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
