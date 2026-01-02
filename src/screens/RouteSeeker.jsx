import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { SearchBox } from '@mapbox/search-js-react'
import 'mapbox-gl/dist/mapbox-gl.css'
import './RouteSeeker.css'
import { drivers } from '../data/drivers'
import { user } from '../data/user'
import BottomNavigation from '../components/BottomNavigation'
import BookingConfirmationDialog from '../components/BookingConfirmationDialog'

const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
const center = [105.8342, 21.0285] // Hanoi, Vietnam

const RouteSeeker = ({ onBack, onBookingConfirmed, activeTab, onTabChange, showRouteSeeker, onOpenRouteSeeker }) => {
  const mapRef = useRef()
  const mapContainerRef = useRef()
  const startSearchRef = useRef()
  const endSearchRef = useRef()
  const startMarkerRef = useRef(null)
  const endMarkerRef = useRef(null)
  const driverMarkersRef = useRef([])
  const nearbyDriverMarkersRef = useRef([])
  const userLocationMarkerRef = useRef(null)
  const routeLayerRef = useRef(null)

  const [userLocation, setUserLocation] = useState(null) // User's current GPS location
  const [startLocation, setStartLocation] = useState(null) // User pickup location
  const [endLocation, setEndLocation] = useState(null) // Destination
  const [startInput, setStartInput] = useState('')
  const [endInput, setEndInput] = useState('')
  const [routeData, setRouteData] = useState(null)
  const [matchedDrivers, setMatchedDrivers] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [combinedRoute, setCombinedRoute] = useState(null)
  const [nearbyDrivers, setNearbyDrivers] = useState([])
  const [isDriversListExpanded, setIsDriversListExpanded] = useState(true)
  const [showBookingScreen, setShowBookingScreen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)

  // Handle zoom changes - hide markers when zoomed in too much
  const handleZoomChange = () => {
    if (!mapRef.current) return
    
    const currentZoom = mapRef.current.getZoom()
    const MAX_ZOOM_FOR_MARKERS = 17 // Hide markers when zoom > 17
    const shouldShow = currentZoom <= MAX_ZOOM_FOR_MARKERS
    
    // Update visibility of nearby driver markers based on zoom
    // Use classList instead of inline styles to avoid interfering with Mapbox positioning
    nearbyDriverMarkersRef.current.forEach(marker => {
      if (marker) {
        try {
          const element = marker.getElement()
          if (element) {
            if (shouldShow) {
              element.classList.remove('hidden')
            } else {
              element.classList.add('hidden')
            }
          }
        } catch (error) {
          console.warn('Error updating nearby driver marker:', error)
        }
      }
    })
    
    // Update visibility of matched driver markers based on zoom
    // Use classList instead of inline styles to avoid interfering with Mapbox positioning
    driverMarkersRef.current.forEach(marker => {
      if (marker) {
        try {
          const element = marker.getElement()
          if (element) {
            if (shouldShow) {
              element.classList.remove('hidden')
            } else {
              element.classList.add('hidden')
            }
          }
        } catch (error) {
          console.warn('Error updating driver marker:', error)
        }
      }
    })
  }

  // Initialize map
  useEffect(() => {
    if (!accessToken) {
      console.error('Mapbox access token is missing')
      return
    }

    mapboxgl.accessToken = accessToken

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: center,
      zoom: 13,
      style: 'mapbox://styles/mapbox/streets-v12',
    })

    // Wait for map to load before allowing route calculations
    mapRef.current.on('load', () => {
      // Map is ready - now get user location
      getUserLocation()
      
      // Add zoom listeners - use both 'zoom' and 'zoomend' for consistency
      mapRef.current.on('zoom', handleZoomChange)
      mapRef.current.on('zoomend', handleZoomChange)
      
      // Initial check
      handleZoomChange()
    })
    
    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.off('zoom', handleZoomChange)
        mapRef.current.off('zoomend', handleZoomChange)
        mapRef.current.remove()
      }
    }
  }, [])

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.longitude, position.coords.latitude]
          setUserLocation({
            coordinates: coords,
            name: 'Your location',
          })

          // Center map on user's location
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: coords,
              zoom: 15,
            })

            // Add user location marker
            if (userLocationMarkerRef.current) {
              userLocationMarkerRef.current.remove()
            }
            const el = document.createElement('div')
            el.className = 'marker marker-user'
            userLocationMarkerRef.current = new mapboxgl.Marker(el)
              .setLngLat(coords)
              .addTo(mapRef.current)
          }
        },
        (error) => {
          console.error('Error getting user location:', error)
          // Fallback to default center if geolocation fails
          setUserLocation({
            coordinates: center,
            name: 'Default location',
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      )
    } else {
      console.error('Geolocation is not supported by this browser')
      setUserLocation({
        coordinates: center,
        name: 'Default location',
      })
    }
  }

  // Handle start location selection
  const handleStartSelect = (result) => {
    if (result && result.features && result.features.length > 0) {
      const feature = result.features[0]
      const coordinates = feature.geometry.coordinates
      const location = {
        coordinates: coordinates,
        name: feature.properties.name || feature.place_name || 'Start location',
      }
      
      console.log('📍 Start Location Selected:', {
        name: location.name,
        coordinates: coordinates,
        feature: feature
      })
      
      setStartLocation(location)
      setStartInput(location.name)

      // Remove existing start marker
      if (startMarkerRef.current) {
        startMarkerRef.current.remove()
      }

      // Add new start marker
      const el = document.createElement('div')
      el.className = 'marker marker-start'
      startMarkerRef.current = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .addTo(mapRef.current)

      // Update map view
      if (!endLocation) {
        mapRef.current.flyTo({
          center: coordinates,
          zoom: 14,
        })
      }

      // Recalculate route if end location exists
      // Pass location directly to avoid state timing issues
      if (endLocation) {
        console.log('🔄 Recalculating route - Start location changed')
        calculateRoute(coordinates, endLocation.coordinates)
        // Clear matched drivers when route changes
        setMatchedDrivers([])
        setSelectedDriver(null)
        setCombinedRoute(null)
      }
    } else {
      console.warn('⚠️ Start location selection failed - no features in result:', result)
    }
  }

  // Handle end location selection
  const handleEndSelect = (result) => {
    if (result && result.features && result.features.length > 0) {
      const feature = result.features[0]
      const coordinates = feature.geometry.coordinates
      const location = {
        coordinates: coordinates,
        name: feature.properties.name || feature.place_name || 'End location',
      }
      
      console.log('📍 End Location Selected:', {
        name: location.name,
        coordinates: coordinates,
        feature: feature
      })
      
      setEndLocation(location)
      setEndInput(location.name)

      // Remove existing end marker
      if (endMarkerRef.current) {
        endMarkerRef.current.remove()
      }

      // Add new end marker
      const el = document.createElement('div')
      el.className = 'marker marker-end'
      endMarkerRef.current = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .addTo(mapRef.current)

      // Recalculate route if start location exists
      // Pass locations directly to avoid state timing issues
      if (startLocation) {
        console.log('🔄 Recalculating route - End location changed')
        calculateRoute(startLocation.coordinates, location.coordinates)
        // Clear matched drivers when route changes
        setMatchedDrivers([])
        setSelectedDriver(null)
        setCombinedRoute(null)
      } else {
        console.log('⏳ Waiting for start location to calculate route')
      }
    } else {
      console.warn('⚠️ End location selection failed - no features in result:', result)
    }
  }

  // Recalculate route
  const recalculateRoute = () => {
    console.log('🔄 Recalculate Route Called:', {
      startLocation: startLocation ? {
        name: startLocation.name,
        coordinates: startLocation.coordinates
      } : null,
      endLocation: endLocation ? {
        name: endLocation.name,
        coordinates: endLocation.coordinates
      } : null
    })
    
    // Use a small delay to ensure state is updated
    setTimeout(() => {
      if (startLocation && endLocation) {
        console.log('✅ Both locations set, calculating route...')
        calculateRoute(startLocation.coordinates, endLocation.coordinates)
        // Clear matched drivers when route changes
        setMatchedDrivers([])
        setSelectedDriver(null)
        setCombinedRoute(null)
      } else {
        console.warn('⚠️ Cannot calculate route - missing locations:', {
          hasStart: !!startLocation,
          hasEnd: !!endLocation
        })
      }
    }, 10)
  }

  // Calculate distance between two coordinates (Haversine formula)
  // Returns distance in meters
  const calculateDistance = (coord1, coord2) => {
    const R = 6371000 // Earth's radius in meters
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Calculate distance in kilometers (for route matching)
  const calculateDistanceKm = (coord1, coord2) => {
    return calculateDistance(coord1, coord2) / 1000
  }

  // Check if routes are similar (within threshold distance in km)
  const routesAreSimilar = (userStart, userEnd, driverStart, driverEnd, threshold = 2) => {
    const distanceToDriverStart = calculateDistanceKm(userStart, driverStart)
    const distanceToDriverEnd = calculateDistanceKm(userEnd, driverEnd)
    
    // Routes are similar if start and end are within threshold km
    return distanceToDriverStart <= threshold && distanceToDriverEnd <= threshold
  }

  // Find and display nearby drivers (within 100 meters) based on start location
  useEffect(() => {
    if (!startLocation || !mapRef.current) {
      // Clear nearby drivers if no start location
      setNearbyDrivers([])
      nearbyDriverMarkersRef.current.forEach(marker => {
        if (marker) marker.remove()
      })
      nearbyDriverMarkersRef.current = []
      return
    }

    console.log('🔍 Finding nearby drivers for start location:', {
      name: startLocation.name,
      coordinates: startLocation.coordinates
    })

    const nearby = drivers
      .filter(driver => driver.available)
      .filter(driver => {
        const distance = calculateDistance(
          startLocation.coordinates,
          driver.currentLocation.coordinates
        )
        return distance <= 100 // 100 meters
      })

    console.log(`📍 Found ${nearby.length} nearby drivers within 100m of start location`)
    setNearbyDrivers(nearby)

    // Remove existing nearby driver markers
    nearbyDriverMarkersRef.current.forEach(marker => {
      if (marker) marker.remove()
    })
    nearbyDriverMarkersRef.current = []

    // Add markers for nearby drivers (wait for map to be loaded)
    const addNearbyMarkers = () => {
      if (mapRef.current && mapRef.current.loaded()) {
        const currentZoom = mapRef.current.getZoom()
        const MAX_ZOOM_FOR_MARKERS = 17
        
        nearby.forEach((driver) => {
          const el = document.createElement('div')
          el.className = 'marker marker-driver-nearby'
          // Set initial visibility based on zoom using class instead of inline styles
          const shouldShow = currentZoom <= MAX_ZOOM_FOR_MARKERS
          if (!shouldShow) {
            el.classList.add('hidden')
          }
          
          const marker = new mapboxgl.Marker(el)
            .setLngLat(driver.currentLocation.coordinates)
            .addTo(mapRef.current)
          nearbyDriverMarkersRef.current.push(marker)
        })
        console.log(`✅ Added ${nearby.length} nearby driver markers to map`)
      } else {
        // Wait for map to load
        mapRef.current.once('load', addNearbyMarkers)
      }
    }

    addNearbyMarkers()
  }, [startLocation])

  // Calculate optimal combined route with 3 checkpoints: driver -> user pickup -> destination
  const calculateCombinedRoute = async (driverStart, userStart, endLocation) => {
    console.log('🚗 Calculate Combined Route Called:', {
      driverStart: driverStart,
      userStart: userStart,
      endLocation: endLocation
    })
    
    // Build the combined route: driverStart -> userStart -> endLocation
    const waypointString = `${driverStart[0]},${driverStart[1]};${userStart[0]},${userStart[1]};${endLocation[0]},${endLocation[1]}`
    console.log('🌐 Combined route waypoints:', waypointString)

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointString}?geometries=geojson&access_token=${accessToken}`
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('📡 Combined Route API Response:', {
        code: data.code,
        hasRoutes: !!(data.routes && data.routes.length > 0),
        error: data.error || null
      })

      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const result = {
          geometry: data.routes[0].geometry,
          distance: data.routes[0].distance / 1000, // Convert to km
          duration: data.routes[0].duration / 60, // Convert to minutes
        }
        console.log('✅ Combined route calculated:', {
          distance: result.distance,
          duration: result.duration
        })
        return result
      } else {
        console.error('❌ Combined route calculation failed:', {
          code: data.code,
          message: data.message || 'Unknown error'
        })
      }
    } catch (error) {
      console.error('❌ Error calculating combined route:', error)
    }
    return null
  }

  // Find matching drivers
  const findMatchingDrivers = async () => {
    console.log('🔍 Find Matching Drivers Called:', {
      startLocation: startLocation ? {
        name: startLocation.name,
        coordinates: startLocation.coordinates
      } : null,
      endLocation: endLocation ? {
        name: endLocation.name,
        coordinates: endLocation.coordinates
      } : null
    })
    
    if (!startLocation || !endLocation) {
      console.warn('⚠️ Cannot find drivers - missing locations')
      return
    }

    setIsSearching(true)
    
    // Filter available drivers with similar routes
    const availableDrivers = drivers.filter(driver => driver.available)
    console.log(`📊 Total available drivers: ${availableDrivers.length}`)
    
    const potentialMatches = availableDrivers.filter(driver => {
      const isSimilar = routesAreSimilar(
        startLocation.coordinates,
        endLocation.coordinates,
        driver.currentLocation.coordinates,
        driver.destination.coordinates,
        3 // 3km threshold
      )
      return isSimilar
    })
    
    console.log(`📊 Potential matches found: ${potentialMatches.length}`)

    // Calculate combined routes for each potential match
    // Route: driver location -> user pickup -> destination
    const matchesWithRoutes = await Promise.all(
      potentialMatches.map(async (driver) => {
        console.log(`🚗 Calculating route for driver ${driver.id} (${driver.name}):`, {
          driverLocation: driver.currentLocation.coordinates,
          userStart: startLocation.coordinates,
          endLocation: endLocation.coordinates
        })
        
        const combinedRouteData = await calculateCombinedRoute(
          driver.currentLocation.coordinates,
          startLocation.coordinates,
          endLocation.coordinates
        )

        if (combinedRouteData) {
          console.log(`✅ Driver ${driver.id} route calculated:`, {
            distance: combinedRouteData.distance,
            duration: combinedRouteData.duration
          })
          return {
            driver,
            combinedRoute: combinedRouteData,
            totalDistance: combinedRouteData.distance,
            totalDuration: combinedRouteData.duration,
          }
        } else {
          console.warn(`⚠️ Driver ${driver.id} route calculation failed`)
        }
        return null
      })
    )

    // Filter out null results and sort by shortest total distance
    const validMatches = matchesWithRoutes
      .filter(match => match !== null)
      .sort((a, b) => a.totalDistance - b.totalDistance)
      .slice(0, 5) // Top 5 matches

    console.log(`✅ Found ${validMatches.length} valid driver matches:`, 
      validMatches.map(m => ({
        driverId: m.driver.id,
        driverName: m.driver.name,
        distance: m.totalDistance,
        duration: m.totalDuration
      }))
    )

    setMatchedDrivers(validMatches)
    setIsSearching(false)

    // Add driver markers to map
    addDriverMarkers(validMatches)
  }

  // Add driver markers to map
  const addDriverMarkers = (matches) => {
    // Remove existing driver markers
    driverMarkersRef.current.forEach(marker => {
      if (marker) marker.remove()
    })
    driverMarkersRef.current = []

    // Add markers for matched drivers
    const currentZoom = mapRef.current ? mapRef.current.getZoom() : 13
    const MAX_ZOOM_FOR_MARKERS = 17
    
    matches.forEach((match, index) => {
      const el = document.createElement('div')
      el.className = 'marker marker-driver'
      
      // Create the number element properly
      const numberEl = document.createElement('div')
      numberEl.className = 'driver-marker-number'
      numberEl.textContent = index + 1
      el.appendChild(numberEl)
      
      // Set initial visibility based on zoom using class instead of inline styles
      const shouldShow = currentZoom <= MAX_ZOOM_FOR_MARKERS
      if (!shouldShow) {
        el.classList.add('hidden')
      }
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(match.driver.currentLocation.coordinates)
        .addTo(mapRef.current)
      driverMarkersRef.current.push(marker)
    })
  }

  // Select a driver and show combined route (for viewing on map)
  const selectDriver = async (match) => {
    setSelectedDriver(match)
    
    console.log('🚗 Driver selected:', {
      driverId: match.driver.id,
      driverName: match.driver.name,
      driverLocation: match.driver.currentLocation.coordinates
    })
    
    // Zoom to driver's location first
    mapRef.current.flyTo({
      center: match.driver.currentLocation.coordinates,
      zoom: 15,
      duration: 1000,
    })
    
    // Remove existing combined route layer
    if (mapRef.current.getLayer('combined-route')) {
      mapRef.current.removeLayer('combined-route')
    }
    if (mapRef.current.getSource('combined-route')) {
      mapRef.current.removeSource('combined-route')
    }

    // Add combined route to map
    mapRef.current.addLayer({
      id: 'combined-route',
      type: 'line',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: match.combinedRoute.geometry,
        },
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#4A90E2',
        'line-width': 5,
        'line-opacity': 0.8,
        'line-dasharray': [2, 2],
      },
    })

    setCombinedRoute(match.combinedRoute)
  }

  // Book a driver - show booking screen with price and payment
  const bookDriver = (match) => {
    setSelectedDriver(match)
    setShowBookingScreen(true)
    
    // Also show the route on map
    selectDriver(match)
  }

  // Calculate price based on distance
  const calculatePrice = (distance) => {
    // Base fare: 10,000 VND
    // Per km: 15,000 VND
    const baseFare = 10000
    const perKm = 15000
    const total = baseFare + (distance * perKm)
    return Math.round(total)
  }

  // Convert VND to BKCredit (10 VND = 1 BKCredit)
  const convertToBKCredit = (vndAmount) => {
    return Math.round(vndAmount / 10)
  }

  // Calculate route from start to end
  const calculateRoute = async (start, end) => {
    console.log('🗺️ Calculate Route Called:', {
      start: start,
      end: end,
      mapLoaded: mapRef.current?.loaded(),
      mapExists: !!mapRef.current
    })
    
    if (!start || !end || !mapRef.current) {
      console.error('❌ Cannot calculate route - missing parameters:', {
        hasStart: !!start,
        hasEnd: !!end,
        hasMap: !!mapRef.current
      })
      return
    }

    // Wait for map to be loaded
    if (!mapRef.current.loaded()) {
      console.log('⏳ Map not loaded yet, waiting...')
      mapRef.current.once('load', () => calculateRoute(start, end))
      return
    }

    try {
      // Build route string: start;end
      const waypointString = `${start[0]},${start[1]};${end[0]},${end[1]}`
      console.log('🌐 Requesting route from Mapbox:', waypointString)

      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointString}?geometries=geojson&access_token=${accessToken}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('📡 Mapbox API Response:', {
        code: data.code,
        hasRoutes: !!(data.routes && data.routes.length > 0),
        routesCount: data.routes?.length || 0,
        error: data.error || null
      })

      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const route = data.routes[0].geometry
        console.log('✅ Route calculated successfully:', {
          coordinatesCount: route.coordinates?.length || 0,
          distance: data.routes[0].distance,
          duration: data.routes[0].duration
        })
        setRouteData(route)

        // Remove existing route layer and source if any
        if (mapRef.current.getLayer('route')) {
          mapRef.current.removeLayer('route')
        }
        if (mapRef.current.getSource('route')) {
          mapRef.current.removeSource('route')
        }

        // Add route source first, then layer
        try {
          mapRef.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: route,
            },
          })

          // Add route layer to map
          mapRef.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#D64545',
              'line-width': 4,
              'line-opacity': 0.75,
            },
          })
          
          console.log('✅ Route source and layer added successfully')
        } catch (error) {
          console.error('❌ Error adding route to map:', error)
          // Try updating the source if it already exists
          if (mapRef.current.getSource('route')) {
            mapRef.current.getSource('route').setData({
              type: 'Feature',
              geometry: route,
            })
            console.log('✅ Route source updated')
          }
        }

        // Fit map to route bounds
        try {
          const coordinates = route.coordinates || []
          if (coordinates.length > 0) {
            const bounds = coordinates.reduce((bounds, coord) => {
              return bounds.extend(coord)
            }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

            mapRef.current.fitBounds(bounds, {
              padding: { top: 200, bottom: 200, left: 50, right: 50 },
            })
            console.log('✅ Route rendered on map and bounds fitted')
          } else {
            console.warn('⚠️ Route has no coordinates')
          }
        } catch (error) {
          console.error('❌ Error fitting bounds:', error)
        }
      } else {
        console.error('❌ Route calculation failed:', {
          code: data.code,
          message: data.message || 'Unknown error',
          data: data
        })
      }
    } catch (error) {
      console.error('❌ Error calculating route:', error)
    }
  }

  // Clear route and locations
  const clearRoute = () => {
    setStartLocation(null)
    setEndLocation(null)
    setStartInput('')
    setEndInput('')
    setRouteData(null)

    if (startMarkerRef.current) {
      startMarkerRef.current.remove()
      startMarkerRef.current = null
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.remove()
      endMarkerRef.current = null
    }

    // Remove matched driver markers (but keep nearby drivers)
    driverMarkersRef.current.forEach(marker => {
      if (marker) marker.remove()
    })
    driverMarkersRef.current = []

    // Note: We keep nearby driver markers visible
    // They are only removed when user location changes

    if (mapRef.current.getLayer('route')) {
      mapRef.current.removeLayer('route')
    }
    if (mapRef.current.getSource('route')) {
      mapRef.current.removeSource('route')
    }
    if (mapRef.current.getLayer('combined-route')) {
      mapRef.current.removeLayer('combined-route')
    }
    if (mapRef.current.getSource('combined-route')) {
      mapRef.current.removeSource('combined-route')
    }

    setMatchedDrivers([])
    setSelectedDriver(null)
    setCombinedRoute(null)
    setIsSearching(false)
    setShowBookingScreen(false)
    setSelectedPaymentMethod(null)

    // Reset map view
    mapRef.current.flyTo({
      center: center,
      zoom: 13,
    })
  }

  return (
    <div className="home-screen">
      <div className="search-container">
        <div className="location-inputs">
          <div className="location-input-wrapper">
            <div className="location-dot start-dot"></div>
            <div className="search-box-wrapper">
              <SearchBox
                ref={startSearchRef}
                accessToken={accessToken}
                map={mapRef.current}
                mapboxgl={mapboxgl}
                value={startInput}
                proximity={userLocation?.coordinates || center}
                onChange={(d) => setStartInput(d)}
                onRetrieve={handleStartSelect}
                placeholder="Your pickup location"
                marker={false}
              />
            </div>
          </div>
          <div className="location-input-wrapper">
            <div className="location-dot end-dot"></div>
            <div className="search-box-wrapper">
              <SearchBox
                ref={endSearchRef}
                accessToken={accessToken}
                map={mapRef.current}
                mapboxgl={mapboxgl}
                value={endInput}
                proximity={userLocation?.coordinates || center}
                onChange={(d) => setEndInput(d)}
                onRetrieve={handleEndSelect}
                placeholder="Destination"
                marker={false}
              />
            </div>
          </div>
        </div>
      </div>
      {routeData && !matchedDrivers.length && (
        <div className="route-info">
          <div className="route-info-content">
            <span>Route calculated</span>
            <button className="confirm-route-btn" onClick={findMatchingDrivers} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Find Drivers'}
            </button>
          </div>
        </div>
      )}
      {isSearching && (
        <div className="route-info">
          <div className="route-info-content">
            <span>Searching for drivers...</span>
          </div>
        </div>
      )}
      {matchedDrivers.length > 0 && !showBookingScreen && (
        <div className={`drivers-list ${isDriversListExpanded ? 'expanded' : 'collapsed'}`}>
          <div className="drivers-list-header" onClick={() => setIsDriversListExpanded(!isDriversListExpanded)}>
            <h3>Matched Drivers ({matchedDrivers.length})</h3>
            <button className="drivers-list-toggle" aria-label={isDriversListExpanded ? 'Collapse' : 'Expand'}>
              {isDriversListExpanded ? '▼' : '▲'}
            </button>
          </div>
          {isDriversListExpanded && (
            <div className="drivers-list-content">
              {matchedDrivers.map((match, index) => (
                <div
                  key={match.driver.id}
                  className={`driver-card ${selectedDriver?.driver.id === match.driver.id ? 'selected' : ''}`}
                >
                  <div className="driver-card-main" onClick={() => selectDriver(match)}>
                    <div className="driver-card-header">
                      <div className="driver-info">
                        <div className="driver-name">{match.driver.name}</div>
                        <div className="driver-details">
                          <span className="driver-rating">⭐ {match.driver.rating}</span>
                          <span className="driver-vehicle">{match.driver.vehicleType}</span>
                        </div>
                      </div>
                      <div className="driver-number">{index + 1}</div>
                    </div>
                    <div className="driver-route-info">
                      <div className="route-stat">
                        <span className="stat-label">Total Distance:</span>
                        <span className="stat-value">{match.totalDistance.toFixed(1)} km</span>
                      </div>
                      <div className="route-stat">
                        <span className="stat-label">Duration:</span>
                        <span className="stat-value">{Math.round(match.totalDuration)} min</span>
                      </div>
                      {selectedDriver?.driver.id === match.driver.id && (
                        <button 
                          className="select-driver-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            bookDriver(match)
                          }}
                          aria-label="Select driver"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {showBookingScreen && selectedDriver && (
        <div className="booking-screen">
          <div className="booking-header">
            <button className="back-btn" onClick={() => setShowBookingScreen(false)}>
              ← Back
            </button>
            <h3>Confirm Booking</h3>
          </div>
          <div className="booking-content">
            <div className="driver-summary">
              <div className="driver-summary-info">
                <div className="driver-name-large">{selectedDriver.driver.name}</div>
                <div className="driver-details-summary">
                  <span className="driver-rating">⭐ {selectedDriver.driver.rating}</span>
                  <span className="driver-vehicle">{selectedDriver.driver.vehicleType}</span>
                </div>
              </div>
            </div>
            
            <div className="trip-details">
              <div className="trip-detail-item">
                <span className="trip-label">Distance</span>
                <span className="trip-value">{selectedDriver.totalDistance.toFixed(1)} km</span>
              </div>
              <div className="trip-detail-item">
                <span className="trip-label">Duration</span>
                <span className="trip-value">{Math.round(selectedDriver.totalDuration)} min</span>
              </div>
            </div>

            <div className="price-section">
              <div className="price-breakdown">
                <div className="price-item">
                  <span>Base fare</span>
                  <span>10,000 ₫</span>
                </div>
                <div className="price-item">
                  <span>Distance ({selectedDriver.totalDistance.toFixed(1)} km)</span>
                  <span>{Math.round(selectedDriver.totalDistance * 15000).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="price-total">
                  <span>Total</span>
                  <span>{calculatePrice(selectedDriver.totalDistance).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="price-equivalent">
                  <span>Equivalent</span>
                  <span>{convertToBKCredit(calculatePrice(selectedDriver.totalDistance)).toLocaleString('vi-VN')} BKCredit</span>
                </div>
              </div>
            </div>

            <div className="payment-section">
              <h4>Payment Method</h4>
              <div className="payment-methods">
                <div 
                  className={`payment-method ${selectedPaymentMethod === 'bkcredit' ? 'selected' : ''} ${convertToBKCredit(calculatePrice(selectedDriver.totalDistance)) > user.bkCredit.balance ? 'insufficient' : ''}`}
                  onClick={() => setSelectedPaymentMethod('bkcredit')}
                >
                  <div className="payment-method-main">
                    <span className="payment-icon">💳</span>
                    <div className="payment-info">
                      <span className="payment-name">BKCredit</span>
                      <span className="payment-balance">Available: {user.bkCredit.balance.toLocaleString('vi-VN')} credit</span>
                    </div>
                    {selectedPaymentMethod === 'bkcredit' && <span className="payment-check">✓</span>}
                  </div>
                  {convertToBKCredit(calculatePrice(selectedDriver.totalDistance)) > user.bkCredit.balance && (
                    <span className="payment-warning">Insufficient balance</span>
                  )}
                </div>
                <div 
                  className={`payment-method ${selectedPaymentMethod === 'bkcreditplus' ? 'selected' : ''} ${convertToBKCredit(calculatePrice(selectedDriver.totalDistance)) > user.bkCreditPlus.balance ? 'insufficient' : ''}`}
                  onClick={() => setSelectedPaymentMethod('bkcreditplus')}
                >
                  <div className="payment-method-main">
                    <span className="payment-icon">💎</span>
                    <div className="payment-info">
                      <span className="payment-name">BKCreditPlus</span>
                      <span className="payment-balance">Available: {user.bkCreditPlus.balance.toLocaleString('vi-VN')} credit</span>
                    </div>
                    {selectedPaymentMethod === 'bkcreditplus' && <span className="payment-check">✓</span>}
                  </div>
                  {convertToBKCredit(calculatePrice(selectedDriver.totalDistance)) > user.bkCreditPlus.balance && (
                    <span className="payment-warning">Insufficient balance</span>
                  )}
                </div>
                <div 
                  className={`payment-method ${selectedPaymentMethod === 'cash' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('cash')}
                >
                  <div className="payment-method-main">
                    <span className="payment-icon">💵</span>
                    <div className="payment-info">
                      <span className="payment-name">Cash</span>
                    </div>
                    {selectedPaymentMethod === 'cash' && <span className="payment-check">✓</span>}
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="confirm-booking-btn"
              disabled={
                !selectedPaymentMethod || 
                (selectedPaymentMethod === 'bkcredit' && convertToBKCredit(calculatePrice(selectedDriver.totalDistance)) > user.bkCredit.balance) ||
                (selectedPaymentMethod === 'bkcreditplus' && convertToBKCredit(calculatePrice(selectedDriver.totalDistance)) > user.bkCreditPlus.balance)
              }
              onClick={() => {
                const bookingDetails = {
                  driver: selectedDriver.driver,
                  price: calculatePrice(selectedDriver.totalDistance),
                  paymentMethod: selectedPaymentMethod,
                  route: {
                    distance: selectedDriver.totalDistance * 1000, // convert km to meters
                    duration: selectedDriver.totalDuration * 60, // convert minutes to seconds
                    start: startLocation,
                    end: endLocation,
                  },
                }
                console.log('Booking confirmed:', bookingDetails)

                if (onBookingConfirmed) {
                  onBookingConfirmed(bookingDetails)
                }
                setShowConfirmationDialog(true)
              }}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="map-container" />
      {showConfirmationDialog && (
        <BookingConfirmationDialog
          booking={{
            driver: selectedDriver.driver,
            start: startLocation,
            end: endLocation,
          }}
          onClose={() => {
            setShowConfirmationDialog(false)
            // The onBack prop will navigate back to the home screen
            if (onBack) onBack()
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        onOpenRouteSeeker={onOpenRouteSeeker}
        showRouteSeeker={showRouteSeeker}
      />
    </div>
  )
}

export default RouteSeeker

