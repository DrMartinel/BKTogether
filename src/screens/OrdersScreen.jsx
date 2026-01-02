import './OrdersScreen.css'

const OrdersScreen = () => {
  const orders = [
    {
      id: 1,
      type: 'Ride',
      date: 'Today, 2:30 PM',
      status: 'Completed',
      price: '12.500 ₫',
      from: '123 Main St',
      to: '456 Oak Ave',
    },
    {
      id: 2,
      type: 'Food',
      date: 'Yesterday, 7:15 PM',
      status: 'Completed',
      price: '28.900 ₫',
      from: 'Restaurant Name',
      to: 'Your Address',
    },
    {
      id: 3,
      type: 'Ride',
      date: 'Dec 15, 10:00 AM',
      status: 'Completed',
      price: '15.200 ₫',
      from: '789 Pine St',
      to: '321 Elm Ave',
    },
  ]

  return (
    <div className="orders-screen">
      <div className="orders-header">
        <h1>My Orders</h1>
      </div>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-type">{order.type}</span>
              <span className="order-status">{order.status}</span>
            </div>
            <div className="order-date">{order.date}</div>
            <div className="order-route">
              <div className="route-point">
                <div className="route-dot start"></div>
                <span>{order.from}</span>
              </div>
              <div className="route-line"></div>
              <div className="route-point">
                <div className="route-dot end"></div>
                <span>{order.to}</span>
              </div>
            </div>
            <div className="order-footer">
              <span className="order-price">{order.price}</span>
              <button className="reorder-btn">Reorder</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrdersScreen

