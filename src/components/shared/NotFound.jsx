import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAdmin={false} />
      
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.5 0-4.847-.655-6.879-1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Go Back Home
            </Link>
            
            <Link
              to="/property-listing"
              className="inline-block w-full bg-white hover:bg-gray-50 text-green-600 font-semibold py-3 px-6 rounded-lg border-2 border-green-600 transition-colors duration-200"
            >
              Browse Properties
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">You might also be looking for:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/about" className="text-green-600 hover:text-green-700 transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-green-600 hover:text-green-700 transition-colors">
                Contact Us
              </Link>
              <Link to="/property-listing?type=buy" className="text-green-600 hover:text-green-700 transition-colors">
                Buy Properties
              </Link>
              <Link to="/property-listing?type=rent" className="text-green-600 hover:text-green-700 transition-colors">
                Rent Properties
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default NotFound 