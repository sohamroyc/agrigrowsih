import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { communityPostsData } from '../data/communityData';
import { CommunityPost, Comment } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import CommunityPostCard from '../components/CommunityPostCard';

const CommunityView: React.FC = () => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const [posts, setPosts] = useState<CommunityPost[]>(communityPostsData);
    const [newPostText, setNewPostText] = useState('');
    const [newPostImage, setNewPostImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    // State for the edit modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
    const [editedText, setEditedText] = useState('');


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewPostImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostText.trim() || !user) return;

        const newPost: CommunityPost = {
            id: `post${Date.now()}`,
            author: {
                id: user.id,
                name: user.name || user.email.split('@')[0],
                avatarInitial: (user.name || user.email).charAt(0).toUpperCase(),
            },
            timestamp: new Date().toISOString(),
            text: newPostText,
            imageUrl: imagePreview || undefined,
            likes: [],
            comments: [],
        };

        setPosts([newPost, ...posts]);
        setNewPostText('');
        setNewPostImage(null);
        setImagePreview(null);
    };

    const handleToggleLike = (postId: string) => {
        if (!user) return;
        setPosts(posts.map(post => {
            if (post.id === postId) {
                const isLiked = post.likes.includes(user.id);
                const newLikes = isLiked
                    ? post.likes.filter(id => id !== user.id)
                    : [...post.likes, user.id];
                return { ...post, likes: newLikes };
            }
            return post;
        }));
    };

    const handleAddComment = (postId: string, commentText: string) => {
        if (!user || !commentText.trim()) return;

        const newComment: Comment = {
            id: `comment${Date.now()}`,
            author: {
                id: user.id,
                name: user.name || user.email.split('@')[0],
            },
            text: commentText,
            timestamp: new Date().toISOString(),
        };

        setPosts(posts.map(post => {
            if (post.id === postId) {
                return { ...post, comments: [...post.comments, newComment] };
            }
            return post;
        }));
    };

    const handleInitiateEdit = (post: CommunityPost) => {
        setEditingPost(post);
        setEditedText(post.text);
        setIsEditModalOpen(true);
    };

    const handleUpdatePost = () => {
        if (!editingPost) return;
        setPosts(posts.map(p => 
            p.id === editingPost.id ? { ...p, text: editedText } : p
        ));
        setIsEditModalOpen(false);
        setEditingPost(null);
    };

    const handleDeletePost = (postId: string) => {
        if (window.confirm(t('delete_confirmation_body'))) {
            setPosts(posts.filter(p => p.id !== postId));
        }
    };

    const handleReportPost = (postId: string) => {
        // In a real app, this would trigger an API call.
        alert(t('post_reported_toast'));
    };


    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-4xl font-extrabold text-green-800 dark:text-green-300">{t('community_title')}</h2>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('community_desc')}</p>
            </div>
            
            {user ? (
                 <Card>
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-4">{t('create_post')}</h3>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                        <textarea
                            value={newPostText}
                            onChange={(e) => setNewPostText(e.target.value)}
                            placeholder={t('whats_on_your_mind', { userName: user.name || user.email.split('@')[0] })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-200"
                            rows={3}
                            required
                        />
                         {imagePreview && (
                            <div className="relative w-32 h-32">
                                <img src={imagePreview} alt="Post preview" className="w-full h-full object-cover rounded-lg shadow-md" />
                                <button onClick={() => { setNewPostImage(null); setImagePreview(null); }} type="button" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-7 w-7 flex items-center justify-center shadow-lg hover:bg-red-600" title={t('clear_image')}>
                                    &times;
                                </button>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <label htmlFor="post-image" className="cursor-pointer text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-semibold">
                                <i className="fas fa-camera mr-2"></i>{t('add_photo')}
                                <input type="file" id="post-image" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                            <Button type="submit" variant="secondary">{t('post')}</Button>
                        </div>
                    </form>
                </Card>
            ) : (
                <Card className="text-center">
                    <p>{t('login_to_interact_community')}</p>
                </Card>
            )}

            <div className="space-y-6">
                {posts.map(post => (
                    <CommunityPostCard 
                        key={post.id} 
                        post={post}
                        currentUser={user}
                        onToggleLike={handleToggleLike}
                        onAddComment={handleAddComment}
                        onEdit={handleInitiateEdit}
                        onDelete={handleDeletePost}
                        onReport={handleReportPost}
                    />
                ))}
            </div>

            {/* Edit Post Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={t('edit_post')}>
                <div className="space-y-4">
                    <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-200"
                        rows={5}
                    />
                    <div className="flex justify-end gap-4">
                        <Button onClick={() => setIsEditModalOpen(false)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleUpdatePost} variant="secondary">
                            {t('save_changes')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CommunityView;