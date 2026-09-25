import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import PageContainer from "../../components/layout/PageContainer";
import aiAPI from "../../api/aiAPI";

function ProjectSummary() {
  const { projectId } = useParams();

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await aiAPI.generateProjectSummary(
        Number(projectId)
      );

      setSummaryData(data);
    } catch (err) {
      console.error("Failed to generate project summary:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to generate project summary."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Summarize Progress
          </Typography>

          <Typography color="text.secondary">
            Generate an AI-powered summary of the current project progress.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <AutoAwesomeIcon />
            )
          }
          onClick={handleGenerateSummary}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Summary"}
        </Button>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary */}
      {summaryData && (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {summaryData.project_name}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.8 }}
              >
                {summaryData.summary}
              </Typography>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <AssignmentOutlinedIcon color="primary" />

                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Total Tasks
                      </Typography>

                      <Typography variant="h4">
                        {summaryData.total_tasks}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <CheckCircleOutlineIcon color="success" />

                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Completed
                      </Typography>

                      <Typography variant="h4">
                        {summaryData.completed_tasks}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <PendingActionsIcon color="warning" />

                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        In Progress
                      </Typography>

                      <Typography variant="h4">
                        {summaryData.in_progress_tasks}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <AssignmentOutlinedIcon color="info" />

                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        To Do
                      </Typography>

                      <Typography variant="h4">
                        {summaryData.todo_tasks}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Initial state */}
      {!summaryData && !loading && !error && (
        <Card>
          <CardContent
            sx={{
              py: 8,
              textAlign: "center",
            }}
          >
            <AutoAwesomeIcon
              sx={{
                fontSize: 48,
                color: "primary.main",
                mb: 2,
              }}
            />

            <Typography variant="h6" gutterBottom>
              Generate a Project Progress Summary
            </Typography>

            <Typography color="text.secondary">
              Click "Generate Summary" to let AI analyze the
              current project task progress.
            </Typography>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

export default ProjectSummary;