import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuth } from './context/AuthContext';

// Import the real pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStores from './pages/admin/AdminStores';
import UserStoreList from './pages/user/UserStoreList';
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Styles
import 'react-toastify/dist/ReactToastify.css';

// Private Route Component
const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth(); // Ensure loading is handled if it exists in context

  if (loading) return <div>Loading...</div>; // Optional: Prevent flicker while checking auth
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard if they try to access a wrong route
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/stores" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <Router>
      <NavBar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Admin Routes */}
        <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/stores" element={<AdminStores />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        {/* Normal User Routes */}
        <Route element={<PrivateRoute allowedRoles={['NORMAL_USER']} />}>
          <Route path="/stores" element={<UserStoreList />} />
        </Route>

        {/* Store Owner Routes */}
        <Route element={<PrivateRoute allowedRoles={['STORE_OWNER']} />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;