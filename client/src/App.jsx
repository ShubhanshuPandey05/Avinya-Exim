import './App.css';
import { useState } from 'react';
import { useEffect } from "react";

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthContext } from './context/authContext';

import { LoadingProvider } from './context/LoadingContext';
import LoadingScreen from './components/LoadingScreen';
import BottomNavBar from './components/BottomNavBar';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AddStocksPage from './pages/AddStocksPage';
import AddSalesPage from './pages/AddSalePage';
import HomeScreen from './pages/HomeScreen';

function App() {
  const { isAuth } = useAuthContext();

  // Extract authUser and city from localStorage safely
  const authUser = JSON.parse(localStorage.getItem('authUser')) || {
    contactPersonName: '',
    contactNo: '',
    companyName: '',
    userType: '',
    city: '',
  };
  const { city } = authUser;


  // useEffect(() => {
  //   const subscribeUser = async () => {
  //     if ("serviceWorker" in navigator && "PushManager" in window) {
  //       try {
  //         const registration = await navigator.serviceWorker.ready;
  //         const subscription = await registration.pushManager.subscribe({
  //           userVisibleOnly: true,
  //           applicationServerKey: "YOUR_PUBLIC_VAPID_KEY", // Replace with your public key
  //         });

  //         // Send subscription to your backend
  //         await fetch("http://localhost:8000/api/subscribe", {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(subscription),
  //         });

  //         console.log("User subscribed:", subscription);
  //       } catch (error) {
  //         console.error("Failed to subscribe user:", error);
  //       }
  //     }
  //   };

  //   subscribeUser();
  // }, [])




  // Define routes based on user city
  const getRoutes = () => {
    const commonRoutes = [
      <Route key="login" path="/login" element={isAuth ? <Navigate to="/" /> : <LoginPage />} />,
      <Route key="signUp" path="/signUp" element={isAuth ? <Navigate to="/" /> : <SignUpPage />} />,
      <Route key="home" path="/" element={isAuth ? <HomeScreen /> : <Navigate to="/login" />} />,
    ];

    if (city === 'Surat') {
      commonRoutes.push(
        <Route key="add-stocks" path="/add-stocks" element={isAuth ? <AddStocksPage /> : <Navigate to="/login" />} />
      );
    }

    if (city === 'Bangladesh') {
      commonRoutes.push(
        <Route key="add-sales" path="/add-sales" element={isAuth ? <AddSalesPage /> : <Navigate to="/login" />} />
      );
    }

    return commonRoutes;
  };

  return (
    <LoadingProvider>
      <>
        <Toaster />
        <Router>
          <div className="pb-16 sm:pb-0">
            <Routes>{getRoutes()}</Routes>
          </div>
          {isAuth && city != "Kolkata" ? <BottomNavBar /> : ""}
        </Router>
        <LoadingScreen />
      </>
    </LoadingProvider>
  );
}

export default App;
