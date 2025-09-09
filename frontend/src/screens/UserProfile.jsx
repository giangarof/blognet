import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Card, CardContent, CardMedia, TextField, Button, Stack } from "@mui/material";
import { useParams, Link as RouterLink, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Report from "../components/ReportComponent";

const UserProfile = () => {
  const navigate = useNavigate()
  const { id } = useParams(); // profile user ID from URL
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);

  const location = useLocation();
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  // console.log(currentUser.id)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: profile } = await axios.get(`/api/user/${id}`);
        setUser(profile);

        const { data: userPosts } = await axios.get(`/api/post/all/${id}`);
        setPosts(userPosts);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [id]);

  if (!user) return <Typography>Loading profile...</Typography>;

  // Only allow current user to create post on their own profile
  const isOwnProfile = currentUser?.id === user.id;
  // console.log(currentUser)


  const deleteUserProfile = async(id) => {
    const res = await axios.delete(`/api/user/delete/${id}`)
    console.log(res)
    localStorage.removeItem("user")
    
    navigate(`/login`, { state: { message: "User deleted" }} )
    location.reload()
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Profile Info */}
      {location.state?.message && (
        <p style={{ color: "green" }}>{location.state.message}</p>
      )}
      <Typography variant="h5">{`${user.firstname} ${user.lastname}`}</Typography>
      <Typography variant="subtitle1" color="text.secondary">@{user.username}</Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>{user.email}</Typography>

      {/* Create Post Section */}
      {isOwnProfile && (
        <>
          <Link to={'/createpost'}>
            <Button>Create Post</Button>
          </Link>
          <Link to={`/profile/update/${currentUser.id}`}>
            <Button>Update Profile</Button>
          </Link>
          <Button onClick={() => deleteUserProfile(currentUser.id)} color="error">Delete account</Button>

          {currentUser.is_admin && (<><Link to={'/report'}>
              <Button>Report</Button>
            </Link></>)}

        </>
      )}

      {/* Posts */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Posts
      </Typography>

      {posts.length === 0 ? (
        <Typography color="text.secondary">No posts yet.</Typography>
      ) : (
        <Stack spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} key={post.id}>
              <Card sx={{ borderRadius: 3, overflow: "hidden", transition: "0.3s", "&:hover": { boxShadow: 6 } }}>
                {post.image && (
                  <CardMedia
                    component="img"
                    image={post.image}
                    alt={post.title}
                    sx={{
                      width: "100%",
                      height: 300,
                      objectFit: "cover",
                    }}
                  />
                )}
                <CardContent>
                  <RouterLink to={`/post/${post.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <Typography variant="h6">{post.title}</Typography>
                  </RouterLink>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(post.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>{post.content}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default UserProfile;















