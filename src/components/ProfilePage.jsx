import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // User ke metadata se avatar URL nikalein
        setAvatarUrl(user.user_metadata.avatar_url);
      } else {
        navigate('/login');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      alert(error.message);
    }
  }

  async function uploadAvatar(event) {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // File ko 'avatars' bucket mein upload karein
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // User metadata mein naya avatar URL update karein
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) {
        throw updateError;
      }
      
      setAvatarUrl(publicUrl);
      alert('Profile picture updated!');

    } catch (error) {
      alert(error.message);
    }
  }
  
  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img 
                src={avatarUrl || `https://via.placeholder.com/150`}
                alt="User Avatar"
                className="w-24 h-24 rounded-full border-4 border-gray-200 object-cover"
              />
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600">
                ✏️
                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={uploadAvatar} />
              </label>
            </div>
            
            <h2 className="text-2xl font-bold">{user?.user_metadata?.full_name || 'User'}</h2>
            <p className="text-gray-500 mb-6">{user?.email}</p>

            <button onClick={handleLogout} className="w-full mt-6 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          {/* ... Statistics and Achievements cards ... */}
        </div>
        
      </div>
    </div>
  );
}

export default ProfilePage;