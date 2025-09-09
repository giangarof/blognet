import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Api from '../Api.js'
import { useAuth } from "../context/AuthContext";


export default function Login() {
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await Api.post("/user/login", formData);
      // localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      console.log(res)
      
      login(res.data.user);
      // location.reload()
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error)
      // setError(err.response.data.error);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 3, border: "1px solid #ddd", borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        {location.state?.message && (
        <p style={{ color: "green" }}>{location.state.message}</p>
      )}
        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            fullWidth
            label="Email"
            name="email"
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            name="password"
            onChange={handleChange}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
}

