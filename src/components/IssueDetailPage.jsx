import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function IssueDetailPage() {
  const { id } = useParams(); // URL se issue ki ID nikalne ke liye
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssueAndComments();
  }, [id]);

  async function fetchIssueAndComments() {
    try {
      setLoading(true);
      // Issue ki details fetch karein
      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();
      if (issueError) throw issueError;
      setIssue(issueData);

      // Us issue ke saare comments fetch karein
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('issue_id', id)
        .order('created_at', { ascending: true });
      if (commentsError) throw commentsError;
      setComments(commentsData);

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to comment.");
      if (!newComment.trim()) return;

      const { data, error } = await supabase
        .from('comments')
        .insert({ content: newComment, issue_id: id, user_id: user.id })
        .select();

      if (error) throw error;

      setComments([...comments, data[0]]);
      setNewComment('');

    } catch (error) {
      alert(error.message);
    }
  }

  if (loading) return <p>Loading issue details...</p>;
  if (!issue) return <p>Issue not found.</p>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      {/* Issue Details */}
      <h1 className="text-3xl font-bold mb-2">{issue.title}</h1>
      <p className="text-gray-600 mb-6">{issue.description}</p>
      {issue.image_url && <img src={issue.image_url} alt={issue.title} className="w-full max-w-lg rounded-lg mb-6" />}

      {/* Comments Section */}
      <hr className="my-6"/>
      <h2 className="text-2xl font-bold mb-4">Comments ({comments.length})</h2>
      <div className="space-y-4 mb-6">
        {comments.map(comment => (
          <div key={comment.id} className="bg-gray-100 p-4 rounded-lg">
            <p>{comment.content}</p>
            <p className="text-xs text-gray-500 mt-2">Commented on {new Date(comment.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment}>
        <textarea
          className="w-full p-2 border rounded-lg"
          rows="3"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>
        <button type="submit" className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Post Comment
        </button>
      </form>
    </div>
  );
}

export default IssueDetailPage;