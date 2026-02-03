import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import UserHome from './components/user/UserHome'
import AdminLogin from './components/admin/AdminLogin'
import PropertyListing from './components/user/PropertyListing'
import PropertyDetails from './components/user/PropertyDetails'
import ContactUs from './components/user/ContactUs'
import About from './components/user/About'
import PrivacyPolicy from './components/user/PrivacyPolicy'
import ScrollToTop from './components/ScrollToTop'
import Dashboard from './components/admin/Dashboard'
import PropertyList from './components/admin/PropertyList'
import AddPropertyPage from './components/admin/AddProperty'
import BannerManagement from './components/admin/BannerManagement'
import Settings from './components/admin/Settings'
import AdminLayout from './components/admin/AdminLayout'
import EditProperty from './components/admin/EditProperty'
import Enquiries from './components/admin/Enquiries'
import AddState from './components/admin/AddState'
import AddDistrict from './components/admin/AddDistrict'
import AddCity from './components/admin/AddCity'
import NotFound from './components/shared/NotFound'
// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Default route redirects to user home */}
        <Route path="/" element={<UserHome />} />
        
        {/* User routes */}
        <Route path="/user" element={<UserHome />} />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/properties" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PropertyList />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/add-property" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AddPropertyPage />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

          <Route 
            path="/admin/banners" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <BannerManagement />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/enquiries" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Enquiries />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Settings />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />

        <Route 
          path="/admin/edit-property/:id" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <EditProperty />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        {/* Location Management Routes */}
        <Route 
          path="/admin/add-state" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AddState />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/add-district" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AddDistrict />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/add-city" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AddCity />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route path="/property-listing" element={<PropertyListing />} />
        <Route path="/property/:id" element={<PropertyDetails />} />

        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        
        {/* 404 Not Found route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App


