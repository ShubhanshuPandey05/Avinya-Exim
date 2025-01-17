import React, { useEffect } from 'react'
import SignUpComponent from '../components/SignUpComponent'
import { useAuthContext } from '../context/authContext'
import { useNavigate } from 'react-router-dom';

export default function SignUpPage() {
  const { isAuth } = useAuthContext();
  const navigator = useNavigate();
  return (

    <SignUpComponent />

  )
}
