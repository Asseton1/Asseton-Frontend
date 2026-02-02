import { useNavigate } from 'react-router-dom'

function AdminHeader() {
  const navigate = useNavigate()
  
  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated')
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">Property Listing Admin</h1>
          </div>
          
          <nav className="flex items-center space-x-4">
            <button 
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader