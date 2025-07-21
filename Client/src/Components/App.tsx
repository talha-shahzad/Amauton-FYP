// @ts-nocheck
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './dashboard/Navbar';
import Menubar from './dashboard/Menubar';
import Settings from './settings/Settings';
import ProductList from './seller/productList';
import KeywordInput from './seller/keywordInput'; // Import your new component
import Dashboard from './dashboard/Dashboard';
import Trends from './trends/Trends';
import Login from './Login/Login';
import SignUp from './Login/Signup';
import ProtectedRoute from './ProtectedRoute';
import { Navigate } from 'react-router-dom';
import Pricing from './pricing/pricing'
import BuyPro from './pricing/BuyPro';
function App() {
  const [keyword, setKeyword] = useState<string>('');

  return (
    <Router>
      <div className="app">
        <div className="container-fluid">
          <div className="row" style={{ height: '100vh' }}>
            <Content setKeyword={setKeyword} keyword={keyword} />
          </div>
        </div>
      </div>
    </Router>
  );
}

function Content({ setKeyword, keyword }: { setKeyword: (keyword: string) => void; keyword: string }) {
  const location = useLocation();

  // Define the pages where Menubar and Navbar should be hidden
  const hideBars = location.pathname === '/' || location.pathname === '/signup';

  return (
    <>
      {!hideBars && <Navbar />}
      {!hideBars && (
        <div className="col-md-2" style={{ margin: 0, padding: 0 }}>
          <Menubar />
        </div>
      )}
      <div className={hideBars ? 'col-md-12' : 'col-md-9'} style={{ margin: 0, padding: 0 }}>

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trends"
            element={
              <ProtectedRoute>
                <Trends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller-operations"
            element={
              <ProtectedRoute>
                <>
                  <KeywordInput onSubmit={setKeyword} />
                  <ProductList keyword={keyword} />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/buy-pro" element={<ProtectedRoute><BuyPro /></ProtectedRoute>} />
          {/* Catch all invalid paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
