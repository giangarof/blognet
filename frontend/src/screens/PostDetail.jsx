import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const location = useLocation();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [postingComment, setPostingComment] = useState(false);
  const [liking, setLiking] = useState(false);

  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);

  // Fetch post and comments
  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const { data: postData } = await axios.get(`/api/post/${id}`);
        setPost(postData);

        setLikesCount(postData.likes?.length || 0);
        setLiked(postData.likes?.includes(currentUser?.id || currentUser?.user_id));

        const { data } = await axios.get(`/api/comment/${id}`);
        setComments(data.comments || []);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching post:", err);
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id, currentUser]);

  const isPostOwner = currentUser?.id === post?.createdby;

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setPostingComment(true);

    try {
      const { data } = await axios.post(`/api/comment/${id}`, {
        content: newComment,
      });
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setPostingComment(false);
    }
  };

  // Update post
  const handleUpdatePost = () => {
    navigate(`/updatepost/${id}`);
  };

  // delete Post
  const handleDeletePost = async(id) => {
    await axios.delete(`/api/post/delete/${id}`)
    // alert("Post deleted")
    navigate(`/profile/${currentUser.id}`, { state: { message: "Post deleted" }} )
    
  }

  //delete Comment
  const handleDeleteComment = async(id) => {
    await axios.delete(`/api/comment/${id}`)
    // location.reload()
    // console.log(id)
    
  }


  //update comment
  // const handleUpdateComment = async(id) => {
  //   await axios.put(`/api/comment/${id}`)
  //   // location.reload()
  //   console.log(id)
    
  // }

  const [editingCommentId, setEditingCommentId] = useState(null);
const [editingContent, setEditingContent] = useState("");

// start editing
const startEditComment = (comment) => {
  setEditingCommentId(comment.id);
  setEditingContent(comment.content);
};

// cancel editing
const cancelEditComment = () => {
  setEditingCommentId(null);
  setEditingContent("");
};

// submit edit
const handleUpdateComment = async (id) => {
  if (!editingContent.trim()) return;
  try {
    const { data } = await axios.put(`/api/comment/${id}`, {
      content: editingContent,
    });

    setComments((prev) =>
      prev.map((c) => (c.id === id ? data.comment : c))
    );

    cancelEditComment();
  } catch (err) {
    console.error("Error updating comment:", err);
  }
};

  // Toggle post like
  const handleToggleLike = async () => {
    if (!currentUser) return;
    setLiking(true);

    try {
      const { data } = await axios.post(`/api/post/like/${id}`);
      const updatedPost = data?.likes;

      setLikesCount(updatedPost.likes?.length || 0);
      setLiked(updatedPost.likes?.includes(currentUser.id || currentUser.user_id));
      setPost(updatedPost);
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLiking(false);
    }
  };

  // Toggle comment like
  const handleToggleCommentLike = async (commentId) => {
  if (!currentUser) return;

  try {
    const { data } = await axios.post(`/api/comment/like/${commentId}`);
    const updatedComment = data.comment;

    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? updatedComment : c))
    );
  } catch (err) {
    console.error("Error liking comment:", err);
  }
};

  if (loading) return <Typography>Loading post...</Typography>;
  if (!post) return <Typography>Post not found</Typography>;
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {location.state?.message && (
        <p style={{ color: "green" }}>{location.state.message}</p>
      )}
      {/* Post */}
      <Card>
        {post.image && (
          <CardMedia
            component="img"
            height="300"
            image={post.image}
            alt={post.title}
          />
        )}
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4">{post.title}</Typography>

            {isPostOwner && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleUpdatePost}
                >
                  Update Post
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => handleDeletePost(post.id)}
                >
                  Delete Post
                </Button>
              </Stack>
            )}
          </Stack>

          <Typography variant="subtitle1" color="textSecondary">
            By: <Link to={`/profile/${post.createdby}`}>{post.author}</Link>
          </Typography>

          <Typography variant="body1" sx={{ mt: 2 }} component="div">
            {post.content}
          </Typography>

          {/* Post Likes */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
            <IconButton onClick={handleToggleLike} disabled={liking}>
              {liked ? <ThumbUpIcon color="primary" /> : <ThumbUpOffAltIcon />}
            </IconButton>
            <Typography>
              {likesCount} {likesCount === 1 ? "Like" : "Likes"}
            </Typography>
          </Stack>
        </CardContent>

      </Card>

      {/* Comments */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Comments
      </Typography>

      <List>
        {comments.map((comment) => {
  const commentLiked = comment.likes?.includes(currentUser?.id);

  return (
    <React.Fragment key={comment.id}>
      <ListItem alignItems="flex-start">
        <ListItemText
          primary={
            <Stack direction="row" spacing={1} alignItems="center">
              <span style={{ fontWeight: 600 }}>
                {comment.firstname} {comment.lastname} ({comment.username})
              </span>
              <span style={{ fontSize: "0.8rem", color: "gray" }}>
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </Stack>
          }
          secondary={
            <Stack direction="row" spacing={1} alignItems="center">
              {editingCommentId === comment.id ? (
                <TextField
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  fullWidth
                  size="small"
                />
              ) : (
                <span>{comment.content}</span>
              )}

              {/* Comment Likes */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ ml: 2 }}
              >
                <IconButton
                  onClick={() => handleToggleCommentLike(comment.id)}
                  size="small"
                >
                  {commentLiked ? (
                    <ThumbUpIcon fontSize="small" color="primary" />
                  ) : (
                    <ThumbUpOffAltIcon fontSize="small" />
                  )}
                </IconButton>
                {comment.likes?.length || 0}{" "}
                {(comment.likes?.length || 0) === 1 ? "Like" : "Likes"}
              </Stack>
            </Stack>
          }
          secondaryTypographyProps={{ component: "div" }}
        />
        {isPostOwner || currentUser.id === comment.user_id ? (
          <>
            {editingCommentId === comment.id ? (
              <>
                <Button
                  color="primary"
                  size="small"
                  onClick={() => handleUpdateComment(comment.id)}
                >
                  Save
                </Button>
                <Button color="error" size="small" onClick={cancelEditComment}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="error"
                  size="small"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Delete
                </Button>
                <Button
                  color="primary"
                  size="small"
                  onClick={() => startEditComment(comment)}
                >
                  Edit
                </Button>
              </>
            )}
          </>
        ) : ""}
      </ListItem>
      <Divider component="li" />
    </React.Fragment>
  );
})}

      </List>
        
        {currentUser ? (
          <>
            <TextField
              label="Add a comment"
              fullWidth
              multiline
              minRows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment}
              disabled={postingComment}
              sx={{ mt: 1, mb: 2 }}
            >
              {postingComment ? "Posting..." : "Post Comment"}
            </Button>
          
          </>
        ) : <Container sx={{mb:5, mt:5}}>
          Login or signup to add a comment
        </Container>}
      {/* Add Comment */}
    </Container>
  );
};

export default PostDetail;











