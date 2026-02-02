import { Link } from 'react-router-dom'
import logo from '../../assets/logo_3.png'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Main footer content */}
      <div className="container mx-auto px-4 sm:px-6 pt-16 pb-8">
        {/* Top section with logo, description and newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand section */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
            <span className="flex items-center">
                <img 
                  src={logo} 
                  alt="PropertyFinder Logo" 
                  className="h-24 sm:h-24 md:h-28 lg:h-36 w-auto sm:w-auto md:w-auto lg:w-auto rounded-md" 
                />
              </span>
            </Link>
            <p className="text-gray-400 mt-4 leading-relaxed">
              Find your dream property with our extensive listings of homes, apartments, and commercial spaces throughout Kerala.
            </p>
            <div className="flex space-x-4 pt-4">
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300">
                <FaFacebookF className="text-white text-sm" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300">
                <FaTwitter className="text-white text-sm" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300">
                <FaInstagram className="text-white text-sm" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300">
                <FaLinkedinIn className="text-white text-sm" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-6 relative">
              Quick Links
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-green-400 -mb-2"></span>
            </h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>Home</Link></li>
              <li><Link to="/property-listing?type=rent" className="text-gray-400 hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>For Rent</Link></li>
              <li><Link to="/property-listing?type=sale" className="text-gray-400 hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>For Sale</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>Contact</Link></li>
            </ul>
          </div>
          
          {/* Property Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-6 relative">
              Property Types
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-green-400 -mb-2"></span>
            </h3>
            <ul className="space-y-3">
              <li><Link to="/property-listing?category=apartments" className="text-gray-400 hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>Apartments</Link></li>
              <li><Link to="/property-listing?category=villas" className="text-gray-400 hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>Villas</Link></li>
              <li><Link to="/property-listing?category=commercial" className="text-gray-400 hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>Commercial</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-6 relative">
              Contact Us
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-green-400 -mb-2"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-blue-400 mt-1 mr-3" />
                <span className="text-gray-400">123 Property Street, Real Estate City, Kerala, India</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-blue-400 mr-3" />
                <span className="text-gray-400">+91 9744642436</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-blue-400 mr-3" />
                <span className="text-gray-400">info@propertyfinder.com</span>
              </li>
              <li className="mt-6">
                <a 
                  href="https://wa.me/919744642436" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <FaWhatsapp className="mr-2" />
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>
        
        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} PropertyFinder. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


