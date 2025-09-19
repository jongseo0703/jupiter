import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Favorites from './pages/Favorites';
import Community from './pages/Community';
import AboutUs from './pages/AboutUs';
import PostForm from './pages/PostForm';
import PostDetail from './pages/PostDetail';
import PostEdit from './pages/PostEdit';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import PagesList from './pages/PagesList';
import NotificationSettings from './pages/NotificationSettings';
import Settings from './pages/Settings';
import Help from './pages/Help';
import AdminPanel from './pages/AdminPanel';
import AdminUsers from './pages/AdminUsers';
import AdminProducts from './pages/AdminProducts';
import AdminNotifications from './pages/AdminNotifications';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <div className="App">
      <Router>
        <ScrollToTop />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/community" element={<Community />} />
            <Route path="/board" element={<Community />} />
            <Route path="/post-form" element={<PostForm />} />
            <Route path="/community-form" element={<PostForm />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/post/edit/:id" element={<PostEdit />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/pages" element={<PagesList />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notification-settings" element={<NotificationSettings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
