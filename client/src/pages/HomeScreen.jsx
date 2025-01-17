import React from 'react'
import useLogOut from '../hooks/useLogOut'
import YourStocks from '../components/MyStocks'

function HomeScreen() {
  const { logOut } = useLogOut()
  return (
    <div>
      <button className='bg-red-500 text-white w-20 h-10 rounded-lg m-5' onClick={logOut}>Logout</button>
      <YourStocks />
    </div>
  )
}

export default HomeScreen