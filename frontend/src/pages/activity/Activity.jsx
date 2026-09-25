import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import TimelineIcon from "@mui/icons-material/Timeline";

import ActivityTimeline from "../../components/activities/ActivityTimeline";
import projectAPI from "../../api/projectAPI";
import PageContainer from "../../components/layout/PageContainer";

function Activity() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
const [projectLoading, setProjectLoading] = useState(false);

useEffect(() => {
  if (!projectId) {
    return;
  }

  const loadProject = async () => {
    try {
      setProjectLoading(true);

      const projectData = await projectAPI.getProject(
        Number(projectId)
      );

      setProject(projectData);
    } catch (projectError) {
      console.error(
        "Failed to load project:",
        projectError
      );
    } finally {
      setProjectLoading(false);
    }
  };

  loadProject();
}, [projectId]);

  return (
  <Box
    sx={{
      minHeight: "100vh",
      backgroundColor: "background.default",
      py: {
        xs: 2.5,
        sm: 3,
        md: 4,
      },
    }}
  >
    <PageContainer>
      {/* =========================
          BREADCRUMBS
      ========================= */}

      <Breadcrumbs
        sx={{
          mb: {
            xs: 2.5,
            md: 3,
          },
        }}
      >
        <Button
          onClick={() => navigate("/dashboard")}
          sx={{
            minWidth: 0,
            p: 0,
            color: "text.secondary",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "transparent",
              color: "primary.main",
            },
          }}
        >
          Dashboard
        </Button>

        <Button
          onClick={() => navigate("/projects")}
          sx={{
            minWidth: 0,
            p: 0,
            color: "text.secondary",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "transparent",
              color: "primary.main",
            },
          }}
        >
          Projects
        </Button>

        <Button
          onClick={() =>
            navigate(`/projects/${projectId}`)
          }
          sx={{
            minWidth: 0,
            p: 0,
            color: "text.secondary",
            fontWeight: 500,
            maxWidth: {
              xs: 150,
              sm: 300,
            },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            "&:hover": {
              backgroundColor: "transparent",
              color: "primary.main",
            },
          }}
        >
          {projectLoading
            ? "Project"
            : project?.name || "Project"}
        </Button>

        <Typography
          color="text.primary"
          fontWeight={600}
        >
          Activity
        </Typography>
      </Breadcrumbs>

      {/* =========================
          PAGE HEADER
      ========================= */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(110deg, #ffffff 0%, #f4f6fd 100%)",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,
              sm: 3,
              md: 4,
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            spacing={3}
          >
            <Box
              sx={{
                width: {
                  xs: 52,
                  sm: 60,
                },
                height: {
                  xs: 52,
                  sm: 60,
                },
                borderRadius: 3,
                backgroundColor: "primary.light",
                color: "primary.dark",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <TimelineIcon
                sx={{
                  fontSize: {
                    xs: 28,
                    sm: 32,
                  },
                }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="overline"
                color="primary.main"
                fontWeight={700}
                sx={{
                  letterSpacing: "0.08em",
                }}
              >
                PROJECT ACTIVITY
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mt: -0.5,
                  fontSize: {
                    xs: "1.65rem",
                    sm: "2rem",
                  },
                }}
              >
                Project Activity
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Track recent changes and updates
                across your project.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* =========================
          ACTIVITY CONTENT
      ========================= */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },
          }}
        >
          <ActivityTimeline projectId={projectId} />
        </CardContent>
      </Card>
    </PageContainer>
  </Box>
);
}

export default Activity;