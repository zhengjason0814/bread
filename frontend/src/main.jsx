import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import Charts from './pages/Charts.jsx'
import Anomalies from './pages/Anomalies.jsx'
import Budgets from './pages/Budgets.jsx'
import Recurring from './pages/Recurring.jsx'
import Accounts from './pages/Accounts.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AppLayout from './layout/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="charts" element={<Charts />} />
          <Route path="anomalies" element={<Anomalies />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="recurring" element={<Recurring />} />
          <Route path="accounts" element={<Accounts />} />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
