import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// --- Map Fix Imports ---
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

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
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();
  
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [similarIssue, setSimilarIssue] = useState(null);

  // --- Map Fix Configuration ---
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconUrl: icon,
        iconRetinaUrl: iconRetina,
        shadowUrl: iconShadow,
    });
  }, []);

  useEffect(() => {
    if (description.length > 10) getCategoryPrediction();
    else setPredictedCategory('');
  }, [description]);

  const checkForSimilarIssues = async (latlng) => {
    if (!latlng) {
        setSimilarIssue(null);
        return;
    }
    setCheckingLocation(true);
    setSimilarIssue(null);
    try {
        const { data, error } = await supabase.rpc('find_nearby_issues', {
            lat_query: latlng.lat,
            lng_query: latlng.lng
        });

        if (error) throw error;
        
        if (data && data.length > 0) {
            setSimilarIssue(data[0]);
        }

    } catch (error) {
        console.error("Error checking for similar issues:", error.message);
    } finally {
        setCheckingLocation(false);
    }
  };

  async function getCategoryPrediction() {
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
      setPredictedCategory('Prediction API is offline.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Please login...'); navigate('/login'); return; }
      if (!location) { alert('Please pin the location on the map.'); return; }

      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('issue-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('issue-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('issues')
        .insert({ 
          title, 
          description,
          location: `${location.lat}, ${location.lng}`,
          category: predictedCategory,
          user_id: user.id,
          user_full_name: user.user_metadata.full_name,
          user_avatar_url: user.user_metadata.avatar_url,
          image_url: imageUrl
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
      {/* Left side: Form */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Report an Issue</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="issue-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input type="text" id="issue-title" placeholder="e.g. Large pothole on Main Street" className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Describe the issue</label>
              <textarea id="description" rows="5" className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
            </div>
            <div className="h-64 rounded-lg overflow-hidden border">
              <MapContainer center={[19.45, 72.8]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapSearch />
                <LocationMarker onLocationSelect={(latlng) => {
                    setLocation(latlng);
                    checkForSimilarIssues(latlng);
                }} />
              </MapContainer>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Predicted Category</label>
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg min-h-[40px] dark:bg-gray-700 dark:text-blue-300">
              {predictedCategory || 'Type description to see category...'}
            </div>
          </div>
          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add a Photo (Optional)</label>
            <input type="file" id="photo" className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}/>
          </div>
          <div className="text-right">
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Submit Issue</button>
          </div>
        </form>
      </div>
      
      {/* Right side: Insights and Existing Report (with dark mode text colors) */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Issue Insights</h3>
          <p className="text-gray-600 dark:text-gray-300">Based on your issue description, this will likely be handled by the <span className="font-semibold text-blue-600 dark:text-blue-400">{predictedCategory || 'relevant'} department</span>.</p>
          <p className="text-xs text-gray-400 mt-2">(This is an automated prediction)</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Existing Reports Check</h3>
          {checkingLocation ? (
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">Checking for similar issues at this location...</p>
          ) : similarIssue ? (
            <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded">
                <h4 className="font-bold text-red-700 dark:text-red-400">⚠️ A similar issue already exists!</h4>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">"{similarIssue.title}" was reported nearby.</p>
                <Link to={`/dashboard/issue/${similarIssue.id}`} className="text-sm text-blue-600 hover:underline mt-2 inline-block font-semibold dark:text-blue-400">
                    View Existing Report →
                </Link>
            </div>
          ) : (
             <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded">
                <h4 className="font-bold text-green-700 dark:text-green-300">✅ All Clear!</h4>
                <p className="text-sm text-green-600 dark:text-green-200 mt-1">No similar issues found at this location.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportIssuePage;