import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet'; // Leaflet library ko import karein custom icons ke liye

// --- Custom Map Icons ---
// Yeh function alag-alag rang ke map pin banayega
const createCustomIcon = (color) => {
    return new L.DivIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="w-8 h-8 drop-shadow-lg">
                   <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
               </svg>`,
        className: 'bg-transparent border-0',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const icons = {
    Resolved: createCustomIcon('#22c55e'),  // Green
    Pending: createCustomIcon('#f97316'),   // Orange
    Rejected: createCustomIcon('#ef4444'),  // Red
    'In Progress': createCustomIcon('#3b82f6'), // Blue
};

// --- Main Page Component ---
function MapPage() {
    const [allIssues, setAllIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All Issues');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIssues();
    }, []);

    // Jab filter badle, to issues ko update karein
    useEffect(() => {
        if (activeFilter === 'All Issues') {
            setFilteredIssues(allIssues);
        } else {
            const filtered = allIssues.filter(issue => issue.status === activeFilter);
            setFilteredIssues(filtered);
        }
    }, [activeFilter, allIssues]);

    async function fetchIssues() {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('issues').select('*');
            if (error) throw error;
            if (data) {
                const issuesWithLocation = data.filter(issue => issue.location);
                setAllIssues(issuesWithLocation);
                setFilteredIssues(issuesWithLocation);
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="text-center p-8">Loading map and issues...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg h-full flex flex-col p-4 gap-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
                {['All Issues', 'Resolved', 'Pending', 'Rejected', 'In Progress'].map(filter => (
                    <button 
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${activeFilter === filter ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Map Container */}
            <div className="flex-grow h-full w-full rounded-xl overflow-hidden border">
                <MapContainer center={[19.45, 72.8]} zoom={11} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/>
                    
                    {filteredIssues.map(issue => {
                        const position = issue.location.split(',').map(Number);
                        const icon = icons[issue.status] || createCustomIcon('gray');
                        return (
                            <Marker key={issue.id} position={position} icon={icon}>
                                <Popup>
                                    <div className="w-48">
                                        {issue.image_url && <img src={issue.image_url} alt={issue.title} className="w-full h-24 object-cover rounded-md mb-2"/>}
                                        <h3 className="font-bold text-md mb-1">{issue.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                                            issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                            issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                            'bg-red-100 text-red-800'
                                        }`}>{issue.status}</span>
                                        <Link to={`/dashboard/issue/${issue.id}`} className="block text-center mt-2 text-blue-600 font-semibold hover:underline text-sm">
                                            View Details
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}

export default MapPage;

