import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { HiMenuAlt3, HiX } from 'react-icons/hi';

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle sidebar state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On mobile, sidebar starts closed; on desktop, it starts open
      setSidebarOpen(!mobile);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when clicking outside on mobile
  const handleMobileOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - completely hidden on mobile when closed */}
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
        isMobile={isMobile}
        onOverlayClick={handleMobileOverlayClick}
      />

      {/* Main Content - full width on mobile when sidebar closed */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen && !isMobile ? 'lg:ml-72' : 'ml-0'
      }`}>
        {/* Header */}
        <header className="sticky top-0 bg-white shadow-sm z-20 h-16">
          <div className="h-full px-4 md:px-6 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenuAlt3 className="h-6 w-6" />
              )}
            </button>
            
            {/* Page title for mobile */}
            <h1 className="lg:hidden text-lg font-semibold text-gray-800">Admin Dashboard</h1>
            
            {/* Right side content */}
            <div className="flex items-center space-x-4">
              {/* Add any header content here */}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout; 



