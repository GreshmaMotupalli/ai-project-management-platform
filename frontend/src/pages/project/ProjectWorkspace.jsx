import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import SprintIcon from "@mui/icons-material/Speed";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";

import projectAPI from "../../api/projectAPI";
import teamAPI from "../../features/teams/teamAPI";
import taskAPI from "../../features/tasks/taskAPI";
import PageContainer from "../../components/layout/PageContainer";

function ProjectWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWorkspace = async () => {
      setLoading(true);
      setError("");

      try {
        const [projectData, teamsData, tasksData] =
          await Promise.all([
            projectAPI.getProject(projectId),
            teamAPI.getProjectTeams(projectId),
            taskAPI.getProjectTasks(projectId),
          ]);

        setProject(projectData);
        setTeams(teamsData);
        setTasks(tasksData);
      } catch (err) {
        console.error(
          "Failed to load project workspace:",
          err
        );

        setError("Failed to load project workspace.");
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [projectId]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Active",
          color: "success",
        };

      case "COMPLETED":
        return {
          label: "Completed",
          color: "primary",
        };

      case "ARCHIVED":
        return {
          label: "Archived",
          color: "default",
        };

      default:
        return {
          label: status || "Unknown",
          color: "default",
        };
    }
  };

  const todoTasks = tasks.filter(
    (task) => task.status === "TODO"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  const navigationItems = [
    {
      title: "Teams",
      description:
        "Manage project teams and team members.",
      icon: <GroupsOutlinedIcon />,
      color: "primary.dark",
      background: "primary.light",
      path: `/projects/${projectId}/teams`,
    },
    {
      title: "Tasks",
      description:
        "Create, assign, update, and track tasks.",
      icon: <AssignmentOutlinedIcon />,
      color: "secondary.main",
      background: "secondary.light",
      path: `/projects/${projectId}/tasks`,
    },
    {
      title: "Kanban",
      description:
        "Visualize task progress across workflow stages.",
      icon: <ViewKanbanOutlinedIcon />,
      color: "success.main",
      background: "success.light",
      path: `/projects/${projectId}/kanban`,
    },
    {
      title: "Sprints",
      description:
        "Plan sprint work and track sprint progress.",
      icon: <SprintIcon />,
      color: "warning.main",
      background: "warning.light",
      path: `/projects/${projectId}/sprints`,
    },
    {
      title: "Activity",
      description:
        "View project changes and development activity.",
      icon: <TimelineOutlinedIcon />,
      color: "info.main",
      background: "info.light",
      path: `/projects/${projectId}/activity`,
    },
  ];

  const aiFeatures = [
    {
      title: "Break Down Requirements",
      description:
        "Convert software requirements into actionable development tasks using AI.",
      icon: <AccountTreeOutlinedIcon />,
      color: "primary.dark",
      background: "primary.light",
      path: `/projects/${projectId}/ai/task-breakdown`,
    },
    {
      title: "Summarize Progress",
      description:
        "Generate an AI summary of project progress, completed work, and pending tasks.",
      icon: <SummarizeOutlinedIcon />,
      color: "secondary.main",
      background: "secondary.light",
      path: `/projects/${projectId}/ai/summary`,
    },
    {
      title: "Analyze Risks",
      description:
        "Identify potential project risks based on tasks, progress, and project activity.",
      icon: <WarningAmberOutlinedIcon />,
      color: "warning.main",
      background: "warning.light",
      path: `/projects/${projectId}/ai/risks`,
    },
    {
      title: "Ask About Project",
      description:
        "Ask questions about the project and get AI-powered answers using project data.",
      icon: <QuestionAnswerOutlinedIcon />,
      color: "info.main",
      background: "info.light",
      path: `/projects/${projectId}/ai/assistant`,
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
          py: { xs: 3, md: 5 },
        }}
      >
        <PageContainer>
          <Card>
            <CardContent
              sx={{
                py: 10,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">
                Loading project workspace...
              </Typography>
            </CardContent>
          </Card>
        </PageContainer>
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
          py: { xs: 3, md: 5 },
        }}
      >
        <PageContainer>
          <Alert
            severity="error"
            sx={{
              mb: 3,
            }}
          >
            {error || "Project not found."}
          </Alert>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/projects")}
          >
            Back to Projects
          </Button>
        </PageContainer>
      </Box>
    );
  }

  const statusConfig = getStatusConfig(project.status);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: { xs: 3, md: 5 },
      }}
    >
      <PageContainer>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Button
            onClick={() => navigate("/dashboard")}
            sx={{
              minWidth: 0,
              p: 0,
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
                backgroundColor: "transparent",
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
              "&:hover": {
                color: "primary.main",
                backgroundColor: "transparent",
              },
            }}
          >
            Projects
          </Button>

          <Typography
            color="text.primary"
            fontWeight={600}
          >
            {project.name}
          </Typography>
        </Breadcrumbs>

        {/* Project Header */}
        <Card
          sx={{
            mb: 3,
            overflow: "hidden",
          }}
        >
          <Box
            sx={(theme) => ({
              height: 6,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            })}
          />

          <CardContent
            sx={{
              p: { xs: 2.5, md: 4 },
            }}
          >
            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              justifyContent="space-between"
              alignItems={{
                xs: "flex-start",
                md: "center",
              }}
              gap={3}
            >
              {/* Project identity */}
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 62,
                    height: 62,
                    flexShrink: 0,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "primary.light",
                    color: "primary.dark",
                  }}
                >
                  <FolderOutlinedIcon
                    sx={{ fontSize: 32 }}
                  />
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                      }}
                    >
                      {project.name}
                    </Typography>

                    <Chip
                      label={statusConfig.label}
                      color={statusConfig.color}
                      size="small"
                    />
                  </Stack>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 0.8,
                      maxWidth: 700,
                    }}
                  >
                    {project.description ||
                      "No project description provided."}
                  </Typography>
                </Box>
              </Stack>

              {/* Back button */}
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/projects")}
                sx={{
                  flexShrink: 0,
                }}
              >
                Back to Projects
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Overview heading */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            Project Overview
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Monitor your project and quickly access development
            tools.
          </Typography>
        </Box>

        {/* Statistics */}
        <Grid
          container
          spacing={2.5}
          sx={{ mb: 4 }}
        >
          {/* Teams */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Teams
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{ mt: 0.5 }}
                    >
                      {teams.length}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "primary.light",
                      color: "primary.dark",
                    }}
                  >
                    <GroupsOutlinedIcon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Tasks */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Total Tasks
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{ mt: 0.5 }}
                    >
                      {tasks.length}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "secondary.light",
                      color: "secondary.main",
                    }}
                  >
                    <AssignmentOutlinedIcon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* In Progress */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      In Progress
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{ mt: 0.5 }}
                    >
                      {inProgressTasks}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "warning.light",
                      color: "warning.main",
                    }}
                  >
                    <ViewKanbanOutlinedIcon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Completed */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Completed
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{ mt: 0.5 }}
                    >
                      {completedTasks}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "success.light",
                      color: "success.main",
                    }}
                  >
                    <AssignmentOutlinedIcon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Task Snapshot */}
        <Card sx={{ mb: 3 }}>
          <CardContent
            sx={{
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
              gap={2}
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography variant="h6">
                  Task Snapshot
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Current distribution of tasks across workflow
                  stages.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                onClick={() =>
                  navigate(`/projects/${projectId}/tasks`)
                }
              >
                View Tasks
              </Button>
            </Stack>

            <Grid container spacing={2}>
              {/* TODO */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: "primary.light",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    To Do
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 0.5,
                      color: "primary.dark",
                    }}
                  >
                    {todoTasks}
                  </Typography>
                </Box>
              </Grid>

              {/* In Progress */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: "warning.light",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    In Progress
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 0.5,
                      color: "warning.main",
                    }}
                  >
                    {inProgressTasks}
                  </Typography>
                </Box>
              </Grid>

              {/* Completed */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: "success.light",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Completed
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 0.5,
                      color: "success.main",
                    }}
                  >
                    {completedTasks}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Project Tools */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            Project Workspace
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Access the tools and features available for this
            project.
          </Typography>
        </Box>

        <Grid
          container
          spacing={3}
          sx={{ mb: 5 }}
        >
          {navigationItems.map((item) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={item.title}
            >
              <Card
                onClick={() => navigate(item.path)}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                    borderColor: "primary.light",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    height: "100%",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        flexShrink: 0,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: item.background,
                        color: item.color,
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          mb: 0.5,
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {item.description}
                      </Typography>

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        sx={{
                          mt: 1.5,
                          color: item.color,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                        >
                          Open
                        </Typography>

                        <ArrowForwardIcon
                          sx={{ fontSize: 17 }}
                        />
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* AI Features */}
        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <AutoAwesomeIcon
              sx={{
                color: "secondary.main",
              }}
            />

            <Typography variant="h6">
              AI Features
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Use AI to automate project planning, understand
            progress, identify risks, and interact with project
            information.
          </Typography>
        </Box>

        <Grid
          container
          spacing={3}
          sx={{ mb: 5 }}
        >
          {aiFeatures.map((item) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              key={item.title}
            >
              <Card
                onClick={() => navigate(item.path)}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                    borderColor: "secondary.light",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    height: "100%",
                  }}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: item.background,
                        color: item.color,
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          mb: 0.75,
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {item.description}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{
                        color: item.color,
                        mt: "auto",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        Open
                      </Typography>

                      <ArrowForwardIcon
                        sx={{ fontSize: 17 }}
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Project Details */}
        <Card>
          <CardContent
            sx={{
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Project Details
            </Typography>

            <Divider sx={{ mb: 2.5 }} />

            <Grid container spacing={3}>
              {/* Project ID */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Project ID
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 0.5,
                    fontWeight: 600,
                  }}
                >
                  #{project.id}
                </Typography>
              </Grid>

              {/* Created */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Created
                </Typography>

                <Stack
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                  sx={{ mt: 0.5 }}
                >
                  <CalendarTodayOutlinedIcon
                    sx={{
                      fontSize: 17,
                      color: "text.secondary",
                    }}
                  />

                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600 }}
                  >
                    {project.created_at
                      ? new Date(
                          project.created_at
                        ).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </Stack>
              </Grid>

              {/* Tasks */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Tasks
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 0.5,
                    fontWeight: 600,
                  }}
                >
                  {tasks.length}
                </Typography>
              </Grid>

              {/* Teams */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Teams
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 0.5,
                    fontWeight: 600,
                  }}
                >
                  {teams.length}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </PageContainer>
    </Box>
  );
}

export default ProjectWorkspace;