import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout';

import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <AppLayout><DashboardPage /></AppLayout>
        }
      />
      <Route
        path="/leads"
        element={
          <AppLayout><LeadsPage /></AppLayout>
        }
      />
      <Route
        path="/leads/:id"
        element={
          <AppLayout><LeadDetailPage /></AppLayout>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
