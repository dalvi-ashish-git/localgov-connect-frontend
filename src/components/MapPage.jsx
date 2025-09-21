import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function MapPage() {
  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  async function fetchIssues() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('issues')
        .select('*'); // Get all issues

      if (error) throw error;
      
      if (data) {
        // Filter out issues that don't have a location
        const issuesWithLocation = data.filter(issue => issue.location);
        setAllIssues(issuesWithLocation);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading map and issues...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      {/* Map Container taking full height of its parent */}
      <div className="flex-grow h-full w-full">
        <MapContainer center={[19.45, 72.8]} zoom={11} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Loop through all issues and create a marker for each */}
          {allIssues.map(issue => {
            const position = issue.location.split(',').map(Number); // Convert "lat, lng" string to [lat, lng] array
            return (
              <Marker key={issue.id} position={position}>
                <Popup>
                  <h3 className="font-bold">{issue.title}</h3>
                  <p>{issue.description}</p>
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