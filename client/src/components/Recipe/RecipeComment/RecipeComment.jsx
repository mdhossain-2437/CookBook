import { useState, useEffect } from 'react';
import { FaReply, FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../../../hooks/useAuth';

const RecipeComment = ({ recipeId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // This would be replaced with an actual API call
    const mockComments = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Chef Gordon',
        userImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        text: 'This recipe is amazing! I added a bit more garlic and it was perfect.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        replies: [
          {
            id: '1-1',
            userId: 'user2',
            userName: 'Julia Child',
            userImage: 'https://randomuser.me/api/portraits/women/44.jpg',
            text: 'I agree! The extra garlic makes all the difference.',
            createdAt: new Date(Date.now() - 43200000).toISOString(),
          },
        ],
      },
      {
        id: '2',
        userId: 'user3',
        userName: 'Jamie Oliver',
        userImage: 'https://randomuser.me/api/portraits/men/46.jpg',
        text: 'I substituted olive oil with avocado oil and it worked great!',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        replies: [],
      },
    ];
    setComments(mockComments);
  }, [recipeId]);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setLoading(true);
    // This would be an API call in a real implementation
    setTimeout(() => {
      const newCommentObj = {
        id: Date.now().toString(),
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        userImage: user.photoURL || null,
        text: newComment,
        createdAt: new Date().toISOString(),
        replies: [],
      };

      setComments([newCommentObj, ...comments]);
      setNewComment('');
      setLoading(false);
      toast.success('Comment added successfully!');
    }, 500);
  };

  const handleSubmitReply = (commentId) => {
    if (!user) {
      toast.error('Please log in to reply');
      return;
    }
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    setLoading(true);
    // This would be an API call in a real implementation
    setTimeout(() => {
      const newReply = {
        id: `${commentId}-${Date.now()}`,
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        userImage: user.photoURL || null,
        text: replyText,
        createdAt: new Date().toISOString(),
      };

      const updatedComments = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...comment.replies, newReply],
          };
        }
        return comment;
      });

      setComments(updatedComments);
      setReplyingTo(null);
      setReplyText('');
      setLoading(false);
      toast.success('Reply added successfully!');
    }, 500);
  };

  const handleEditComment = (commentId, isReply = false, parentId = null) => {
    let commentToEdit;
    if (isReply && parentId) {
      const parentComment = comments.find((c) => c.id === parentId);
      commentToEdit = parentComment.replies.find((r) => r.id === commentId);
    } else {
      commentToEdit = comments.find((c) => c.id === commentId);
    }

    if (commentToEdit) {
      setEditingComment({ id: commentId, isReply, parentId });
      setEditText(commentToEdit.text);
    }
  };

  const handleUpdateComment = () => {
    if (!editText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setLoading(true);
    // This would be an API call in a real implementation
    setTimeout(() => {
      if (editingComment.isReply) {
        const updatedComments = comments.map((comment) => {
          if (comment.id === editingComment.parentId) {
            const updatedReplies = comment.replies.map((reply) => {
              if (reply.id === editingComment.id) {
                return { ...reply, text: editText };
              }
              return reply;
            });
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        });
        setComments(updatedComments);
      } else {
        const updatedComments = comments.map((comment) => {
          if (comment.id === editingComment.id) {
            return { ...comment, text: editText };
          }
          return comment;
        });
        setComments(updatedComments);
      }

      setEditingComment(null);
      setEditText('');
      setLoading(false);
      toast.success('Comment updated successfully!');
    }, 500);
  };

  const handleDeleteComment = (commentId, isReply = false, parentId = null) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setLoading(true);
    // This would be an API call in a real implementation
    setTimeout(() => {
      if (isReply && parentId) {
        const updatedComments = comments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies.filter((reply) => reply.id !== commentId),
            };
          }
          return comment;
        });
        setComments(updatedComments);
      } else {
        const updatedComments = comments.filter((comment) => comment.id !== commentId);
        setComments(updatedComments);
      }

      setLoading(false);
      toast.success('Comment deleted successfully!');
    }, 500);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full">
      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
            {user && user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                <FaUser />
              </div>
            )}
          </div>
          <div className="flex-grow">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Add a comment..." : "Please log in to comment"}
              disabled={!user || loading}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white resize-none min-h-[100px]"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!user || loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              {/* Main Comment */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  {comment.userImage ? (
                    <img src={comment.userImage} alt={comment.userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                      <FaUser />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{comment.userName}</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {editingComment && editingComment.id === comment.id && !editingComment.isReply ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white resize-none min-h-[80px] mb-2"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingComment(null)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateComment}
                          disabled={loading}
                          className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                        >
                          {loading ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.text}</p>
                  )}

                  {!editingComment || editingComment.id !== comment.id || editingComment.isReply ? (
                    <div className="flex gap-4">
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light flex items-center gap-1"
                      >
                        <FaReply size={12} /> Reply
                      </button>
                      {user && user.uid === comment.userId && (
                        <>
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light flex items-center gap-1"
                          >
                            <FaEdit size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 flex items-center gap-1"
                          >
                            <FaTrash size={12} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-4 ml-14">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white resize-none min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                    >
                      {loading ? "Replying..." : "Reply"}
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-14 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        {reply.userImage ? (
                          <img
                            src={reply.userImage}
                            alt={reply.userName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                            <FaUser size={10} />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{reply.userName}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>

                        {editingComment &&
                        editingComment.id === reply.id &&
                        editingComment.isReply &&
                        editingComment.parentId === comment.id ? (
                          <div>
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white resize-none min-h-[80px] mb-2"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingComment(null)}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleUpdateComment}
                                disabled={loading}
                                className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                              >
                                {loading ? "Updating..." : "Update"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300 mb-2">{reply.text}</p>
                        )}

                        {(!editingComment ||
                          editingComment.id !== reply.id ||
                          !editingComment.isReply ||
                          editingComment.parentId !== comment.id) && (
                          <div className="flex gap-4">
                            {user && user.uid === reply.userId && (
                              <>
                                <button
                                  onClick={() => handleEditComment(reply.id, true, comment.id)}
                                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light flex items-center gap-1"
                                >
                                  <FaEdit size={12} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 flex items-center gap-1"
                                >
                                  <FaTrash size={12} /> Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecipeComment;