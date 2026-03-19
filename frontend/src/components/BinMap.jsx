import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
 
// Helper to programmatically change map center
function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

const BinMap = ({ bins, height = '450px' }) => {
    const { user } = useAuth();
    const [userPosition, setUserPosition] = useState(null);
    const [mapCenter, setMapCenter] = useState([28.6757, 77.5020]); // Default AKGEC
    const [routeCoords, setRouteCoords] = useState([]);

    useEffect(() => {
        // 1. Get current location from browser
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = [position.coords.latitude, position.coords.longitude];
                setUserPosition(pos);
                // Optionally center on user if no registration info is better
                // setMapCenter(pos);
            });
        }

        // 2. Fetch coordinates for user's registered city/place
        if (user && user.city) {
            const fetchCityCoords = async () => {
                try {
                    const query = `${user.place}, ${user.city}, ${user.state}, India`;
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
                    const data = await response.json();
                    
                    if (data && data.length > 0) {
                        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                    } else {
                        // Try fallback to just city
                        const cityResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(user.city + ', ' + user.state)}&limit=1`);
                        const cityData = await cityResponse.json();
                        if (cityData && cityData.length > 0) {
                            setMapCenter([parseFloat(cityData[0].lat), parseFloat(cityData[0].lon)]);
                        }
                    }
                } catch (err) {
                    console.error("Geocoding error:", err);
                }
            };
            fetchCityCoords();
        }
    }, [user]);

    const handleGetDirections = async (bin) => {
        if (!userPosition || !bin.location) return;

        const binPos = [bin.location.latitude, bin.location.longitude];
        
        // 1. Fetch route from OSRM
        try {
            const url = `https://router.project-osrm.org/route/v1/walking/${userPosition[1]},${userPosition[0]};${binPos[1]},${binPos[0]}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                const coords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                setRouteCoords(coords);
            }
        } catch (err) {
            console.error("Pathfinding error:", err);
            setRouteCoords([userPosition, binPos]);
        }

        // 2. Open Google Maps
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${userPosition[0]},${userPosition[1]}&destination=${binPos[0]},${binPos[1]}&travelmode=walking`, '_blank');
    };

    // Helper to create custom colored icons
    const createColoredIcon = (status) => {
        let color = '#10b981'; // Default green
        if (status === 'Full') color = '#ef4444';
        if (status === 'Filling') color = '#f59e0b';
        if (status === 'Maintenance') color = '#8b5cf6';

        const svgTemplate = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" stroke="white" stroke-width="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="3" fill="white"/>
      </svg>`;

        return L.divIcon({
            className: 'custom-div-icon',
            html: svgTemplate,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
    };

    return (
        <div className="glass" style={{ height: height, width: '100%', overflow: 'hidden', position: 'relative' }}>
            <MapContainer
                center={mapCenter}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

                />
                <RecenterMap center={mapCenter} />
                {bins.map((bin) => {
                    if (!bin.location || typeof bin.location.latitude !== 'number' || typeof bin.location.longitude !== 'number') {
                        console.warn(`Bin ${bin.hardwareId} has invalid or missing location:`, bin.location);
                        return null;
                    }
                    return (
                        <Marker
                            key={bin._id}
                            position={[bin.location.latitude, bin.location.longitude]}
                            icon={createColoredIcon(bin.status)}
                        >
                            <Popup className="glass-popup">
                                <div style={{ padding: '8px', minWidth: '150px' }}>
                                    <h4 style={{ margin: '0 0 4px 0', color: '#1e293b' }}>{bin.hardwareId}</h4>
                                <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '0.8rem' }}>{bin.address}</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Fill: {bin.fillLevel}%</span>
                                        <div style={{ flex: 1, height: '4px', background: '#e2e8f0', borderRadius: '2px', marginLeft: '8px' }}>
                                            <div style={{ width: `${bin.fillLevel}%`, height: '100%', background: bin.fillLevel > 80 ? '#ef4444' : '#10b981', borderRadius: '2px' }}></div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.75rem' }}>Battery: {bin.batteryLevel}%</span>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: bin.status === 'Full' ? '#ef4444' : '#10b981',
                                            color: 'white'
                                        }}>
                                            {bin.status}
                                        </span>
                                    </div>
                                    {bin.status === 'Full' && (
                                        <button 
                                            onClick={() => handleGetDirections(bin)}
                                            style={{
                                                marginTop: '8px',
                                                padding: '8px',
                                                background: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <Navigation size={14} /> Get Directions
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

                {userPosition && (
                    <CircleMarker 
                        center={userPosition} 
                        radius={8} 
                        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.6 }}
                    >
                        <Popup>Your current location</Popup>
                    </CircleMarker>
                )}

                {routeCoords.length > 0 && (
                    <Polyline 
                        positions={routeCoords} 
                        pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.7 }} 
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default BinMap;
