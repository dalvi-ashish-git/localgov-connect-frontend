import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useOutletContext } from 'react-router-dom';

const HomePage = () => {
  const { darkMode } = useOutletContext(); // useOutletContext from MainLayout
  const [issues, setIssues] = useState([]);
  const [trendingIssues, setTrendingIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Symbols (smaller and subtle)
  const symbols = ["🛣️","💧","⚡","🚦","🔥","🗑️","💡","🚰","🚍","🌫️"];
  const backgroundSymbols = Array.from({ length: 50 }).map(() => {
    const symbol = symbols[Math.floor(Math.random()*symbols.length)];
    return {
      symbol,
      top: Math.random()*100,
      left: Math.random()*100,
      size: Math.random()*1.2+0.8,
      rotate: Math.random()*360,
      delay: Math.random()*5
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      fetchIssues(user);
      fetchTrendingIssues();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('public-feed-final')
      .on('postgres_changes',{ event:'*', schema:'public', table:'issue_likes'},()=>{fetchIssues(user); fetchTrendingIssues();})
      .on('postgres_changes',{ event:'*', schema:'public', table:'comments'},()=>fetchIssues(user))
      .subscribe();
    return ()=> supabase.removeChannel(channel);
  }, [user]);

  const fetchIssues = async (currentUser) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`id, title, description, status, image_url, user_full_name, user_avatar_url, issue_likes(user_id), comments(count)`)
        .order('created_at',{ ascending:false });
      if(error) throw error;
      const processed = data.map(issue => ({
        ...issue,
        like_count: issue.issue_likes.length,
        comment_count: issue.comments[0]?.count || 0,
        is_liked_by_user: currentUser ? issue.issue_likes.some(l=>l.user_id===currentUser.id) : false
      }));
      setIssues(processed);
    } catch(err){ console.error(err.message); } 
    finally { setLoading(false); }
  };

  const fetchTrendingIssues = async () => {
    try {
      const sevenDaysAgo = new Date(Date.now()-7*24*60*60*1000).toISOString();
      const { data, error } = await supabase
        .from('issues')
        .select('id,title,issue_likes(count)')
        .gt('created_at', sevenDaysAgo)
        .order('created_at',{ascending:false});
      if(error) throw error;
      const sorted = data.sort((a,b)=>(b.issue_likes[0]?.count||0)-(a.issue_likes[0]?.count||0));
      setTrendingIssues(sorted.slice(0,3));
    } catch(err){ console.error(err.message); }
  };

  const handleLikeToggle = async (issueId, isLiked) => {
    if(!user){ alert("You must be logged in to like a post."); return; }
    setIssues(cur => cur.map(issue => issue.id===issueId? {...issue,is_liked_by_user:!isLiked,like_count:isLiked? issue.like_count-1: issue.like_count+1}:issue));
    if(isLiked){
      await supabase.from('issue_likes').delete().match({ issue_id: issueId, user_id: user.id });
    } else {
      await supabase.from('issue_likes').insert({ issue_id: issueId, user_id: user.id });
    }
  };

  if(loading) return <p className="text-center text-gray-700 mt-10">Loading...</p>;

  return (
    <div className={`relative min-h-screen overflow-hidden p-4 font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-white'}`}>

      {/* Floating Symbols */}
      {backgroundSymbols.map((item,idx)=>(
        <span key={idx} className="absolute text-gray-300 opacity-25 animate-float"
          style={{
            top:`${item.top}%`,
            left:`${item.left}%`,
            fontSize:`${item.size}rem`,
            transform:`rotate(${item.rotate}deg)`,
            animationDelay:`${item.delay}s`
          }}
        >{item.symbol}</span>
      ))}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Issues */}
        <div className="lg:col-span-2 space-y-6">
          {issues.map(issue=>(
            <div key={issue.id} className={`rounded-2xl p-6 shadow-md transition-all duration-300 border ${darkMode ? 'bg-gray-800 text-white border-gray-700 hover:shadow-xl' : 'bg-white/40 text-gray-900 border-white/20 backdrop-blur-md hover:shadow-xl'}`}>
              <div className="flex items-center mb-4">
                <img src={issue.user_avatar_url||'https://placehold.co/40x40/EFEFEF/333333?text=U'} alt="avatar" className="w-12 h-12 rounded-full mr-4 object-cover"/>
                <div>
                  <p className="font-semibold">{issue.user_full_name||'Anonymous'}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${issue.status==='Pending'? (darkMode?'bg-yellow-500 text-gray-900':'bg-yellow-200 text-yellow-800') : (darkMode?'bg-green-600 text-gray-200':'bg-green-200 text-green-800')}`}>{issue.status}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{issue.title}</h3>
              <p className="mb-4 break-words">{issue.description}</p>
              {issue.image_url && <div className="mb-4 rounded-lg overflow-hidden"><img src={issue.image_url} alt={issue.title} className="w-full max-h-96 object-cover rounded-lg" /></div>}
              <div className="flex justify-between items-center text-sm border-t pt-3" style={{borderColor: darkMode?'#4B5563':'rgba(255,255,255,0.2)'}}>
                <div className="flex items-center gap-4">
                  <button onClick={()=>handleLikeToggle(issue.id,issue.is_liked_by_user)} className="flex items-center gap-1.5 transition-transform duration-200 hover:scale-110">
                    <span className={`text-2xl ${issue.is_liked_by_user?'text-red-500':'text-gray-400'}`}>❤️</span>
                    <span className="font-semibold">{issue.like_count}</span>
                  </button>
                  <Link to={`/dashboard/issue/${issue.id}`} className="flex items-center gap-1.5"><span>💬</span><span className="font-semibold">{issue.comment_count}</span></Link>
                </div>
                <Link to={`/dashboard/issue/${issue.id}`} className={`font-semibold hover:underline ${darkMode?'text-blue-400':'text-blue-600'}`}>View Details</Link>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Community Stats */}
          <div className={`rounded-2xl p-6 shadow-lg transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white/60 text-gray-900 backdrop-blur-md border border-gray-200'}`}>
            <h3 className="text-lg font-bold mb-4">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="font-semibold">Total Issues:</span><span>{issues.length}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-green-500">Resolved:</span><span>{issues.filter(i=>i.status==='Resolved').length}</span></div>
            </div>
          </div>

          {/* Trending Issues */}
          <div className={`rounded-2xl p-6 shadow-lg transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white/60 text-gray-900 backdrop-blur-md border border-gray-200'}`}>
            <h3 className="text-lg font-bold mb-4">🔥 Trending Issues</h3>
            <ul className="space-y-3">
              {trendingIssues.map(issue=>(
                <li key={issue.id} className="text-sm">
                  <Link to={`/dashboard/issue/${issue.id}`} className={`hover:underline ${darkMode?'hover:text-blue-300':'hover:text-blue-500'}`}>
                    <p className="font-semibold truncate">{issue.title}</p>
                    <p className="text-xs text-gray-400">{issue.issue_likes[0]?.count||0} Likes</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className={`rounded-2xl p-6 shadow-lg transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white/60 text-gray-900 backdrop-blur-md border border-gray-200'}`}>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard/report-issue" className={`hover:underline ${darkMode?'hover:text-blue-300':'hover:text-blue-500'}`}>➕ Report a New Issue</Link></li>
              <li><Link to="/dashboard/my-activity" className={`hover:underline ${darkMode?'hover:text-blue-300':'hover:text-blue-500'}`}>📊 View My Activity</Link></li>
            </ul>
          </div>
        </div>

      </div>

      <style>
        {`
          @keyframes float {
            0%,100%{transform:translateY(0px);}
            50%{transform:translateY(-6px);}
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
};

export default HomePage;
