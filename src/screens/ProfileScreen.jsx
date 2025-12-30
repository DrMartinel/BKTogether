import './ProfileScreen.css'

const ProfileScreen = () => {
  return (
    <div className="profile-screen">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">JD</div>
        </div>
        <h1>John Doe</h1>
        <p className="profile-phone">+1 (555) 123-4567</p>
      </div>

      <div className="profile-menu">
        <div className="menu-section">
          <div className="menu-item">
            <span className="menu-icon">👤</span>
            <span className="menu-text">Edit Profile</span>
            <span className="menu-arrow">›</span>
          </div>
          <div className="menu-item">
            <span className="menu-icon">📍</span>
            <span className="menu-text">Saved Places</span>
            <span className="menu-arrow">›</span>
          </div>
          <div className="menu-item">
            <span className="menu-icon">💳</span>
            <span className="menu-text">Payment Methods</span>
            <span className="menu-arrow">›</span>
          </div>
        </div>

        <div className="menu-section">
          <div className="menu-item">
            <span className="menu-icon">⭐</span>
            <span className="menu-text">Rewards & Points</span>
            <span className="menu-arrow">›</span>
          </div>
          <div className="menu-item">
            <span className="menu-icon">🎁</span>
            <span className="menu-text">Promotions</span>
            <span className="menu-arrow">›</span>
          </div>
        </div>

        <div className="menu-section">
          <div className="menu-item">
            <span className="menu-icon">❓</span>
            <span className="menu-text">Help & Support</span>
            <span className="menu-arrow">›</span>
          </div>
          <div className="menu-item">
            <span className="menu-icon">⚙️</span>
            <span className="menu-text">Settings</span>
            <span className="menu-arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileScreen

