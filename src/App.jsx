import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import { Layout, Loader } from './components/ui';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Reviews from './pages/Reviews';

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Guard><Layout /></Guard>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="users" element={<Users />} />
        <Route path="reviews" element={<Reviews />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
