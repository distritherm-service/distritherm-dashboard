import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Promotions from './pages/Promotions';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Clients from './pages/Clients';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import Commercial from './pages/Commercial';
import Profile from './pages/Profile';
import ProtectedRoute from './components/common/ProtectedRoute';
import Agencies from './pages/Agencies';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/order-details" element={<OrderDetails />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/agencies" element={<Agencies />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/commercial" element={<Commercial />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
          {/* Route catch-all pour rediriger vers login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
