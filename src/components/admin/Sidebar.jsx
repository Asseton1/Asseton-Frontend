import React, { useState } from 'react';
import { HiMenuAlt3, HiHome, HiClipboardList, HiCog, HiLogout, HiX, HiPlus, HiPhotograph, HiMap, HiLocationMarker, HiOfficeBuilding, HiChevronDown, HiChevronRight } from 'react-icons/hi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiChatBubbleBottomCenterText } from 'react-icons/hi2';

const Sidebar = ({ open, setOpen, isMobile, onOverlayClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    locationManagement: false
  });

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('adminAuthenticated');
    setShowLogoutModal(false);
    navigate('/admin/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menus = [
    { name: "Dashboard", link: "/admin/dashboard", icon: HiHome },
    { name: "Properties", link: "/admin/properties", icon: HiClipboardList },
    { name: "Add Property", link: "/admin/add-property", icon: HiPlus },
    { name: "Banners", link: "/admin/banners", icon: HiPhotograph },
    { name: "Enquiry", link: "/admin/enquiries", icon: HiChatBubbleBottomCenterText },
    { name: "Settings", link: "/admin/settings", icon: HiCog },
    { name: "Logout", link: "/admin/login", icon: HiLogout, margin: true },
  ];

  const locationManagementItems = [
    { name: "Add State", link: "/admin/add-state", icon: HiOfficeBuilding },
    { name: "Add District", link: "/admin/add-district", icon: HiLocationMarker },
    { name: "Add City", link: "/admin/add-city", icon: HiMap }
  ];

  // Check if a menu item is active
  const isActive = (path) => location.pathname === path;
  const isLocationActive = () => locationManagementItems.some(item => isActive(item.link));

  const handleNavigation = (link) => {
    if (isMobile) {
      setOpen(false);
    }
    navigate(link);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && isMobile && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onOverlayClick}
        ></div>
      )}
      
      {/* Sidebar - completely hidden on mobile when closed */}
      <div 
        className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out
          ${open ? "w-72" : isMobile ? "w-0 opacity-0 pointer-events-none" : "w-16"} ${!open && !isMobile ? "lg:block" : ""}`}
        onMouseEnter={() => !open && !isMobile && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`bg-[#0f172a] h-full w-full duration-300 text-gray-100 px-4 overflow-y-auto hide-scrollbar ${!open && !isMobile ? "lg:w-16" : ""}`}>
          <div className="py-3 flex justify-end">
            <HiMenuAlt3
              size={26}
              className="cursor-pointer"
              onClick={() => {
                setOpen(!open);
                setIsHovered(false);
              }}
            />
          </div>
          <div className="mt-4 flex flex-col gap-4 relative">
            {menus?.map((menu, i) => (
              <div key={i}>
                {menu.name === "Logout" ? (
                  <button
                    onClick={handleLogoutClick}
                    className={`w-full ${menu?.margin && "mt-5"} group flex items-center text-sm gap-3.5 font-medium p-2 hover:bg-gray-800 rounded-md ${isActive(menu.link) && 'bg-gray-800'}`}
                  >
                    <div>{React.createElement(menu?.icon, { size: "20" })}</div>
                    <h2
                      style={{ transitionDelay: `${i + 3}00ms` }}
                      className={`whitespace-pre duration-300 ${
                        !open && !isHovered ? "opacity-0 translate-x-28 overflow-hidden" : "opacity-100 translate-x-0"
                      }`}
                    >
                      {menu?.name}
                    </h2>
                  </button>
                ) : (
                  <Link
                    to={menu?.link}
                    className={`${menu?.margin && "mt-5"} group flex items-center text-sm gap-3.5 font-medium p-2 hover:bg-gray-800 rounded-md ${isActive(menu.link) && 'bg-gray-800'}`}
                    onClick={() => handleNavigation(menu.link)}
                  >
                    <div>{React.createElement(menu?.icon, { size: "20" })}</div>
                    <h2
                      style={{ transitionDelay: `${i + 3}00ms` }}
                      className={`whitespace-pre duration-300 ${
                        !open && !isHovered ? "opacity-0 translate-x-28 overflow-hidden" : "opacity-100 translate-x-0"
                      }`}
                    >
                      {menu?.name}
                    </h2>
                  </Link>
                )}
              </div>
            ))}

            {/* Location Management Section */}
            <div className="mt-5">
              <div 
                className={`group flex items-center text-sm gap-3.5 font-medium p-2 hover:bg-gray-800 rounded-md cursor-pointer ${isLocationActive() && 'bg-gray-800'}`}
                onClick={() => toggleSection('locationManagement')}
              >
                <div>{React.createElement(HiMap, { size: "20" })}</div>
                <h2
                  className={`whitespace-pre duration-300 ${
                    !open && !isHovered ? "opacity-0 translate-x-28 overflow-hidden" : "opacity-100 translate-x-0"
                  }`}
                >
                  Location Management
                </h2>
                <div className={`ml-auto transition-transform duration-200 ${
                  !open && !isHovered ? "opacity-0" : "opacity-100"
                }`}>
                  {expandedSections.locationManagement ? (
                    <HiChevronDown className="h-4 w-4" />
                  ) : (
                    <HiChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>
              
              {/* Location Management Submenu */}
              {expandedSections.locationManagement && (
                <div className="ml-6 space-y-1 mt-2">
                  {locationManagementItems.map((item, j) => (
                    <Link
                      key={j}
                      to={item.link}
                      className={`group flex items-center text-sm gap-3.5 font-medium p-2 hover:bg-gray-700 rounded-md ${isActive(item.link) && 'bg-gray-700'}`}
                      onClick={() => handleNavigation(item.link)}
                    >
                      <div>{React.createElement(item?.icon, { size: "18" })}</div>
                      <h2
                        style={{ transitionDelay: `${j + 3}00ms` }}
                        className={`whitespace-pre duration-300 ${
                          !open && !isHovered ? "opacity-0 translate-x-28 overflow-hidden" : "opacity-100 translate-x-0"
                        }`}
                      >
                        {item?.name}
                      </h2>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={handleLogoutCancel}
            />

            {/* Modal panel */}
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  {/* Logout Icon */}
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <HiLogout className="h-6 w-6 text-red-600" />
                  </div>
                  
                  {/* Content */}
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Confirm Logout
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to log out? You will need to sign in again to access the admin dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleLogoutConfirm}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto transition duration-200 ease-in-out transform hover:scale-105"
                >
                  Logout
                </button>
                <button
                  type="button"
                  onClick={handleLogoutCancel}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition duration-200 ease-in-out transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={handleLogoutCancel}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar; 

