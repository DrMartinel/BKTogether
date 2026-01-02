import React from 'react'
import './BookingConfirmationDialog.css'

const BookingConfirmationDialog = ({ booking, onClose }) => {
  if (!booking) return null

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>Booking Confirmed!</h3>
        <p>You are all set for your ride with {booking.driver.name}.</p>
        <div className="driver-details-dialog">
          <img src={booking.driver.avatar} alt={booking.driver.name} />
          <div>
            <strong>{booking.driver.name}</strong>
            <span>
              {booking.driver.vehicle.make} {booking.driver.vehicle.model}
            </span>
          </div>
        </div>
        <button onClick={onClose}>Got it!</button>
      </div>
    </div>
  )
}

export default BookingConfirmationDialog
