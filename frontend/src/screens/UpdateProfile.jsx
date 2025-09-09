import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  Paper,
} from "@mui/material";

export default function UpdateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const location = useLocation();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  // Load existing user data (not passwords)
  useEffect(() => {
    axios
      .get(`/api/user/${id}`)
      .then((res) =>
        setFormData((prev) => ({
          ...prev,
          firstname: res.data.firstname || "",
          lastname: res.data.lastname || "",
          email: res.data.email || "",
          username: res.data.username || "",
        }))
      )
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Don’t send confirmPassword to backend
      const payload = { ...formData };
      delete payload.confirmPassword;

      // If password is empty, don’t include it (so backend won’t overwrite it)
      if (!payload.password) {
        delete payload.password;
      }

      await axios.put(`/api/user/${id}`, payload);
      // alert("Profile updated successfully");
      navigate(`/profile/${id}`, { state: { message: "Profile updated successfully" } });
    } catch (err) {
      console.error(err.response?.data?.error?.detail);
      setError(err.response?.data?.error?.detail);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          Update Profile
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="First Name"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              fullWidth
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
