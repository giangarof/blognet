import { useState, useEffect } from "react";
import axios from "axios";
import { Grid, Paper, Typography, Box, Stack } from "@mui/material";
import { Link } from "react-router-dom";

import Api from '../Api.js'

import SearchBar from "../components/SearchBar";

const Home = () => {
  const [displayedItems, setDisplayedItems] = useState([]);
  const [searchType, setSearchType] = useState("posts");
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ Fetch default posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await Api.get(`/post`); // <-- adjust endpoint 
        setDisplayedItems(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    if (!hasSearched) {
      fetchPosts();
    }
  }, [hasSearched]);

  const handleSearchResults = (results) => {
    if (results === null) {
      // Search cleared → restore home feed
      setHasSearched(false);
    } else {
      setDisplayedItems(results);
      setHasSearched(true);
    }
  };

  const handleSearchType = (type) => {
    setSearchType(type);
    setDisplayedItems([]);
    setHasSearched(false);
  };

  return (
    <Stack spacing={4} alignItems="center" sx={{ mt: 4, mb:4 }}>
      <SearchBar
        onSelectType={handleSearchType}
        onResults={handleSearchResults}
      />

      <Stack spacing={3} sx={{ px: 2, maxWidth: 1200, mx: "auto" }}>
        {displayedItems.length === 0 ? (
          <Grid item xs={12}>
            <Typography
              variant="h6"
              align="center"
              sx={{ color: "text.secondary" }}
            >
              {hasSearched ? "Nothing found. 🤷‍♂️" : "Start typing to search"}
            </Typography>
          </Grid>
        ) : (
          displayedItems
            .filter((item) => item && item.id)
            .map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Paper
                  elevation={3}
                  sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: 2,
                    transition: "0.3s",
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  {searchType === "users" ? (
                    <Link
                      to={`/profile/${item.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Typography variant="h6">
                        {item.firstname} {item.lastname} ({item.username})
                      </Typography>
                    </Link>
                  ) : (
                    <Link
                      to={`/post/${item.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Stack spacing={2} sx={{ width: '100%' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {item.author} •{" "}
                          {new Date(item.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ mt: 1, fontWeight: 600 }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ mt: 1, color: "text.primary" }}
                        >
                          {item.content}
                        </Typography>
                        {item.image && (
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.title}
                            sx={{
                              width: "100%",
                              mt: 2,
                              borderRadius: 2,
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </Stack>
                    </Link>
                  )}
                </Paper>
              </Grid>
            ))
        )}
      </Stack>
    </Stack>
  );
};

export default Home;







