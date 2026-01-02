import React from 'react'
import './CurrentRide.css'

const CurrentRide = ({ booking, onClick }) => {
  if (!booking) {
    return null
  }

  const { driver, route } = booking
  const distanceInKm = (route.distance / 1000).toFixed(2)
  const durationInMins = Math.round(route.duration / 60)

  return (
    <div className="current-ride-popup" onClick={onClick}>
      <div className="current-ride-header">
        <h4>On a trip with {driver.name}</h4>
      </div>
      <div className="current-ride-content">
        <div className="ride-info">
          <p>
            {route.start.name} to {route.end.name}
          </p>
          <p>
            {distanceInKm} km, about {durationInMins} mins
          </p>
        </div>
        <div className="driver-avatar">
          <img src={driver.avatar} alt={driver.name} />
        </div>
      </div>
    </div>
  )
}

export default CurrentRide
