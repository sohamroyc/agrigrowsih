import React, { useState, useRef, useEffect } from 'react';
import { CommunityPost, User, Comment } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import Card from './Card';
import Button from './Button';

interface CommunityPostCardProps {
    post: CommunityPost;
    currentUser: User | null;
    onToggleLike: (postId: string) => void;
    onAddComment: (postId: string, commentText: string) => void;
    onEdit: (post: CommunityPost) => void;
    onDelete: (postId: string) => void;
    onReport: (postId: string) => void;
}

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({ post, currentUser, onToggleLike, onAddComment, onEdit, onDelete, onReport }) => {
    const { t } = useLocalization();
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const optionsRef = useRef<HTMLDivElement>(null);
    
    const isLikedByUser = currentUser ? post.likes.includes(currentUser.id) : false;
    const isOwner = currentUser ? currentUser.id === post.author.id : false;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setIsOptionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddComment(post.id, newComment);
        setNewComment('');
    };
    
    const timeSince = (dateString: string): string => {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        if (seconds < 30) {
            return t('just_now');
        }
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return minutes === 1 ? t('a_minute_ago') : t('minutes_ago', { count: minutes });
        }
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return hours === 1 ? t('an_hour_ago') : t('hours_ago', { count: hours });
        }
        
        const days = Math.floor(hours / 24);
        if (days < 30) {
            return days === 1 ? t('a_day_ago') : t('days_ago', { count: days });
        }

        const months = Math.floor(days / 30);
        if (months < 12) {
            return months === 1 ? t('a_month_ago') : t('months_ago', { count: months });
        }

        const years = Math.floor(days / 365);
        return years === 1 ? t('a_year_ago') : t('years_ago', { count: years });
    };

    return (
        <Card>
            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {post.author.avatarInitial}
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-green-800 dark:text-green-300">{post.author.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{timeSince(post.timestamp)}</p>
                        </div>
                        {currentUser && (
                             <div className="relative" ref={optionsRef}>
                                <button onClick={() => setIsOptionsOpen(!isOptionsOpen)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <i className="fas fa-ellipsis-h"></i>
                                </button>
                                {isOptionsOpen && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border dark:border-gray-600">
                                        {isOwner ? (
                                            <>
                                                <button onClick={() => { onEdit(post); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-600"><i className="fas fa-edit w-4 mr-2"></i>{t('edit')}</button>
                                                <button onClick={() => { onDelete(post.id); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40"><i className="fas fa-trash-alt w-4 mr-2"></i>{t('delete')}</button>
                                            </>
                                        ) : (
                                            <button onClick={() => { onReport(post.id); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/40"><i className="fas fa-flag w-4 mr-2"></i>{t('report')}</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.text}</p>
                </div>
            </div>

            {post.imageUrl && (
                <div className="mt-4">
                    <img src={post.imageUrl} alt="User post" className="max-h-96 w-full object-cover rounded-lg" />
                </div>
            )}

            <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <div>{post.likes.length} {post.likes.length === 1 ? t('like') : t('likes')}</div>
                <div>{post.comments.length} {post.comments.length === 1 ? t('comment') : t('comments')}</div>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-around">
                <Button 
                    onClick={() => onToggleLike(post.id)} 
                    disabled={!currentUser}
                    className={`flex-1 text-center py-2 rounded-lg font-semibold ${isLikedByUser ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    <i className={`fas fa-thumbs-up mr-2 ${isLikedByUser ? '' : 'far'}`}></i> {t('like')}
                </Button>
                <Button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex-1 text-center py-2 rounded-lg font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <i className="far fa-comment-alt mr-2"></i> {t('comment')}
                </Button>
            </div>

            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {/* Comment Form */}
                    {currentUser && (
                        <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={t('add_a_comment')}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-600 dark:text-gray-200"
                                    rows={1}
                                    required
                                />
                                <div className="text-right mt-2">
                                    <Button type="submit" variant="secondary" className="px-3 py-1 text-xs">
                                        {t('comment')}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                    {/* Comments List */}
                    <div className="space-y-3">
                        {post.comments.map(comment => (
                            <div key={comment.id} className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm flex-shrink-0">
                                    {comment.author.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-grow bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                    <div className="flex justify-between items-baseline">
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{comment.author.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{timeSince(comment.timestamp)}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default CommunityPostCard;