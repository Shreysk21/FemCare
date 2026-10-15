import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, MessageSquare, Shield, Flag, UserX, Plus, Send, CornerDownRight } from 'lucide-react';
import { Modal } from '../components/Modal';

export const CommunityView = () => {
  const { communityPosts, addCommunityPost, toggleLikePost, addReplyToPost, reportPost, blockUser } = useApp();

  const [activeCategory, setActiveCategory] = useState('All');
  const [newPostModal, setNewPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('Cycle Health');
  const [postBody, setPostBody] = useState('');

  // Active Reply Modal
  const [activeReplyPost, setActiveReplyPost] = useState(null);
  const [replyText, setReplyText] = useState('');

  const categories = ['All', 'Cycle Health', 'PCOS & Endometriosis', 'Mental Wellness', 'Nutrition & Fitness'];

  const filteredPosts = activeCategory === 'All'
    ? communityPosts
    : communityPosts.filter(p => p.category === activeCategory);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (postTitle && postBody) {
      addCommunityPost(postTitle, postCategory, postBody);
      setNewPostModal(false);
      setPostTitle('');
      setPostBody('');
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Anonymous Support Forum</span>
            <span className="text-xl">💬</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Share experiences, ask questions & connect anonymously
          </p>
        </div>
        <button
          onClick={() => setNewPostModal(true)}
          className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-purple-900 dark:text-purple-200">
        <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <p>
          <strong>100% Anonymous & Moderated:</strong> Your personal identity is never displayed. Feel safe discussing menstrual, reproductive, and mental health.
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              activeCategory === cat
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* POSTS FEED */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{post.avatar}</span>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {post.author}
                  </div>
                  <div className="text-[10px] text-slate-400">{post.timeAgo}</div>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-1 rounded-full border border-purple-200/60">
                {post.category}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {post.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {post.body}
              </p>
            </div>

            {/* Post Footer Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className={`flex items-center gap-1.5 font-bold transition-colors ${
                    post.liked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.liked ? 'fill-rose-600' : ''}`} />
                  <span>{post.likes}</span>
                </button>

                <button
                  onClick={() => setActiveReplyPost(post)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.replies.length} Replies</span>
                </button>
              </div>

              {/* Moderation Options */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => reportPost(post.id)}
                  className="p-1 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Report Post"
                  aria-label="Report Post"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => blockUser(post.author)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Block User Content"
                  aria-label="Block User"
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* CREATE POST MODAL */}
      <Modal
        isOpen={newPostModal}
        onClose={() => setNewPostModal(false)}
        title="Create Anonymous Community Post"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Discussion Category
            </label>
            <select
              value={postCategory}
              onChange={(e) => setPostCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            >
              <option value="Cycle Health">Cycle Health</option>
              <option value="PCOS & Endometriosis">PCOS & Endometriosis</option>
              <option value="Mental Wellness">Mental Wellness</option>
              <option value="Nutrition & Fitness">Nutrition & Fitness</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Post Title
            </label>
            <input
              type="text"
              required
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="e.g. Tips for managing cramp discomfort?"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Discussion Message
            </label>
            <textarea
              required
              rows={4}
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder="Write your experience or question anonymously..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-md"
          >
            Post Anonymously
          </button>
        </form>
      </Modal>

      {/* REPLIES THREAD MODAL */}
      <Modal
        isOpen={!!activeReplyPost}
        onClose={() => setActiveReplyPost(null)}
        title={activeReplyPost ? `Replies to: "${activeReplyPost.title}"` : "Post Replies"}
      >
        {activeReplyPost && (
          <div className="space-y-4">
            
            {/* Original Post Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">{activeReplyPost.author}</div>
              <p className="text-slate-600 dark:text-slate-300 mt-1">{activeReplyPost.body}</p>
            </div>

            {/* Replies List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Community Replies ({activeReplyPost.replies.length})
              </h4>

              {activeReplyPost.replies.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No replies yet. Be the first to answer!</p>
              ) : (
                activeReplyPost.replies.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-purple-950 dark:text-purple-200">
                      <span>{r.author}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{r.timeAgo}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{r.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Reply Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (replyText.trim()) {
                  addReplyToPost(activeReplyPost.id, replyText);
                  setReplyText('');
                }
              }}
              className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              <input
                type="text"
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write an anonymous reply..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </form>

          </div>
        )}
      </Modal>

    </div>
  );
};
