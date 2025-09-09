import React, { useState, useEffect } from "react";
import { Container, Paper, Typography, TextField, Button, Box } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

export default function UpdatePost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const location = useLocation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // same as CreatePost
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`/api/post/${id}`);
        setTitle(data.title);
        setContent(data.content);
        setImageUrl(data.image || "");
        console.log(data)
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      const { data } = await axios.put(
        `/api/post/${id}`,
        {
          title,
          content,
          image: imageUrl || null,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      navigate(`/post/${data.id}`, { state: { message: "Post updated successfully" } }); // redirect to updated post
    } catch (err) {
      setError(err.response?.data?.error || err);
      console.log(err)
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Update Post
        </Typography>
        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
            margin="normal"
          />
          <TextField
            label="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Update
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}


