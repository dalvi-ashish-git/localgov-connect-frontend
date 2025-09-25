import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Modal component jo popup dikhayega
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    
    // State to control which modal is open
    const [modalView, setModalView] = useState(null); // 'editProfile' or 'changePassword'

    // Profile details state
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);
    
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Statistics State
    const [stats, setStats] = useState({ total: 0, resolved: 0 });

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                setFullName(user.user_metadata?.full_name || '');
                setAvatarUrl(user.user_metadata?.avatar_url);
                fetchStats(user.id);
            } else {
                navigate('/login');
            }
            setLoading(false);
        };
        fetchAllData();
    }, [navigate]);

    const fetchStats = async (userId) => {
        const { count: totalCount } = await supabase.from('issues').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        const { count: resolvedCount } = await supabase.from('issues').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'Resolved');
        setStats({ total: totalCount || 0, resolved: resolvedCount || 0 });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const uploadAvatar = async (event) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const { error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
        if (error) { alert('Error uploading avatar: ' + error.message); return; }
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
        if (updateError) { alert('Error updating avatar URL: ' + updateError.message); } 
        else { setAvatarUrl(publicUrl); alert('Profile picture updated!'); }
    };

    const handleUpdateProfile = async () => {
        const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
        if (error) { alert('Error updating profile: ' + error.message); } 
        else {
            alert('Profile updated successfully!');
            setModalView(null); // Modal band karein
            const { data: { user: updatedUser } } = await supabase.auth.getUser();
            setUser(updatedUser);
        }
    };

    const handleUpdatePassword = async () => {
        // NOTE: Supabase client-side password update ke liye current password nahi maangta hai.
        // Yeh UI user ki tasalli ke liye hai.
        if (newPassword.length < 6) { alert("New password must be at least 6 characters long."); return; }
        if (newPassword !== confirmPassword) { alert("New passwords do not match."); return; }
        
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) { alert('Error updating password: ' + error.message); } 
        else {
            alert('Password updated successfully!');
            setModalView(null); // Modal band karein
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const handleForgotPassword = async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: window.location.origin });
        if (error) { alert("Error sending password reset email: " + error.message); } 
        else { alert("A password reset link has been sent to your email."); }
    };

    if (loading) return <div className="text-center p-8">Loading profile...</div>;

    return (
        <div className="min-h-full" style={{backgroundImage: `url('https://www.toptal.com/designers/subtlepatterns/uploads/double-bubble-outline.png')`}}>
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Profile Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-lg text-center flex flex-col h-full">
                            <div className="relative w-24 h-24 mx-auto mb-4">
                                <img src={avatarUrl || `https://placehold.co/150x150/EFEFEF/333333?text=${fullName?.[0] || 'U'}`} alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-gray-200 object-cover" />
                                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600">
                                    ✏️
                                    <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={uploadAvatar} />
                                </label>
                            </div>
                            
                            <h2 className="text-2xl font-bold">{fullName || 'User'}</h2>
                            <p className="text-gray-500 mb-4 break-words">{user?.email}</p>
                            <div className="space-y-2">
                                <button onClick={() => setModalView('editProfile')} className="text-sm font-semibold text-blue-600 hover:underline w-full text-left pl-2">✏️ Edit Profile</button>
                                <button onClick={() => setModalView('changePassword')} className="text-sm font-semibold text-blue-600 hover:underline w-full text-left pl-2">🔒 Change Password</button>
                            </div>
                            
                            <div className="mt-auto pt-4">
                                <button onClick={handleLogout} className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">Logout</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Cards */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h3 className="text-xl font-bold mb-4">Statistics</h3>
                            <div className="flex justify-around text-center">
                                <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-gray-500">Total Reports</p></div>
                                <div><p className="text-2xl font-bold text-green-500">{stats.resolved}</p><p className="text-gray-500">Resolved</p></div>
                                <div><p className="text-2xl font-bold">0</p><p className="text-gray-500">Upvotes</p></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h3 className="text-xl font-bold mb-4">Achievements</h3>
                            <div className="flex justify-around text-center">
                                <div><p className="text-4xl">🏅</p><p className="text-gray-500">Community Hero</p></div>
                                <div><p className="text-4xl">🛡️</p><p className="text-gray-500">Top Reporter</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {modalView === 'editProfile' && (
                <Modal onClose={() => setModalView(null)}>
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-center">Edit Profile</h3>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full p-2 border rounded-lg text-center"/>
                        <button onClick={handleUpdateProfile} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">Save Changes</button>
                        <button onClick={() => setModalView(null)} className="w-full text-sm text-gray-500 hover:underline">Cancel</button>
                    </div>
                </Modal>
            )}

            {/* Change Password Modal */}
            {modalView === 'changePassword' && (
                <Modal onClose={() => setModalView(null)}>
                    <div className="space-y-3 text-left">
                        <h3 className="font-bold text-lg text-center">Change Password</h3>
                        <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-2 border rounded-lg" />
                        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border rounded-lg" />
                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded-lg" />
                        <button onClick={handleUpdatePassword} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Save Changes</button>
                        <div className="text-center mt-2">
                            <button onClick={handleForgotPassword} className="text-sm text-blue-600 hover:underline">Forgot Password?</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ProfilePage;

