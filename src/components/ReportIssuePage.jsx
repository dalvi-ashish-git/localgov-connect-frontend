import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// --- Map Components (No Change) ---
const MapSearch = () => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({ provider, style: 'bar', showMarker: false });
    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);
  return null;
};

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });
  return position === null ? null : (
    <Marker 
      position={position}
      eventHandlers={{ dblclick: () => { setPosition(null); onLocationSelect(null); }}}
    ></Marker>
  );
}

// --- Main Page Component ---
function ReportIssuePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [predictedCategory, setPredictedCategory] = useState('');
  const [imageFile, setImageFile] = useState(null); // Naya state image ke liye
  const navigate = useNavigate();

  useEffect(() => {
    if (description.length > 10) getCategoryPrediction();
    else setPredictedCategory('');
  }, [description]);

  async function getCategoryPrediction() {
    // ... (This function has no changes)
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description })
      });
      const data = await response.json();
      setPredictedCategory(data.predicted_category);
    } catch (error) {
      console.error("Error fetching category:", error);
      setPredictedCategory('Error');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Please login...'); navigate('/login'); return; }
      if (!location) { alert('Please pin the location...'); return; }

      let imageUrl = null;
      // Agar user ne file select ki hai, toh use upload karo
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('issue-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Upload ki hui file ka public URL nikalo
        const { data } = supabase.storage.from('issue-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      // Database mein data insert karo
      const { error: insertError } = await supabase
        .from('issues')
        .insert({ 
          title, 
          description,
          location: location ? `${location.lat}, ${location.lng}` : null,
          category: predictedCategory,
          user_id: user.id,
          user_full_name: user.user_metadata.full_name,
          user_avatar_url: user.user_metadata.avatar_url,
          image_url: imageUrl // Naya image URL save karo
        });

      if (insertError) throw insertError;

      alert('Issue reported successfully!');
      navigate('/dashboard');

    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Report an Issue</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* ... Title, Description, Map ... */}
          <div>
            <label htmlFor="issue-title" className="block text-sm font-medium text-gray-700 mb-1">e.g. Large pothole on Main Street</label>
            <input type="text" id="issue-title" className="w-full px-4 py-2 border rounded-lg" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Describe the issue</label>
              <textarea id="description" rows="5" className="w-full px-4 py-2 border rounded-lg" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
            </div>
            <div className="h-64 rounded-lg overflow-hidden border">
              <MapContainer center={[19.45, 72.8]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapSearch />
                <LocationMarker onLocationSelect={setLocation} />
              </MapContainer>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Predicted Category</label>
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg min-h-[40px]">
              {predictedCategory || 'Type description to see category...'}
            </div>
          </div>

          {/* Photo Upload Input with onChange */}
          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">Add a Photo (Optional)</label>
            <input 
              type="file" 
              id="photo" 
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])} // File select hone par state update karo
            />
          </div>

          <div className="text-right">
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Submit Issue</button>
          </div>
        </form>
      </div>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Instructions</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Use the search bar on the map to find a location.</li>
            <li>Click on the map to pin the exact location.</li>
            <li>Double-click the pin to remove it.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ReportIssuePage;