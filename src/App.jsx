import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, CartProvider } from "./context";
import Header from "./components/EnhancedHeader";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Footer from "./components/Footer";
import EMandi from "./pages/EMandi";
import Marketplace from "./pages/Marketplace";
import ProductDetails from "./pages/ProductDetails";
import Home from "./pages/Home";
import SellerDashboard from "./pages/SellerDashboard";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Auction from "./pages/Auction";
import { GOOGLE_CLIENT_ID } from '../config';
import VerifyEmail from "./pages/VerifyEmail";
import ScrollRestore from "./components/ScrollRestore";

const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollRestore />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/emandi" element={<EMandi />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/auctions" element={<Auction />} />
                  <Route path="/seller-dashboard" element={<SellerDashboard />} />
                  <Route path="/seller/dashboard" element={<SellerDashboard />} />
                  <Route path="/profile" element={<Profile />} />
<Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;