import './App.css';
import { useState } from 'react';
import { useEffect } from "react";

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthContext } from './context/authContext';

import { LoadingProvider } from './context/LoadingContext';
import { DataProvider } from './context/DataContext';
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
    MobileNo: '',
    companyName: '',
    userType: '',
    city: '',
  };
  const { city } = authUser;
  const { MobileNo } = authUser;


  const VAPID_PUBLIC_KEY = "BACTh3rYPVGgOV0LDbRsN7sPBNYIG-s3u_1WMwwnZN-u2GB-i2ZaOoUrS_xwjr8Fqb1dEN3ZmKp0gQSnGEwgm3I";

  const subscribeUser = async () => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        // Register the service worker
        const registration = await navigator.serviceWorker.register("/sw.js");

        // Check if the user is already subscribed
        const existingSubscription = await registration.pushManager.getSubscription();

        if (existingSubscription) {
          console.log("User is already subscribed.");
          return; // Prevent multiple subscriptions
        }

        // Ask for notification permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied.");
          return;
        }

        // Subscribe the user
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // Send the subscription to your backend to save it
        const res = await fetch(`${import.meta.env.VITE_SERVERURL}/api/notification/subscribe`, {
        // const res = await fetch("http://localhost:8000/api/notification/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subscription, contactNumber: MobileNo }),
          credentials: 'include'
        });

        if (!res.ok) {
          console.log("Error subscribing user:", res.statusText);
          return;
        }

      } catch (error) {
        console.error("Error subscribing the user:", error);
      }
    } else {
      console.error("Push messaging is not supported in this browser.");
    }
  };

  // Helper function to convert VAPID key to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
  };

  useEffect(() => {
    if (city === "Surat") {
      subscribeUser();
    }
  }, [city]);

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
      <DataProvider>
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
      </DataProvider>
    </LoadingProvider>
  );
}

export default App;