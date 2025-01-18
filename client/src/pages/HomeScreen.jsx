import React from 'react'
import YourStocks from '../components/MyStocks'
import LogOut from '../components/LogOut'

function HomeScreen() {
  return (
    <div>
      <LogOut />
      <YourStocks />
    </div>
  )
}

export default HomeScreen