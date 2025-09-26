import React, { useState, useEffect } from 'react';
import { supabase } from '/src/supabaseClient.js';
import { useNavigate, useOutletContext } from 'react-router-dom';

// Modal Component
const Modal = ({ children, onClose, darkMode }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-6 rounded-2xl shadow-xl w-full max-w-md`} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const ProfilePage = () => {
  const { darkMode = false } = useOutletContext() || {};
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [modalView, setModalView] = useState(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stats, setStats] = useState({ total: 0, resolved: 0, upvotes: 0 });
  const [achievements, setAchievements] = useState({ communityHero: false, topReporter: false });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setUser(user);
      setFullName(user.user_metadata?.full_name || '');
      const initialAvatar = user.user_metadata?.avatar_url;
      if (initialAvatar) setAvatarUrl(`${initialAvatar}?t=${new Date().getTime()}`);
      await fetchStatsAndAchievements(user.id);
      await fetchRecentActivity(user.id);
      calculateProfileCompletion(user);
      setLoading(false);
    };
    fetchAllData();
  }, [navigate]);

  const calculateProfileCompletion = (userData) => {
    let score = 0;
    if (userData.user_metadata?.full_name) score += 40;
    if (userData.user_metadata?.avatar_url) score += 30;
    score += 30; // base
    setProfileCompletion(score);
  };

  const fetchStatsAndAchievements = async (userId) => {
    const [
      { count: totalCount },
      { count: resolvedCount },
      { count: upvotesCount }
    ] = await Promise.all([
      supabase.from('issues').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('issues').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'Resolved'),
      supabase.from('issue_likes').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ]);
    setStats({ total: totalCount || 0, resolved: resolvedCount || 0, upvotes: upvotesCount || 0 });
    setAchievements({ communityHero: (resolvedCount || 0) >= 10, topReporter: (totalCount || 0) >= 5 });
  };

  const fetchRecentActivity = async (userId) => {
    const { data } = await supabase.from('issues').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5);
    setRecentActivity(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const uploadAvatar = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const { error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
    if (error) return alert('Avatar upload error: ' + error.message);
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    if (updateError) return alert('Update avatar URL error: ' + updateError.message);
    setAvatarUrl(`${publicUrl}?t=${new Date().getTime()}`);
  };

  const handleUpdateProfile = async () => {
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    if (error) return alert('Error: ' + error.message);
    alert('Profile updated!');
    setModalView(null);
    const { data: { user: updatedUser } } = await supabase.auth.getUser();
    setUser(updatedUser);
    calculateProfileCompletion(updatedUser);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) return alert('New password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return alert('Passwords do not match.');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return alert('Error: ' + error.message);
    alert('Password updated!');
    setModalView(null);
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  if (loading) return <div className={`text-center p-8 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Loading profile...</div>;

  return (
    <div className={`min-h-full p-4 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Profile Card */}
          <div>
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-2xl shadow-lg p-6 flex flex-col h-full transition hover:shadow-xl`}>
              <div className="relative w-24 h-24 mx-auto mb-4">
                <img src={avatarUrl || `https://placehold.co/150x150/EFEFEF/333333?text=${fullName?.[0] || 'U'}`} 
                  alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover hover:scale-105 transition-transform duration-200" />
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600">
                  ✏️<input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={uploadAvatar} />
                </label>
              </div>
              <h2 className="text-2xl font-bold text-center">{fullName || 'User'}</h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} text-center mb-4 break-words`}>{user?.email}</p>
              {/* Profile Completion */}
              <div className="mb-4">
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-1`}>Profile Completion: {profileCompletion}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <button onClick={() => setModalView('editProfile')} className="text-sm font-semibold text-blue-600 hover:underline w-full text-left pl-2">✏️ Edit Profile</button>
                <button onClick={() => setModalView('changePassword')} className="text-sm font-semibold text-blue-600 hover:underline w-full text-left pl-2">🔒 Change Password</button>
              </div>
              <div className="mt-auto pt-4">
                <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors">Logout</button>
              </div>
            </div>
          </div>

          {/* Right Side Cards */}
          <div className="md:col-span-2 space-y-6">
            {/* Statistics */}
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-6 rounded-2xl shadow-lg transition hover:shadow-xl`}>
              <h3 className="text-xl font-bold mb-4">Statistics</h3>
              <div className="flex justify-around text-center">
                <div><p className="text-2xl font-bold">{stats.total}</p><p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Total Reports</p></div>
                <div><p className="text-2xl font-bold text-green-500">{stats.resolved}</p><p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Resolved</p></div>
                <div><p className="text-2xl font-bold">{stats.upvotes}</p><p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Upvotes</p></div>
              </div>
            </div>
            {/* Achievements */}
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-6 rounded-2xl shadow-lg transition hover:shadow-xl`}>
              <h3 className="text-xl font-bold mb-4">Achievements</h3>
              <div className="flex justify-around text-center">
                <div className={!achievements.communityHero ? 'filter grayscale opacity-50' : ''} title="Resolve 10+ issues">
                  <p className="text-4xl animate-pulse">🏅</p>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} font-semibold`}>Community Hero</p>
                  <p className="text-xs text-gray-400">(10+ Resolved Issues)</p>
                </div>
                <div className={!achievements.topReporter ? 'filter grayscale opacity-50' : ''} title="Report 5+ issues">
                  <p className="text-4xl animate-pulse">🛡️</p>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} font-semibold`}>Top Reporter</p>
                  <p className="text-xs text-gray-400">(5+ Reports)</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-6 rounded-2xl shadow-lg transition hover:shadow-xl`}>
              <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
              {recentActivity.length === 0 ? <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>No recent activity</p> :
                <ul className="space-y-2">
                  {recentActivity.map(issue => (
                    <li key={issue.id} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer`}>
                      <p className="font-semibold">{issue.title}</p>
                      <p className="text-sm text-gray-400">{new Date(issue.created_at).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalView === 'editProfile' &&
        <Modal darkMode={darkMode} onClose={() => setModalView(null)}>
          <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
          <input type="text" className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} w-full p-2 rounded mb-4`} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" />
          <button onClick={handleUpdateProfile} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">Update</button>
        </Modal>
      }

      {modalView === 'changePassword' &&
        <Modal darkMode={darkMode} onClose={() => setModalView(null)}>
          <h3 className="text-xl font-bold mb-4">Change Password</h3>
          <input type="password" className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} w-full p-2 rounded mb-2`} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" />
          <input type="password" className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} w-full p-2 rounded mb-2`} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" />
          <input type="password" className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} w-full p-2 rounded mb-4`} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
          <button onClick={handleUpdatePassword} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">Update Password</button>
        </Modal>
      }
    </div>
  );
};

export default ProfilePage;
