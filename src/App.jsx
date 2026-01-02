import { useState } from 'react'
import BottomNavigation from './components/BottomNavigation'
import HomeScreen from './screens/HomeScreen'
import RouteSeeker from './screens/RouteSeeker'
import OrdersScreen from './screens/OrdersScreen'
import ServicesScreen from './screens/ServicesScreen'
import ProfileScreen from './screens/ProfileScreen'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [showRouteSeeker, setShowRouteSeeker] = useState(false)

  const renderScreen = () => {
    // Show RouteSeeker if explicitly requested
    if (showRouteSeeker) {
      return <RouteSeeker onBack={() => setShowRouteSeeker(false)} />
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen onBookRide={() => setShowRouteSeeker(true)} />
      case 'orders':
        return <OrdersScreen />
      case 'services':
        return <ServicesScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <HomeScreen onBookRide={() => setShowRouteSeeker(true)} />
    }
  }

return (
    <div className="app">
      <div className="app-content">{renderScreen()}</div>
      {!showRouteSeeker && <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  )
}

export default App

