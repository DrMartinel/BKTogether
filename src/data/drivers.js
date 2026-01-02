// Generate drivers in Hanoi, Vietnam with dense distribution
// Each driver has: id, name, currentLocation (coordinates), destination (coordinates), route (optional waypoints)

const hanoiBounds = {
  minLng: 105.6,
  maxLng: 105.9,
  minLat: 20.8,
  maxLat: 21.2,
}

// At Hanoi's latitude (~21°N), approximate conversions:
// 1 degree latitude ≈ 111 km
// 1 degree longitude ≈ 104 km
// 200 meters ≈ 0.0018 degrees latitude ≈ 0.00192 degrees longitude

// Grid spacing to ensure 2 drivers within 200m of any point
// Using ~140m spacing (0.0013 degrees) to ensure coverage
const GRID_SPACING = 0.0013 // degrees (approximately 144 meters)

// Generate random coordinate within Hanoi bounds
const randomCoordinate = () => {
  const lng = hanoiBounds.minLng + Math.random() * (hanoiBounds.maxLng - hanoiBounds.minLng)
  const lat = hanoiBounds.minLat + Math.random() * (hanoiBounds.maxLat - hanoiBounds.minLat)
  return [lng, lat]
}

// Generate coordinate near a grid point (within ~100m radius)
const generateNearbyCoordinate = (baseLng, baseLat) => {
  // Add random offset (max ~0.0009 degrees ≈ 100 meters)
  const offsetLng = (Math.random() - 0.5) * 0.0018
  const offsetLat = (Math.random() - 0.5) * 0.0018
  return [
    Math.max(hanoiBounds.minLng, Math.min(hanoiBounds.maxLng, baseLng + offsetLng)),
    Math.max(hanoiBounds.minLat, Math.min(hanoiBounds.maxLat, baseLat + offsetLat))
  ]
}

// Vietnamese first names
const firstNames = [
  'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Vo', 'Dang', 'Bui', 'Do',
  'Ho', 'Ngo', 'Duong', 'Ly', 'Phan', 'Truong', 'Dinh', 'Dao', 'Dinh', 'Nguyen'
]

// Vietnamese last names
const lastNames = [
  'Van', 'Thi', 'Duc', 'Minh', 'Anh', 'Hung', 'Lan', 'Hoa', 'Quang', 'Tuan',
  'Nam', 'Linh', 'Hai', 'Thu', 'Khanh', 'Phuong', 'Long', 'Thanh', 'Dung', 'Tien'
]

// Generate a random driver
const generateDriver = (id) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const currentLocation = randomCoordinate()
  const destination = randomCoordinate()
  
  // Some drivers have waypoints (30% chance)
  const hasWaypoints = Math.random() < 0.3
  const waypoints = hasWaypoints 
    ? [randomCoordinate()] 
    : []

  return {
    id: id,
    name: `${firstName} ${lastName}`,
    currentLocation: {
      coordinates: currentLocation,
      name: `Location ${id}`,
    },
    destination: {
      coordinates: destination,
      name: `Destination ${id}`,
    },
    waypoints: waypoints.map((coord, idx) => ({
      coordinates: coord,
      name: `Waypoint ${idx + 1}`,
    })),
    rating: 4 + Math.random(), // 4.0 to 5.0
    vehicleType: ['Car', 'Motorcycle', 'Car', 'Car', 'Motorcycle'][Math.floor(Math.random() * 5)],
    available: Math.random() > 0.2, // 80% available
    avatar: `https://i.pravatar.cc/150?u=${id}`,
    vehicle: {
      make: 'Honda',
      model: 'Wave',
      licensePlate: `${Math.floor(Math.random() * 90 + 10)} - ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}1 ${Math.floor(Math.random() * 90000 + 10000)}`,
    },
  }
}

// Generate drivers on a grid to ensure dense coverage
// Calculate grid dimensions
const lngRange = hanoiBounds.maxLng - hanoiBounds.minLng
const latRange = hanoiBounds.maxLat - hanoiBounds.minLat
const gridCols = Math.ceil(lngRange / GRID_SPACING)
const gridRows = Math.ceil(latRange / GRID_SPACING)

// Generate drivers: 2-3 drivers per grid point
let driverId = 1
const generatedDrivers = []

for (let row = 0; row < gridRows; row++) {
  for (let col = 0; col < gridCols; col++) {
    const baseLng = hanoiBounds.minLng + (col * GRID_SPACING)
    const baseLat = hanoiBounds.minLat + (row * GRID_SPACING)
    
    // Generate 2-3 drivers near each grid point
    const driversPerPoint = 2 + Math.floor(Math.random() * 2) // 2 or 3 drivers
    
    for (let i = 0; i < driversPerPoint; i++) {
      const currentLocation = generateNearbyCoordinate(baseLng, baseLat)
      const destination = randomCoordinate()
      
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      
      // Some drivers have waypoints (30% chance)
      const hasWaypoints = Math.random() < 0.3
      const waypoints = hasWaypoints 
        ? [randomCoordinate()] 
        : []

      generatedDrivers.push({
        id: driverId++,
        name: `${firstName} ${lastName}`,
        currentLocation: {
          coordinates: currentLocation,
          name: `Location ${driverId}`,
        },
        destination: {
          coordinates: destination,
          name: `Destination ${driverId}`,
        },
        waypoints: waypoints.map((coord, idx) => ({
          coordinates: coord,
          name: `Waypoint ${idx + 1}`,
        })),
        rating: Math.round(Math.random() * 10) / 10 + 4, // 4.0 to 5.0 (number)
        vehicleType: ['Car', 'Motorcycle', 'Car', 'Car', 'Motorcycle'][Math.floor(Math.random() * 5)],
        available: Math.random() > 0.2, // 80% available
        avatar: `https://i.pravatar.cc/150?u=${driverId}`,
        vehicle: {
          make: 'Honda',
          model: 'Wave',
          licensePlate: `${Math.floor(Math.random() * 90 + 10)} - ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}1 ${Math.floor(Math.random() * 90000 + 10000)}`,
        },
      })
    }
  }
}

// Export the generated drivers
export const drivers = generatedDrivers

console.log(`Generated ${drivers.length} drivers in Hanoi`)

