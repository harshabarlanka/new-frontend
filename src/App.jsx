import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import OrdersPage from "./pages/Orders";
import ScrollToTop from "./components/common/ScrollToTop";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/products"
        element={
          <Layout>
            <ProductsPage />
          </Layout>
        }
      />
      <Route
        path="/products/:id"
        element={
          <Layout>
            <ProductDetailPage />
          </Layout>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/cart"
        element={
          <Layout>
            <PrivateRoute>
              <CartPage />
            </PrivateRoute>
          </Layout>
        }
      />
      <Route
        path="/checkout"
        element={
          <Layout>
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          </Layout>
        }
      />
      <Route
        path="/orders"
        element={
          <Layout>
            <PrivateRoute>
              <OrdersPage />
            </PrivateRoute>
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="*"
        element={
          <Layout>
            <NotFoundPage />
          </Layout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
