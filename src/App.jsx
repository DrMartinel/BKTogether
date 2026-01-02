import { useState } from 'react'
import BottomNavigation from './components/BottomNavigation'
import HomeScreen from './screens/HomeScreen'
import RouteSeeker from './screens/RouteSeeker'
import ServicesScreen from './screens/ServicesScreen'
import ProfileScreen from './screens/ProfileScreen'
import CurrentRide from './components/CurrentRide'
import BookingDetailScreen from './screens/BookingDetailScreen'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [showRouteSeeker, setShowRouteSeeker] = useState(false)
  const [currentBooking, setCurrentBooking] = useState(null)
  const [showBookingDetail, setShowBookingDetail] = useState(false)

  const handleBookingConfirmed = (bookingDetails) => {
    setCurrentBooking(bookingDetails)
    setShowRouteSeeker(false)
  }

  const renderScreen = () => {
    if (showBookingDetail) {
      return <BookingDetailScreen booking={currentBooking} onBack={() => setShowBookingDetail(false)} />
    }
    // Show RouteSeeker if explicitly requested
    if (showRouteSeeker) {
      return (
        <RouteSeeker
          onBack={() => setShowRouteSeeker(false)}
          onBookingConfirmed={handleBookingConfirmed}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab)
            setShowRouteSeeker(false)
          }}
          showRouteSeeker={showRouteSeeker}
          onOpenRouteSeeker={() => setShowRouteSeeker(true)}
        />
      )
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen onBookRide={() => setShowRouteSeeker(true)} />
      /* 'orders' tab removed */
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
      {currentBooking && !showRouteSeeker && !showBookingDetail && (
        <CurrentRide booking={currentBooking} onClick={() => setShowBookingDetail(true)} />
      )}
      {!showRouteSeeker && !showBookingDetail && (
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenRouteSeeker={() => setShowRouteSeeker(true)}
          showRouteSeeker={showRouteSeeker}
        />
      )}
    </div>
  )
}

export default App

