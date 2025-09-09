import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await axios.post("/api/user/logout", {}, { withCredentials: true });
    } catch (_) {
      // ignore backend errors for UX
    }
    logout();
    navigate("/login");
  };

  // Menu items for desktop and mobile
  const menuItems = !user
    ? [
        <MenuItem key="login" component={Link} to="/login" onClick={handleClose}>
          Login
        </MenuItem>,
        <MenuItem key="signup" component={Link} to="/signup" onClick={handleClose}>
          Signup
        </MenuItem>,
      ]
    : [
        <MenuItem key="home" component={Link} to="/" onClick={handleClose}>
          Home
        </MenuItem>,
        <MenuItem
          key="profile"
          component={Link}
          to={`/profile/${user.id}`}
          onClick={handleClose}
        >
          Profile
        </MenuItem>,
        <MenuItem
          key="logout"
          onClick={() => {
            handleClose();
            handleLogout();
          }}
        >
          Logout
        </MenuItem>,
      ];

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          BlogNet
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop menu */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
          {!user ? (
            <>
              <Button component={Link} to="/login" color="inherit">
                Login
              </Button>
              <Button component={Link} to="/signup" color="inherit">
                Signup
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/" color="inherit">
                Home
              </Button>
              <Button component={Link} to={`/profile/${user.id}`} color="inherit">
                Profile
              </Button>
              <Button onClick={handleLogout} color="inherit">
                Logout
              </Button>
            </>
          )}
        </Box>

        {/* Mobile menu */}
        <Box sx={{ display: { xs: "flex", sm: "none" } }}>
          <IconButton color="inherit" onClick={handleMenu} size="large">
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            {menuItems}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}



