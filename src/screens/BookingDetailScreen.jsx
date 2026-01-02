import React, { useState } from 'react'
import './BookingDetailScreen.css'
import DriverChat from '../components/DriverChat'

const BookingDetailScreen = ({ booking, onBack }) => {
  if (!booking) {
    return (
      <div className="booking-detail-screen">
        <div className="booking-detail-header">
          <button onClick={onBack} className="back-button">
            &larr;
          </button>
          <h2>Booking Details</h2>
        </div>
        <div className="booking-detail-content">
          <p>No booking found.</p>
        </div>
      </div>
    )
  }

  const { driver = {}, route = {}, price = 0, paymentMethod = 'N/A' } = booking
  const vehicle = driver.vehicle || {}
  const distanceInKm = (route && typeof route.distance === 'number') ? (route.distance / 1000).toFixed(2) : '—'
  const durationInMins = (route && typeof route.duration === 'number') ? Math.round(route.duration / 60) : '—'

  const [showChat, setShowChat] = useState(false)

  return (
    <div className="booking-detail-screen">
      <div className="booking-detail-header">
        <button onClick={onBack} className="back-button">
          &larr;
        </button>
        <h2>Trip with {driver.name}</h2>
      </div>
      <div className="booking-detail-content">
        <div className="driver-profile">
          <img src={driver.avatar || null} alt={driver.name || 'Driver'} className="driver-avatar-large" />
          <h3>{driver.name || 'Driver'}</h3>
          <p>
            {vehicle.make || ''} {vehicle.model || ''}{vehicle.licensePlate ? ` - ${vehicle.licensePlate}` : ''}
          </p>
          <div className="driver-rating">
            <span>⭐ {(typeof driver.rating === 'number' ? driver.rating.toFixed(1) : 'N/A')}</span>
          </div>
        </div>

        <div className="trip-info-card">
          <h4>Trip Details</h4>
          <div className="route-details">
            <div className="route-point">
              <div className="route-icon start"></div>
              <p>{route.start?.name || ''}</p>
            </div>
            <div className="route-line"></div>
            <div className="route-point">
              <div className="route-icon end"></div>
              <p>{route.end?.name || ''}</p>
            </div>
          </div>
          <div className="trip-summary">
            <p>
              Distance: <strong>{distanceInKm} km</strong>
            </p>
            <p>
              Duration: <strong>{durationInMins} mins</strong>
            </p>
          </div>
        </div>

        <div className="pricing-card">
          <h4>Payment</h4>
          <div className="price-details">
            <p>
              Total Fare: <strong>{(typeof price === 'number' ? price.toLocaleString() : String(price))} VND</strong>
            </p>
            <p>
              Paid with: <strong>{paymentMethod}</strong>
            </p>
          </div>
        </div>
      </div>
      <div className="booking-detail-bottom">
        <button className="message-driver-btn" onClick={() => setShowChat(true)}>
          Message driver
        </button>
      </div>

      {showChat && (
        <DriverChat driver={driver} onClose={() => setShowChat(false)} />
      )}
    </div>
  )
}

export default BookingDetailScreen
