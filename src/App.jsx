import { useState } from 'react'
import BottomNavigation from './components/BottomNavigation'
import HomeScreen from './screens/HomeScreen'
import OrdersScreen from './screens/OrdersScreen'
import ServicesScreen from './screens/ServicesScreen'
import ProfileScreen from './screens/ProfileScreen'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />
      case 'orders':
        return <OrdersScreen />
      case 'services':
        return <ServicesScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <HomeScreen />
    }
  }

return (
    <div className="app">
      <div className="app-content">{renderScreen()}</div>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App

