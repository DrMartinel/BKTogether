import './BottomNavigation.css'

const BottomNavigation = ({ activeTab, onTabChange, onOpenRouteSeeker, showRouteSeeker }) => {
  return (
    <nav className="bottom-navigation">
      <button
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 22V12H15V22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Home</span>
      </button>
      <button
        className={`nav-item ${showRouteSeeker ? 'active' : ''}`}
        onClick={() => {
          if (onOpenRouteSeeker) onOpenRouteSeeker()
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8 6 6 9 6 12C6 16 9 20 12 22C15 20 18 16 18 12C18 9 16 6 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>Route</span>
      </button>
      {/* Orders tab removed */}
      <button
        className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
        onClick={() => onTabChange('services')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 6V12L16 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>Top Up</span>
      </button>
      <button
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onTabChange('profile')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>Profile</span>
      </button>
    </nav>
  )
}

export default BottomNavigation

