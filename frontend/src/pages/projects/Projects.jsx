import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import projectAPI from "../../api/projectAPI";

import {
  setLoading,
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setError,
} from "../../features/projects/projectSlice";

import PageContainer from "../../components/layout/PageContainer";

function Projects() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const projects = useSelector(
    (state) => state.projects.projects
  );

  const loading = useSelector(
    (state) => state.projects.loading
  );

  const error = useSelector(
    (state) => state.projects.error
  );

  // =========================================================
  // CREATE PROJECT STATE
  // =========================================================

  const [createDialogOpen, setCreateDialogOpen] =
    useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  // =========================================================
  // EDIT PROJECT STATE
  // =========================================================

  const [editDialogOpen, setEditDialogOpen] =
    useState(false);

  const [editingProjectId, setEditingProjectId] =
    useState(null);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] =
    useState("");

  const [editStatus, setEditStatus] =
    useState("ACTIVE");

  // =========================================================
  // LOAD PROJECTS
  // =========================================================

  useEffect(() => {
    const loadProjects = async () => {
      dispatch(setLoading(true));

      try {
        const data = await projectAPI.getProjects();

        dispatch(setProjects(data));
      } catch (error) {
        console.error(
          "Failed to load projects:",
          error
        );

        dispatch(
          setError("Failed to load projects")
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadProjects();
  }, [dispatch]);

  // =========================================================
  // RESET CREATE FORM
  // =========================================================

  const resetCreateForm = () => {
    setName("");
    setDescription("");
    setStatus("ACTIVE");
  };

  // =========================================================
  // CREATE PROJECT
  // =========================================================

  const handleCreateProject = async () => {
    if (!name.trim()) {
      return;
    }

    try {
      const project =
        await projectAPI.createProject({
          name: name.trim(),
          description: description.trim(),
          status,
        });

      dispatch(addProject(project));

      resetCreateForm();
      setCreateDialogOpen(false);
    } catch (error) {
      console.error(
        "Failed to create project:",
        error
      );

      dispatch(
        setError("Failed to create project")
      );
    }
  };

  // =========================================================
  // OPEN EDIT DIALOG
  // =========================================================

  const handleStartEdit = (project) => {
    setEditingProjectId(project.id);
    setEditName(project.name);
    setEditDescription(
      project.description || ""
    );
    setEditStatus(project.status);

    setEditDialogOpen(true);
  };

  // =========================================================
  // CLOSE EDIT DIALOG
  // =========================================================

  const handleCloseEdit = () => {
    setEditDialogOpen(false);

    setEditingProjectId(null);
    setEditName("");
    setEditDescription("");
    setEditStatus("ACTIVE");
  };

  // =========================================================
  // UPDATE PROJECT
  // =========================================================

  const handleUpdateProject = async () => {
    if (!editName.trim()) {
      return;
    }

    try {
      const updatedProject =
        await projectAPI.updateProject(
          editingProjectId,
          {
            name: editName.trim(),
            description:
              editDescription.trim(),
            status: editStatus,
          }
        );

      dispatch(
        updateProject(updatedProject)
      );

      handleCloseEdit();
    } catch (error) {
      console.error(
        "Failed to update project:",
        error
      );

      dispatch(
        setError("Failed to update project")
      );
    }
  };

  // =========================================================
  // DELETE PROJECT
  // =========================================================

  const handleDeleteProject = async (
    projectId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await projectAPI.deleteProject(
        projectId
      );

      dispatch(removeProject(projectId));
    } catch (error) {
      console.error(
        "Failed to delete project:",
        error
      );

      dispatch(
        setError("Failed to delete project")
      );
    }
  };

  // =========================================================
  // OPEN PROJECT WORKSPACE
  // =========================================================

  const handleOpenProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // =========================================================
  // STATUS CONFIGURATION
  // =========================================================

  const getStatusConfig = (
    projectStatus
  ) => {
    if (projectStatus === "ACTIVE") {
      return {
        label: "Active",
        color: "success",
        icon: (
          <CheckCircleIcon fontSize="small" />
        ),
      };
    }

    if (projectStatus === "COMPLETED") {
      return {
        label: "Completed",
        color: "primary",
        icon: (
          <CheckCircleIcon fontSize="small" />
        ),
      };
    }

    return {
      label: "Archived",
      color: "default",
      icon: (
        <ArchiveOutlinedIcon fontSize="small" />
      ),
    };
  };

  // =========================================================
  // PROJECT COUNTS
  // =========================================================

  const activeProjects =
    projects.filter(
      (project) =>
        project.status === "ACTIVE"
    ).length;

  const completedProjects =
    projects.filter(
      (project) =>
        project.status === "COMPLETED"
    ).length;

  const archivedProjects =
    projects.filter(
      (project) =>
        project.status === "ARCHIVED"
    ).length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8faff 0%, #f4f6fa 100%)",
      }}
    >
      <PageContainer>
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <Breadcrumbs
          separator={
            <NavigateNextIcon fontSize="small" />
          }
          aria-label="breadcrumb"
          sx={{
            mb: 3,
            "& .MuiBreadcrumbs-separator": {
              color: "#9ca3af",
            },
          }}
        >
          <Link
            component="button"
            underline="hover"
            onClick={() =>
              navigate("/dashboard")
            }
            sx={{
              border: 0,
              background: "none",
              cursor: "pointer",
              color: "#4f46a5",
              fontSize: "0.95rem",
              fontWeight: 600,
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            Dashboard
          </Link>

          <Typography
            sx={{
              color: "#6b7280",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            Projects
          </Typography>
        </Breadcrumbs>

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1.75}
              alignItems="center"
              sx={{ mb: 1.25 }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #1976d2, #5e35b1)",
                  color: "white",
                  boxShadow:
                    "0 6px 18px rgba(25,118,210,0.25)",
                  flexShrink: 0,
                }}
              >
                <FolderOutlinedIcon
                  sx={{ fontSize: 27 }}
                />
              </Box>

              <Typography
                variant="h4"
                sx={{
                  color: "#172033",
                  fontWeight: 750,
                  fontSize: {
                    xs: "1.9rem",
                    md: "2.2rem",
                    lg: "2.4rem",
                  },
                  letterSpacing: "-0.6px",
                }}
              >
                Projects
              </Typography>
            </Stack>

            <Typography
              color="text.secondary"
              sx={{
                maxWidth: 700,
                fontSize: {
                  xs: "0.98rem",
                  md: "1.05rem",
                },
                lineHeight: 1.7,
              }}
            >
              Plan, organize, and track your
              software projects from one place.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() =>
              setCreateDialogOpen(true)
            }
            sx={{
              textTransform: "none",
              fontWeight: 650,
              borderRadius: 2.5,
              px: 3,
              py: 1.4,
              fontSize: "0.98rem",
              boxShadow:
                "0 6px 16px rgba(25,118,210,0.25)",
            }}
          >
            New Project
          </Button>
        </Box>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <Grid
          container
          spacing={2.5}
          sx={{ mb: 4 }}
        >
          {/* Total Projects */}

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
              }}
            >
              <CardContent
                sx={{ p: 2.75 }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize:
                          "0.95rem",
                      }}
                    >
                      Total Projects
                    </Typography>

                    <Typography
                      fontWeight={750}
                      sx={{
                        mt: 0.5,
                        fontSize:
                          "2rem",
                        color:
                          "#172033",
                      }}
                    >
                      {projects.length}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      backgroundColor:
                        "#e8f1ff",
                      color:
                        "#1976d2",
                    }}
                  >
                    <FolderOutlinedIcon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Active */}

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
              }}
            >
              <CardContent
                sx={{ p: 2.75 }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize:
                          "0.95rem",
                      }}
                    >
                      Active
                    </Typography>

                    <Typography
                      fontWeight={750}
                      sx={{
                        mt: 0.5,
                        fontSize:
                          "2rem",
                        color:
                          "#172033",
                      }}
                    >
                      {activeProjects}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      backgroundColor:
                        "#e9f7ef",
                      color:
                        "#2e7d32",
                    }}
                  >
                    <CheckCircleIcon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Completed */}

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
              }}
            >
              <CardContent
                sx={{ p: 2.75 }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize:
                          "0.95rem",
                      }}
                    >
                      Completed
                    </Typography>

                    <Typography
                      fontWeight={750}
                      sx={{
                        mt: 0.5,
                        fontSize:
                          "2rem",
                        color:
                          "#172033",
                      }}
                    >
                      {completedProjects}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      backgroundColor:
                        "#eeeafd",
                      color:
                        "#5e35b1",
                    }}
                  >
                    <CheckCircleIcon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Archived */}

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
              }}
            >
              <CardContent
                sx={{ p: 2.75 }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize:
                          "0.95rem",
                      }}
                    >
                      Archived
                    </Typography>

                    <Typography
                      fontWeight={750}
                      sx={{
                        mt: 0.5,
                        fontSize:
                          "2rem",
                        color:
                          "#172033",
                      }}
                    >
                      {archivedProjects}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      backgroundColor:
                        "#f1f2f4",
                      color:
                        "#616161",
                    }}
                  >
                    <ArchiveOutlinedIcon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
            onClose={() =>
              dispatch(setError(null))
            }
          >
            {error}
          </Alert>
        )}

        {/* =================================================
            PROJECT SECTION HEADER
        ================================================= */}

        <Box sx={{ mb: 2.5 }}>
          <Typography
            fontWeight={700}
            sx={{
              color: "#172033",
              fontSize: {
                xs: "1.2rem",
                md: "1.3rem",
              },
            }}
          >
            Your Projects
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.35,
              fontSize: "0.98rem",
            }}
          >
            {projects.length === 0
              ? "You haven't created any projects yet."
              : `${projects.length} project${
                  projects.length === 1
                    ? ""
                    : "s"
                } in your workspace`}
          </Typography>
        </Box>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <Card>
            <CardContent
              sx={{
                py: 8,
                textAlign: "center",
              }}
            >
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: "1rem",
                }}
              >
                Loading projects...
              </Typography>
            </CardContent>
          </Card>
        ) : projects.length === 0 ? (
          /* =================================================
             EMPTY STATE
          ================================================= */

          <Card
            sx={{
              borderRadius: 4,
            }}
          >
            <CardContent
              sx={{
                py: 9,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #e8f1ff, #eeeafd)",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  mx: "auto",
                  mb: 3,
                  color: "#3f51b5",
                }}
              >
                <FolderOutlinedIcon
                  sx={{ fontSize: 36 }}
                />
              </Box>

              <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
                sx={{
                  fontSize: {
                    xs: "1.4rem",
                    md: "1.55rem",
                  },
                }}
              >
                No projects yet
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  maxWidth: 520,
                  mx: "auto",
                  mb: 3.5,
                  fontSize: "1rem",
                  lineHeight: 1.7,
                }}
              >
                Create your first project
                to start organizing tasks,
                teams, sprints, and
                development work.
              </Typography>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  setCreateDialogOpen(true)
                }
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  fontSize: "0.95rem",
                }}
              >
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* =================================================
             PROJECT CARDS
          ================================================= */

          <Grid
            container
            spacing={{
              xs: 2,
              md: 2.5,
              lg: 3,
            }}
          >
            {projects.map((project) => {
              const statusConfig =
                getStatusConfig(
                  project.status
                );

              return (
                <Grid
                  key={project.id}
                  size={{
                    xs: 12,
                    sm: 6,
                    lg: 4,
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      minHeight: 265,
                      display: "flex",
                      flexDirection:
                        "column",
                      borderRadius: 3.5,
                      transition:
                        "all 0.25s ease",
                      "&:hover": {
                        transform:
                          "translateY(-5px)",
                        boxShadow:
                          "0 12px 30px rgba(30,50,90,0.12)",
                        borderColor:
                          "#c8d5e8",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: {
                          xs: 2.5,
                          md: 3,
                        },
                        flex: 1,
                        display: "flex",
                        flexDirection:
                          "column",
                      }}
                    >
                      {/* Card top */}

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            flexShrink: 0,
                            borderRadius: 2.5,
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            background:
                              "linear-gradient(135deg, #e9f2ff, #eeeafd)",
                            color:
                              "#3949ab",
                          }}
                        >
                          <FolderOutlinedIcon />
                        </Box>

                        <Chip
                          label={
                            statusConfig.label
                          }
                          color={
                            statusConfig.color
                          }
                          icon={
                            statusConfig.icon
                          }
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize:
                              "0.8rem",
                          }}
                        />
                      </Stack>

                      {/* Project name */}

                      <Typography
                        fontWeight={700}
                        sx={{
                          mt: 2.5,
                          color:
                            "#172033",
                          fontSize: {
                            xs: "1.1rem",
                            md: "1.2rem",
                          },
                          wordBreak:
                            "break-word",
                        }}
                      >
                        {project.name}
                      </Typography>

                      {/* Description */}

                      <Typography
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          lineHeight: 1.7,
                          fontSize:
                            "0.98rem",
                          display:
                            "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient:
                            "vertical",
                          overflow: "hidden",
                          minHeight: 76,
                        }}
                      >
                        {project.description ||
                          "No description provided for this project."}
                      </Typography>

                      <Box
                        sx={{ flex: 1 }}
                      />

                      <Divider
                        sx={{
                          my: 2.5,
                        }}
                      />

                      {/* Metadata + Actions */}

                      <Stack
                        direction={{
                          xs: "column",
                          sm: "row",
                        }}
                        justifyContent="space-between"
                        alignItems={{
                          xs: "stretch",
                          sm: "center",
                        }}
                        spacing={1.5}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <CalendarTodayOutlinedIcon
                            sx={{
                              fontSize: 16,
                              color:
                                "text.secondary",
                            }}
                          />

                          <Typography
                            color="text.secondary"
                            sx={{
                              fontSize:
                                "0.82rem",
                            }}
                          >
                            Project #
                            {project.id}
                          </Typography>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          justifyContent={{
                            xs: "flex-end",
                            sm: "initial",
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              handleOpenProject(
                                project.id
                              )
                            }
                            sx={{
                              textTransform:
                                "none",
                              borderRadius: 2,
                              fontWeight: 600,
                              fontSize:
                                "0.84rem",
                            }}
                          >
                            Open Project
                          </Button>

                          <IconButton
                            size="small"
                            onClick={() =>
                              handleStartEdit(
                                project
                              )
                            }
                            title="Edit project"
                            sx={{
                              color:
                                "#1976d2",
                              backgroundColor:
                                "#edf5ff",
                              "&:hover": {
                                backgroundColor:
                                  "#dcecff",
                              },
                            }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDeleteProject(
                                project.id
                              )
                            }
                            title="Delete project"
                            sx={{
                              ml: 0.5,
                              color:
                                "#d32f2f",
                              backgroundColor:
                                "#fff0f0",
                              "&:hover": {
                                backgroundColor:
                                  "#ffe0e0",
                              },
                            }}
                          >
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </PageContainer>

      {/* =====================================================
          CREATE PROJECT DIALOG
      ===================================================== */}

      <Dialog
        open={createDialogOpen}
        onClose={() => {
          resetCreateForm();
          setCreateDialogOpen(false);
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 3,
            fontWeight: 700,
            fontSize: "1.35rem",
          }}
        >
          Create New Project
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          <Typography
            color="text.secondary"
            sx={{
              mb: 2.5,
              fontSize: "0.95rem",
            }}
          >
            Add the basic information
            for your new project.
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              label="Project Name"
              placeholder="e.g. AI Project Management Platform"
              fullWidth
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              autoFocus
            />

            <TextField
              label="Description"
              placeholder="Describe what this project is about..."
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
            />

            <FormControl fullWidth>
              <InputLabel>
                Status
              </InputLabel>

              <Select
                value={status}
                label="Status"
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
              >
                <MenuItem value="ACTIVE">
                  Active
                </MenuItem>

                <MenuItem value="COMPLETED">
                  Completed
                </MenuItem>

                <MenuItem value="ARCHIVED">
                  Archived
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2,
          }}
        >
          <Button
            onClick={() => {
              resetCreateForm();
              setCreateDialogOpen(false);
            }}
            sx={{
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateProject}
            disabled={!name.trim()}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
            }}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          EDIT PROJECT DIALOG
      ===================================================== */}

      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 3,
            fontWeight: 700,
            fontSize: "1.35rem",
          }}
        >
          Edit Project
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          <Typography
            color="text.secondary"
            sx={{
              mb: 2.5,
              fontSize: "0.95rem",
            }}
          >
            Update the project
            information below.
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              label="Project Name"
              fullWidth
              value={editName}
              onChange={(event) =>
                setEditName(
                  event.target.value
                )
              }
              autoFocus
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={editDescription}
              onChange={(event) =>
                setEditDescription(
                  event.target.value
                )
              }
            />

            <FormControl fullWidth>
              <InputLabel>
                Status
              </InputLabel>

              <Select
                value={editStatus}
                label="Status"
                onChange={(event) =>
                  setEditStatus(
                    event.target.value
                  )
                }
              >
                <MenuItem value="ACTIVE">
                  Active
                </MenuItem>

                <MenuItem value="COMPLETED">
                  Completed
                </MenuItem>

                <MenuItem value="ARCHIVED">
                  Archived
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2,
          }}
        >
          <Button
            onClick={handleCloseEdit}
            sx={{
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdateProject}
            disabled={!editName.trim()}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Projects;