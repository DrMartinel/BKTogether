# BKTogether - Ride Sharing App

A mobile-first ride-sharing application similar to Grab, built with React and Mapbox GL JS. The app matches users with drivers who share similar routes, optimizing for the shortest total combined route.

## Features

### 🗺️ Interactive Map
- Full-screen Mapbox GL JS map centered on Hanoi, Vietnam
- Real-time user location detection using browser geolocation API
- Route visualization between pickup and destination points
- Combined route display showing driver pickup → user pickup → destination

### 🚗 Driver Matching System
- **100+ hardcoded drivers** distributed across Hanoi
- **Dense coverage**: At least 2 drivers within 200 meters of any point
- **Smart matching algorithm**: Finds drivers with similar routes (within 3km threshold)
- **Optimal route calculation**: Selects drivers based on shortest total combined route distance
- **Top 5 matches**: Displays the best driver options sorted by route efficiency

### 📍 Location Features
- **Start location**: User's pickup point
- **End location**: Destination
- **3-checkpoint routes**: Driver location → User pickup → Destination
- Mapbox SearchBox integration for address autocomplete
- Visual markers for start (green), end (red), and driver locations (gold)

### 📱 Mobile-First Design
- Responsive mobile layout (max-width: 428px)
- Bottom navigation bar with 4 tabs:
  - **Home**: Map view with route planning
  - **Orders**: Order history
  - **Services**: Service categories
  - **Profile**: User profile and settings
- Touch-friendly UI with Grab-inspired green theme (#00B14F)

### 🎯 Driver Display
- **Nearby drivers**: Shows available drivers within 100 meters of start location
- **Zoom-based visibility**: Markers automatically hide when zoomed in too close (zoom > 17)
- **Driver cards**: Display driver name, rating, vehicle type, route distance, and duration
- **Collapsible driver list**: Expandable/collapsible list with hidden scrollbar
- **Driver selection**: Click a driver to zoom to their location and view combined route

## Tech Stack

- **React 19.1.1** - UI framework
- **Mapbox GL JS 3.15.0** - Map rendering and routing
- **@mapbox/search-js-react 1.5.1** - Address search and autocomplete
- **Vite 7.1.2** - Build tool and dev server

## Prerequisites

- Node.js v18.20 or higher
- npm
- Mapbox account with access token

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd BKTogether
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Mapbox access token:
   - Create a `.env` file in the root directory
   - Add your Mapbox access token:
   ```
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   ```
   - Get your token from [Mapbox Account](https://console.mapbox.com/)

4. Run the development server:
```bash
npm run dev
```

5. Open the app in your browser at [http://localhost:5173](http://localhost:5173)

## Project Structure

```
BKTogether/
├── src/
│   ├── components/
│   │   ├── BottomNavigation.jsx      # Bottom nav bar component
│   │   └── BottomNavigation.css
│   ├── screens/
│   │   ├── HomeScreen.jsx           # Main map and route planning screen
│   │   ├── HomeScreen.css
│   │   ├── OrdersScreen.jsx         # Order history screen
│   │   ├── OrdersScreen.css
│   │   ├── ServicesScreen.jsx       # Services grid screen
│   │   ├── ServicesScreen.css
│   │   ├── ProfileScreen.jsx        # User profile screen
│   │   └── ProfileScreen.css
│   ├── data/
│   │   └── drivers.js                # Hardcoded driver data (100+ drivers)
│   ├── App.jsx                      # Main app component with routing
│   ├── App.css                      # Global app styles
│   └── main.jsx                     # App entry point
├── public/
├── package.json
└── README.md
```

## How It Works

### Route Planning
1. User enters **pickup location** (start)
2. User enters **destination** (end)
3. Route is automatically calculated and displayed on the map
4. User clicks **"Find Drivers"** to search for matching drivers

### Driver Matching Algorithm
1. Filters available drivers with routes similar to the user's route (within 3km threshold)
2. For each potential match, calculates the combined route:
   - **Driver's current location** → **User's pickup** → **Destination**
3. Sorts drivers by shortest total route distance
4. Displays top 5 matches with route details

### Route Visualization
- **Green line**: User's route (pickup → destination)
- **Blue dashed line**: Combined route when a driver is selected
- **Markers**:
  - 🟢 Green: User's pickup location
  - 🔴 Red: Destination
  - 🟡 Gold: Matched drivers (numbered)
  - 🔵 Blue: Nearby drivers (within 100m of start)

## Configuration

### Driver Density
Driver distribution is configured in `src/data/drivers.js`:
- Grid spacing: ~140 meters (ensures 2 drivers within 200m of any point)
- Coverage area: Hanoi, Vietnam (105.6°-105.9° longitude, 20.8°-21.2° latitude)
- Total drivers: ~1,000-1,500 drivers

### Map Center
Default map center is set to Hanoi, Vietnam:
```javascript
const center = [105.8342, 21.0285] // Hanoi, Vietnam
```

### Zoom Thresholds
- Markers hide when zoom > 17
- Default zoom: 13
- User location zoom: 15
- Driver selection zoom: 15

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Modern browsers with geolocation API support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Notes

- The app uses hardcoded driver data for demonstration purposes
- Driver locations are randomly generated within Hanoi bounds
- Route calculations use Mapbox Directions API (requires valid access token)
- User location is requested via browser geolocation API

## License

This project is for educational/demonstration purposes.
