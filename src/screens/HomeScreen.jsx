import { user } from '../data/user'
import './HomeScreen.css'

const HomeScreen = ({ onBookRide }) => {
  return (
    <div className="home-screen">
      <div className="home-container">
        {/* User Header */}
        <div className="user-header">
          <div className="user-greeting">
            <h1>Hello, {user.name.split(' ')[0]}!</h1>
            <p className="user-location">{user.address}</p>
          </div>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="user-avatar" />
          ) : (
            <div className="user-avatar-placeholder">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Credit Balances */}
        <div className="credits-section">
          <h2 className="section-title">Your Credits</h2>
          <div className="credits-grid">
            <div className="credit-card bkcredit">
              <div className="credit-icon">💳</div>
              <div className="credit-info">
                <div className="credit-name">BKCredit</div>
                <div className="credit-balance">
                  {user.bkCredit.balance.toLocaleString('vi-VN')} <span className="credit-unit">credit</span>
                </div>
                <div className="credit-equivalent">
                  ≈ {(user.bkCredit.balance * 10).toLocaleString('vi-VN')} ₫
                </div>
              </div>
            </div>
            <div className="credit-card bkcreditplus">
              <div className="credit-icon">💎</div>
              <div className="credit-info">
                <div className="credit-name">BKCreditPlus</div>
                <div className="credit-balance">
                  {user.bkCreditPlus.balance.toLocaleString('vi-VN')} <span className="credit-unit">credit</span>
                </div>
                <div className="credit-equivalent">
                  ≈ {(user.bkCreditPlus.balance * 10).toLocaleString('vi-VN')} ₫
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <button className="quick-action-btn primary" onClick={onBookRide}>
              <span className="action-icon">🚗</span>
              <span className="action-label">Book a Ride</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">📋</span>
              <span className="action-label">My Orders</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">💳</span>
              <span className="action-label">Top Up</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">⭐</span>
              <span className="action-label">Rate Trip</span>
            </button>
          </div>
        </div>

        {/* User Stats */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-value">{user.totalTrips}</div>
            <div className="stat-label">Total Trips</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">⭐ {user.rating}</div>
            <div className="stat-label">Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {(user.bkCredit.balance + user.bkCreditPlus.balance).toLocaleString('vi-VN')}
            </div>
            <div className="stat-label">Total Credits</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
