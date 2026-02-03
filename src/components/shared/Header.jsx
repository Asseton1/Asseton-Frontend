import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo_3.png'
import { FaWhatsapp } from 'react-icons/fa'
import { propertyAPI } from '../../Services/api'

function Header({ isAdmin = false }) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const [propertyTypes, setPropertyTypes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobilePropertiesOpen, setIsMobilePropertiesOpen] = useState(false)
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Set hasScrolled based on scroll position
      setHasScrolled(currentScrollY > 0)
      
      if (currentScrollY > lastScrollY) {
        setIsVisible(false) // Scrolling down
      } else {
        setIsVisible(true) // Scrolling up
      }
      
      setLastScrollY(currentScrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Handle smooth scrolling for hash links
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1))
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }, 100)
      }
    }
  }, [location.hash])
  
  // Check if link is active
  const isActive = (path) => {
    // Handle hash links (e.g., /about#services)
    if (path.includes('#')) {
      const [basePath, hash] = path.split('#')
      return location.pathname === basePath && location.hash === `#${hash}`
    }
    return location.pathname === path
  }

  // WhatsApp redirect function
  const redirectToWhatsApp = () => {
    window.open(`https://wa.me/9526661555`, '_blank')
  }

  // Add this new useEffect to fetch property types
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await propertyAPI.getPropertyTypes()
        // Handle both array and object responses
        const types = Array.isArray(response) ? response : (response?.data || [])
        setPropertyTypes(types)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching property types:', error);
        // Set empty array as fallback
        setPropertyTypes([])
        setIsLoading(false)
      }
    }

    fetchPropertyTypes()
  }, [])

  return (
    <header className={`w-full fixed z-50 py-2 transition-all duration-500 transform ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    } bg-white shadow-md`}>
      <div className="container mx-auto container-padding">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-16 lg:h-18">
          {/* Logo */}
          <div className="flex items-center rounded-lg p-0 ml-4 sm:ml-6 md:ml-8 lg:ml-10 mr-2 sm:mr-3 md:mr-4 lg:mr-4">
            <Link 
              to="/" 
              className="text-3xl font-bold transition-colors"
              style={{ color: 'rgb(18 110 60)' }}
            >
              <span className="flex items-center">
                <img 
                  src={logo} 
                  alt="Asseton Logo" 
                  className="h-14 sm:h-16 md:h-18 lg:h-24 w-auto max-w-[160px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[240px] rounded-md object-cover" 
                  style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(118deg) brightness(75%) contrast(119%)' }}
                />
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { path: '/property-listing?type=buy', label: 'Buy' },
              { path: '/property-listing?type=rent', label: 'Rent' },
              { 
                label: 'Properties',
                dropdown: true,
                items: [
                  // Add "All Properties" option first
                  {
                    path: '/property-listing',
                    label: 'All Properties',
                    id: 'all',
                    category: 'all'
                  },
                  // Then add all property types
                  ...propertyTypes.map(type => {
                    // Normalize the category name for consistent filtering
                    const normalizedCategory = type.name.toLowerCase().trim();
                    // URL encode the category to handle spaces properly
                    const encodedCategory = encodeURIComponent(normalizedCategory);
                    const path = `/property-listing?search=${encodedCategory}`;
                    return {
                      path: path,
                      label: type.name,
                      id: type.id,
                      category: normalizedCategory
                    };
                  })
                ]
              },
              { path: '/about#services', label: 'Services' },
              { path: '/contact', label: 'Contact Us' },
              { path: '/about', label: 'About' }
            ].map((item) => (
              item.dropdown ? (
                <div key={item.label} className="relative group">
                  <button className="px-3 py-1.5 rounded-full text-lg font-bold transition-all hover:bg-green-50/10 flex items-center justify-center" style={{ color: 'rgb(18 110 60)' }}>
                    {item.label}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className={`px-3 py-1.5 rounded-lg text-lg font-bold hover:bg-green-50/10 transition-all duration-300 flex items-center justify-center ${
                    isActive(item.path) ? 'bg-green-50/20' : ''
                  }`}
                  style={{ color: 'rgb(18 110 60)' }}
                >
                  {item.label}
                </Link>
              )
            ))}
            
            {/* Sell Property Button */}
            <button
              onClick={redirectToWhatsApp}
              className="ml-1 px-3 py-1.5 text-white rounded-full text-base font-bold transition-all flex items-center shadow-sm hover:shadow"
              style={{ backgroundColor: 'rgb(18 110 60)' }}
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
              className="mr-2 px-2 py-1.5 sm:px-3 sm:py-2 text-white rounded-full text-xs sm:text-base font-bold transition-all flex items-center"
              style={{ backgroundColor: 'rgb(18 110 60)' }}
            >
              <FaWhatsapp className="mr-1 sm:mr-2" />
              <span>Sell Property</span>
            </button>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-full"
              style={{ color: 'rgb(18 110 60)' }}
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
            <div className="flex flex-col space-y-3 px-4">
              {[
                { path: '/', label: 'Home' },
                { path: '/property-listing?type=buy', label: 'Buy' },
                { path: '/property-listing?type=rent', label: 'Rent' },
              ].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`px-4 py-3 rounded-lg text-lg font-semibold flex items-center ${
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
                  className="w-full px-4 py-3 rounded-lg text-lg font-semibold text-gray-700 hover:bg-gray-100 flex justify-between items-center"
                >
                  Properties
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 transition-transform ${isMobilePropertiesOpen ? 'rotate-180' : ''}`} 
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
                        to={`/property-listing?search=${encodeURIComponent(type.name.toLowerCase())}`}
                        className={`block px-4 py-2 rounded-lg text-base ${
                          isActive(`/property-listing?search=${encodeURIComponent(type.name.toLowerCase())}`)
                            ? 'bg-[#045a51] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {type.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Remaining menu items */}
              {[
                { path: '/about#services', label: 'Services' },
                { path: '/contact', label: 'Contact Us' },
                { path: '/about', label: 'About' }
              ].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`px-4 py-3 rounded-lg text-lg font-semibold flex items-center ${
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










































