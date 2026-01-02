// User data
export const user = {
  id: 'user-001',
  name: 'Nguyen Van A',
  email: 'nguyenvana@example.com',
  phone: '+84 123 456 789',
  avatar: null, // Can be a URL to avatar image
  
  // Payment methods and balances
  bkCredit: {
    balance: 50000, // in BKCredit units (1 credit = 10 VND)
    currency: 'BKCredit'
  },
  bkCreditPlus: {
    balance: 100000, // in BKCredit units (1 credit = 10 VND)
    currency: 'BKCreditPlus'
  },
  
  // Additional user information
  address: '123 Le Loi Street, Hoan Kiem, Hanoi',
  rating: 4.8,
  totalTrips: 45,
  
  // Preferences
  preferredPaymentMethod: 'bkcredit', // 'bkcredit', 'bkcreditplus', or 'cash'
  favoriteLocations: []
}

