import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

import projectAPI from "../../api/projectAPI";
import dashboardAPI from "../../api/dashboardAPI";

import {
  setProjects,
  setLoading,
  setError,
} from "../../features/projects/projectSlice";

import { logout } from "../../features/auth/authSlice";

import PageContainer from "../../components/layout/PageContainer";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const projects = useSelector(
    (state) => state.projects.projects
  );
  const loading = useSelector(
    (state) => state.projects.loading
  );
  const error = useSelector(
    (state) => state.projects.error
  );

  const [fetchError, setFetchError] = useState("");
  const [dashboardSummary, setDashboardSummary] =
    useState(null);
  const [summaryLoading, setSummaryLoading] =
    useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      dispatch(setLoading(true));
      setSummaryLoading(true);
      setFetchError("");

      try {
        const [projectsData, summaryData] =
          await Promise.all([
            projectAPI.getProjects(),
            dashboardAPI.getSummary(),
          ]);

        dispatch(setProjects(projectsData));
        setDashboardSummary(summaryData);
      } catch (err) {
        console.error(
          "Failed to fetch dashboard data:",
          err
        );

        setFetchError(
          err.response?.data?.detail ||
            "Failed to load dashboard data."
        );

        dispatch(
          setError("Failed to load dashboard data.")
        );
      } finally {
        dispatch(setLoading(false));
        setSummaryLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort(
        (a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
      )
      .slice(0, 4);
  }, [projects]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    dispatch(logout());
    navigate("/login");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "success";

      case "COMPLETED":
        return "primary";

      case "ARCHIVED":
        return "default";

      default:
        return "warning";
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <PageContainer
          sx={{
            py: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Brand */}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FolderOutlinedIcon />
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    lineHeight: 1.2,
                  }}
                >
                  AI Project Manager
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.3,
                    fontSize: "0.85rem",
                  }}
                >
                  Project Management & Development Platform
                </Typography>
              </Box>
            </Stack>

            {/* User */}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              {user && (
                <Box
                  sx={{
                    textAlign: "right",
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                    }}
                  >
                    {user.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {user.role}
                  </Typography>
                </Box>
              )}

              <IconButton
                onClick={handleLogout}
                title="Logout"
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  color: "text.secondary",

                  "&:hover": {
                    bgcolor: "action.hover",
                    color: "text.primary",
                  },
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </PageContainer>
      </Box>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <PageContainer
        sx={{
          py: { xs: 2.5, md: 3.5 },
        }}
      >
        <Grid container spacing={3}>
          {/* =================================================
              SIDEBAR
          ================================================== */}
          <Grid size={{ xs: 12, md: 2.5 }}>
            <Card
              elevation={0}
              sx={{
                position: {
                  md: "sticky",
                },
                top: 20,
              }}
            >
              <CardContent
                sx={{
                  p: 1.25,
                }}
              >
                <Stack spacing={0.5}>
                  {/* Dashboard */}
                  <Button
                    fullWidth
                    startIcon={
                      <DashboardOutlinedIcon />
                    }
                    sx={{
                      justifyContent: "flex-start",
                      px: 2,
                      py: 1.25,
                      borderRadius: 2,
                      bgcolor: "primary.light",
                      color: "primary.main",
                      fontWeight: 700,

                      "&:hover": {
                        bgcolor: "primary.light",
                      },
                    }}
                  >
                    Dashboard
                  </Button>

                  {/* Projects */}
                  <Button
                    fullWidth
                    startIcon={
                      <FolderOutlinedIcon />
                    }
                    onClick={() =>
                      navigate("/projects")
                    }
                    sx={{
                      justifyContent: "flex-start",
                      px: 2,
                      py: 1.25,
                      borderRadius: 2,
                      color: "text.secondary",
                      fontWeight: 600,

                      "&:hover": {
                        bgcolor: "action.hover",
                        color: "text.primary",
                      },
                    }}
                  >
                    Projects
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* =================================================
              MAIN DASHBOARD
          ================================================== */}
          <Grid size={{ xs: 12, md: 9.5 }}>
            {/* =================================================
                WELCOME SECTION
            ================================================== */}
            <Box sx={{ mb: 3.5 }}>
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
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      mb: 0.75,
                      fontSize: {
                        xs: "1.8rem",
                        md: "2.1rem",
                      },
                    }}
                  >
                    Welcome back
                    {user?.name
                      ? `, ${user.name}`
                      : ""}
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                  >
                    Manage and monitor your software
                    projects from one place.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    navigate("/projects")
                  }
                  sx={{
                    minHeight: 44,
                    px: 2.5,
                  }}
                >
                  Manage Projects
                </Button>
              </Stack>
            </Box>

            {/* =================================================
                ERROR
            ================================================== */}
            {(fetchError || error) && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {fetchError || error}
              </Alert>
            )}

            {/* =================================================
                PROJECT STATISTICS
            ================================================== */}
            <Grid
              container
              spacing={2.5}
              sx={{ mb: 3.5 }}
            >
              {/* Total Projects */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 3,
                }}
              >
                <Card elevation={0}>
                  <CardContent
                    sx={{
                      p: 2.5,
                      "&:last-child": {
                        pb: 2.5,
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 500,
                            mb: 0.75,
                          }}
                        >
                          Total Projects
                        </Typography>

                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                          }}
                        >
                          {summaryLoading
                            ? "..."
                            : dashboardSummary?.total_projects ??
                              0}
                        </Typography>
                      </Box>

                      <FolderOutlinedIcon
                        sx={{
                          fontSize: 38,
                          color: "primary.main",
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Active Projects */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 3,
                }}
              >
                <Card elevation={0}>
                  <CardContent
                    sx={{
                      p: 2.5,
                      "&:last-child": {
                        pb: 2.5,
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 500,
                            mb: 0.75,
                          }}
                        >
                          Active Projects
                        </Typography>

                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                          }}
                        >
                          {summaryLoading
                            ? "..."
                            : dashboardSummary?.active_projects ??
                              0}
                        </Typography>
                      </Box>

                      <AccessTimeOutlinedIcon
                        sx={{
                          fontSize: 38,
                          color: "success.main",
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Completed Projects */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 3,
                }}
              >
                <Card elevation={0}>
                  <CardContent
                    sx={{
                      p: 2.5,
                      "&:last-child": {
                        pb: 2.5,
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 500,
                            mb: 0.75,
                          }}
                        >
                          Completed
                        </Typography>

                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                          }}
                        >
                          {summaryLoading
                            ? "..."
                            : dashboardSummary?.completed_projects ??
                              0}
                        </Typography>
                      </Box>

                      <CheckCircleOutlinedIcon
                        sx={{
                          fontSize: 38,
                          color: "primary.main",
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Archived Projects */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 3,
                }}
              >
                <Card elevation={0}>
                  <CardContent
                    sx={{
                      p: 2.5,
                      "&:last-child": {
                        pb: 2.5,
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 500,
                            mb: 0.75,
                          }}
                        >
                          Archived
                        </Typography>

                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                          }}
                        >
                          {summaryLoading
                            ? "..."
                            : dashboardSummary?.archived_projects ??
                              0}
                        </Typography>
                      </Box>

                      <ArchiveOutlinedIcon
                        sx={{
                          fontSize: 38,
                          color: "text.secondary",
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* =================================================
                TASK OVERVIEW
            ================================================== */}
            <Card
              elevation={0}
              sx={{ mb: 3.5 }}
            >
              <CardContent
                sx={{
                  p: { xs: 2.5, md: 3 },
                }}
              >
                <Box sx={{ mb: 2.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    Task Overview
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Current task distribution across
                    your projects.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {[
                    {
                      label: "Total Tasks",
                      value:
                        dashboardSummary?.total_tasks ??
                        0,
                    },
                    {
                      label: "To Do",
                      value:
                        dashboardSummary?.todo_tasks ??
                        0,
                    },
                    {
                      label: "In Progress",
                      value:
                        dashboardSummary?.in_progress_tasks ??
                        0,
                    },
                    {
                      label: "Completed",
                      value:
                        dashboardSummary?.completed_tasks ??
                        0,
                    },
                  ].map((item) => (
                    <Grid
                      key={item.label}
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                      }}
                    >
                      <Box
                        sx={{
                          p: 2.25,
                          borderRadius: 2,
                          bgcolor:
                            "primary.light",
                          border: 1,
                          borderColor:
                            "rgba(25, 118, 210, 0.08)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 500,
                          }}
                        >
                          {item.label}
                        </Typography>

                        <Typography
                          variant="h5"
                          sx={{
                            mt: 0.75,
                            fontWeight: 700,
                            color: "text.primary",
                          }}
                        >
                          {summaryLoading
                            ? "..."
                            : item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* =================================================
                SPRINT OVERVIEW
            ================================================== */}
            <Card
              elevation={0}
              sx={{ mb: 3.5 }}
            >
              <CardContent
                sx={{
                  p: { xs: 2.5, md: 3 },
                }}
              >
                <Box sx={{ mb: 2.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    Sprint Overview
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Current sprint distribution across
                    your projects.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {[
                    {
                      label: "Total Sprints",
                      value:
                        dashboardSummary?.total_sprints ??
                        0,
                    },
                    {
                      label: "Planned",
                      value:
                        dashboardSummary?.planned_sprints ??
                        0,
                    },
                    {
                      label: "Active",
                      value:
                        dashboardSummary?.active_sprints ??
                        0,
                    },
                    {
                      label: "Completed",
                      value:
                        dashboardSummary?.completed_sprints ??
                        0,
                    },
                  ].map((item) => (
                    <Grid
                      key={item.label}
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                      }}
                    >
                      <Box
                        sx={{
                          p: 2.25,
                          borderRadius: 2,
                          bgcolor:
                            "secondary.light",
                          border: 1,
                          borderColor:
                            "rgba(94, 53, 177, 0.08)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 500,
                          }}
                        >
                          {item.label}
                        </Typography>

                        <Typography
                          variant="h5"
                          sx={{
                            mt: 0.75,
                            fontWeight: 700,
                            color: "text.primary",
                          }}
                        >
                          {summaryLoading
                            ? "..."
                            : item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* =================================================
                RECENT PROJECTS
            ================================================== */}
            <Card
              elevation={0}
              sx={{ mb: 3.5 }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box
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
                    spacing={1.5}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                        }}
                      >
                        Recent Projects
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Open a project to manage its
                        teams, tasks, sprints, and AI
                        features.
                      </Typography>
                    </Box>

                    <Button
                      endIcon={
                        <ArrowForwardIcon />
                      }
                      onClick={() =>
                        navigate("/projects")
                      }
                      sx={{
                        color: "primary.main",
                      }}
                    >
                      View All
                    </Button>
                  </Stack>
                </Box>

                <Divider />

                {loading ? (
                  <Box sx={{ p: 3 }}>
                    <Typography
                      color="text.secondary"
                    >
                      Loading projects...
                    </Typography>
                  </Box>
                ) : recentProjects.length === 0 ? (
                  <Box
                    sx={{
                      p: 5,
                      textAlign: "center",
                    }}
                  >
                    <FolderOutlinedIcon
                      sx={{
                        fontSize: 48,
                        color: "text.disabled",
                        mb: 1,
                      }}
                    />

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      No projects yet
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Create your first project to
                      get started.
                    </Typography>

                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() =>
                        navigate("/projects")
                      }
                    >
                      Create Project
                    </Button>
                  </Box>
                ) : (
                  <Stack
                    divider={<Divider />}
                  >
                    {recentProjects.map(
                      (project) => (
                        <Box
                          key={project.id}
                          sx={{
                            px: {
                              xs: 2.5,
                              md: 3,
                            },
                            py: 2.25,
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap: 2,

                            "&:hover": {
                              bgcolor:
                                "action.hover",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color:
                                  "text.primary",
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {project.name}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {project.description ||
                                "No description provided"}
                            </Typography>
                          </Box>

                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ flexShrink: 0 }}
                          >
                            <Chip
                              label={
                                project.status
                              }
                              size="small"
                              color={getStatusColor(
                                project.status
                              )}
                            />

                            <Button
                              variant="outlined"
                              endIcon={
                                <ArrowForwardIcon />
                              }
                              onClick={() =>
                                navigate(
                                  `/projects/${project.id}`
                                )
                              }
                              sx={{
                                display: {
                                  xs: "none",
                                  sm: "inline-flex",
                                },
                              }}
                            >
                              Open Project
                            </Button>

                            <Button
                              variant="outlined"
                              onClick={() =>
                                navigate(
                                  `/projects/${project.id}`
                                )
                              }
                              sx={{
                                display: {
                                  xs: "inline-flex",
                                  sm: "none",
                                },
                                minWidth: "auto",
                              }}
                            >
                              Open
                            </Button>
                          </Stack>
                        </Box>
                      )
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* =================================================
                PROJECT WORKFLOW
            ================================================== */}
            <Card elevation={0}>
              <CardContent
                sx={{
                  p: { xs: 2.5, md: 3 },
                }}
              >
                <Box sx={{ mb: 2.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    Project Workflow
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Select a project to access your
                    development management features.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {/* Step 1 */}
                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        p: 2.5,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 2.5,
                        bgcolor:
                          "background.default",
                        transition:
                          "all 0.2s ease",

                        "&:hover": {
                          borderColor:
                            "primary.main",
                          bgcolor:
                            "primary.light",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          textAlign: "center",
                          fontSize: "1rem",
                        }}
                      >
                        1. Select Project
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1.25,
                          lineHeight: 1.6,
                          textAlign: "center",
                        }}
                      >
                        Choose a project from your
                        project list or recent
                        projects.
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Step 2 */}
                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        p: 2.5,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 2.5,
                        bgcolor:
                          "background.default",
                        transition:
                          "all 0.2s ease",

                        "&:hover": {
                          borderColor:
                            "primary.main",
                          bgcolor:
                            "primary.light",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          textAlign: "center",
                          fontSize: "1rem",
                        }}
                      >
                        2. Manage Development
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1.25,
                          lineHeight: 1.6,
                          textAlign: "center",
                        }}
                      >
                        Manage teams, tasks,
                        sprints, Kanban boards,
                        and project activity.
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Step 3 */}
                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        p: 2.5,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 2.5,
                        bgcolor:
                          "background.default",
                        transition:
                          "all 0.2s ease",

                        "&:hover": {
                          borderColor:
                            "primary.main",
                          bgcolor:
                            "primary.light",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          textAlign: "center",
                          fontSize: "1rem",
                        }}
                      >
                        3. Use AI Features
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1.25,
                          lineHeight: 1.6,
                          textAlign: "center",
                        }}
                      >
                        Break down requirements,
                        summarize progress,
                        analyze risks, and ask
                        questions about the
                        project.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </PageContainer>
    </Box>
  );
}

export default Dashboard;