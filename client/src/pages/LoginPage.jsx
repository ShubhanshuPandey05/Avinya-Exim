import React, { useContext, useEffect } from 'react'
import LoginComponent from '../components/LoginComponent'
import { useAuthContext } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const {isAuth} = useAuthContext();
  const navigator = useNavigate();
  
  return (
    <LoginComponent/>
  )
}
