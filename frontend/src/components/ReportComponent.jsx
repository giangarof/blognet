// Report.jsx
import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { format } from "date-fns";

const ReportComponent = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  const fetchReport = async () => {
    if (!startDate || !endDate) return;

    try {
      const response = await fetch(
        `/api/report?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      setPosts(data.posts);
      setComments(data.comments);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    }
  };

  const downloadCSV = () => {
    let csv = "Type,User,Content,Likes,Date,PostTitle,PostID\n";

    posts.forEach((p) => {
      csv += `Post,${p.firstname} ${p.lastname},"${p.content}",${p.likes_count},${p.created_at},"${p.title}",${p.id}\n`;
    });

    comments.forEach((c) => {
      csv += `Comment,${c.firstname} ${c.lastname},"${c.content}",${c.likes_count},${c.created_at},,${c.post_id}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `report_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
    link.click();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Activity Report
      </Typography>

      <TextField
        label="Start Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        sx={{ mr: 2 }}
      />
      <TextField
        label="End Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        sx={{ mr: 2 }}
      />
      <Button variant="contained" onClick={fetchReport} sx={{ mr: 2 }}>
        Generate Report
      </Button>
      <Button variant="outlined" onClick={downloadCSV}>
        Download CSV
      </Button>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Posts
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Content</TableCell>
            <TableCell>Likes</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {posts.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.title}</TableCell>
              <TableCell>
                {p.firstname} {p.lastname}
              </TableCell>
              <TableCell>{p.content}</TableCell>
              <TableCell>{p.likes_count}</TableCell>
              <TableCell>{p.created_at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Comments
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Post ID</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Content</TableCell>
            <TableCell>Likes</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {comments.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.post_id}</TableCell>
              <TableCell>
                {c.firstname} {c.lastname}
              </TableCell>
              <TableCell>{c.content}</TableCell>
              <TableCell>{c.likes_count}</TableCell>
              <TableCell>{c.created_at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default ReportComponent;

