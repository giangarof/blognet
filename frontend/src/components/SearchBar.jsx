import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {useParams, useNavigate} from 'react-router-dom'

export default function SearchBar({ onSelectType, onResults }) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState();
  const navigate = useNavigate('')

  useEffect(() => {
  const timer = setTimeout(() => {
    if (query.trim() === "") {
      onResults(null); // This sends the 'null' signal
      return;
    }
    handleSearch();
  }, 300);

  return () => clearTimeout(timer);
}, [query, searchType]);

  const handleSearch = async () => {
    try {
      const { data } = await axios.get(`/api/search?type=${searchType}&query=${query}`);
      onResults(data);
      // navigate(`/search?type=${searchType}&query=${query}`)
    } catch (err) {
      console.error(err);
      onResults([]);
    }
  };

  const handleTypeChange = (type) => {
    setSearchType(type);
    onSelectType(type);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 6, px: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 4, width: "100%", maxWidth: 600, alignItems: "center" }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder={`Search ${searchType}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} edge="end">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: "50px" },
            },
          }}
        />
        <Stack direction="row" spacing={1}>
          <Button
            variant={searchType === "posts" ? "contained" : "outlined"}
            onClick={() => handleTypeChange("posts")}
            sx={{ borderRadius: "50px" }}
          >
            Posts
          </Button>
          <Button
            variant={searchType === "users" ? "contained" : "outlined"}
            onClick={() => handleTypeChange("users")}
            sx={{ borderRadius: "50px" }}
          >
            Users
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}



