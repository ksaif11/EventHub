import React, { useState } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Avatar, 
  Menu, 
  MenuItem, 
  IconButton,
  Box
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        bgcolor: "white",
        color: "black",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar sx={{ py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* Left Side - Brand */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h5"
            sx={{ 
              cursor: "pointer", 
              fontWeight: 1100,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            onClick={() => navigate("/")}
          >
            SocioGather
          </Typography>
        </Box>

        {/* Right Side - User Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {!user ? (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate("/login")}
              sx={{ 
                textTransform: "none", 
                fontWeight: 500,
                borderRadius: 2,
                px: 3
              }}
            >
              Login
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/create-event")}
                sx={{ 
                  textTransform: "none", 
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 3
                }}
              >
                Create Event
              </Button>
              <IconButton onClick={handleMenuOpen}>
                <Avatar 
                  alt={user.name} 
                  src={user.avatar || ""}
                  sx={{ 
                    bgcolor: "primary.main",
                    width: 40,
                    height: 40
                  }}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                  }
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/dashboard");
                  }}
                  sx={{ px: 3, py: 1.5 }}
                >
                  My Dashboard
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogout();
                  }}
                  sx={{ px: 3, py: 1.5 }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
