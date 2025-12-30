import './ServicesScreen.css'

const ServicesScreen = () => {
  const services = [
    {
      id: 1,
      name: 'Ride',
      icon: '🚗',
      description: 'Book a ride',
      color: '#00B14F',
    },
    {
      id: 2,
      name: 'Food',
      icon: '🍔',
      description: 'Order food delivery',
      color: '#FF6B6B',
    },
    {
      id: 3,
      name: 'Express',
      icon: '📦',
      description: 'Send packages',
      color: '#4A90E2',
    },
    {
      id: 4,
      name: 'Mart',
      icon: '🛒',
      description: 'Shop groceries',
      color: '#F5A623',
    },
    {
      id: 5,
      name: 'Pay',
      icon: '💳',
      description: 'Mobile payments',
      color: '#9013FE',
    },
    {
      id: 6,
      name: 'Rewards',
      icon: '⭐',
      description: 'Earn points',
      color: '#FFD700',
    },
  ]

  return (
    <div className="services-screen">
      <div className="services-header">
        <h1>Services</h1>
      </div>
      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-icon" style={{ backgroundColor: `${service.color}20` }}>
              <span style={{ fontSize: '32px' }}>{service.icon}</span>
            </div>
            <div className="service-name">{service.name}</div>
            <div className="service-description">{service.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ServicesScreen

