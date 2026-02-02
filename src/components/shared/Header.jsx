import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo_3.png'
import { FaWhatsapp } from 'react-icons/fa'

function Header({ isAdmin = false }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobilePropertiesOpen, setIsMobilePropertiesOpen] = useState(false)
  const location = useLocation()

  const propertyTypes = [
    { id: 'all', name: 'All Properties', path: '/property-listing' },
    { id: 'apartments', name: 'Apartments', path: '/property-listing?category=apartments' },
    { id: 'villas', name: 'Villas', path: '/property-listing?category=villas' },
    { id: 'plots', name: 'Plots', path: '/property-listing?category=plots' }
  ]
  
  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path
  }

  // WhatsApp redirect function
  const redirectToWhatsApp = () => {
    window.open(`https://wa.me/919744642436`, '_blank')
  }

  return (
    <header className="w-full fixed z-50 py-2 bg-white shadow-md transition-all duration-500">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-16 lg:h-18">
          {/* Logo */}
          <div className="rounded-lg p-1 sm:p-2 md:p-2 lg:p-1">
            <Link 
              to="/" 
              className="text-2xl font-bold transition-colors text-green-600"
            >
              <span className="flex items-center">
                <img 
                  src={logo} 
                  alt="PropertyFinder Logo" 
                  className="h-24 sm:h-24 md:h-28 lg:h-36 w-auto sm:w-auto md:w-auto lg:w-auto rounded-md" 
                />
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { path: '/property-listing?type=rent', label: 'Rent' },
              { path: '/property-listing?type=sell', label: 'Sale' },
              { 
                label: 'Properties',
                dropdown: true,
                items: propertyTypes
              },
              { path: '/contact', label: 'Contact Us' },
              { path: '/about', label: 'About' }
            ].map((item) => (
              item.dropdown ? (
                <div key={item.label} className="relative group">
                  <button className="px-3 py-1.5 rounded-full text-sm font-medium transition-all text-green-600 hover:bg-green-50/10 flex items-center">
                    {item.label}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-1 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100]">
                    {item.items.map((subItem) => (
                      <Link
                        key={`${subItem.path}-${subItem.id}`}
                        to={subItem.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50/80 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`px-3 py-2 rounded-lg text-green-600 hover:bg-green-50/10 transition-all duration-300 ${
                    isActive(item.path) ? 'bg-green-50/20' : ''
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
            
            {/* Sell Property Button */}
            <button
              onClick={redirectToWhatsApp}
              className="ml-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-medium transition-all flex items-center shadow-sm hover:shadow"
            >
              <FaWhatsapp className="mr-2" />
              Sell Property
            </button>
          </nav>
          
          {/* Mobile Menu Button - now visible below 1024px */}
          <div className="lg:hidden flex items-center">
            {/* Sell Property Button for Mobile - improved sizing */}
            <button
              onClick={redirectToWhatsApp}
              className="mr-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs sm:text-sm font-medium transition-all flex items-center"
            >
              <FaWhatsapp className="mr-1 sm:mr-2" />
              <span>Sell Property</span>
            </button>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-full text-green-600"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 py-4 bg-white rounded-xl shadow-xl">
            <div className="flex flex-col space-y-2 px-4">
              {[
                { path: '/', label: 'Home' },
                { path: '/property-listing?type=rent', label: 'Rent' },
                { path: '/property-listing?type=sale', label: 'Sale' },
              ].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`px-4 py-2 rounded-lg ${
                    isActive(item.path)
                      ? 'bg-[#045a51] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Properties Dropdown in Mobile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsMobilePropertiesOpen(!isMobilePropertiesOpen)}
                  className="w-full px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex justify-between items-center"
                >
                  Properties
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 transition-transform ${isMobilePropertiesOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Properties Dropdown Content */}
                {isMobilePropertiesOpen && (
                  <div className="pl-4 mt-1 space-y-1">
                    {propertyTypes.map((type) => (
                      <Link
                        key={`mobile-${type.id}`}
                        to={type.path}
                        className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                      >
                        {type.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Remaining menu items */}
              {[
                { path: '/contact', label: 'Contact Us' },
                { path: '/about', label: 'About' }
              ].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`px-4 py-2 rounded-lg ${
                    isActive(item.path)
                      ? 'bg-[#045a51] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header










































