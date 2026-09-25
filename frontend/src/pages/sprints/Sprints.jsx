import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Button,
  Breadcrumbs,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SprintIcon from "@mui/icons-material/TrackChanges";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import sprintAPI from "../../features/sprints/sprintAPI";
import projectAPI from "../../api/projectAPI";

import {
  setSprints,
  addSprint,
  updateSprint,
  removeSprint,
  setLoading,
  setError,
  clearError,
} from "../../features/sprints/sprintSlice";

import PageContainer from "../../components/layout/PageContainer";

function Sprints() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sprints, loading, error } = useSelector(
    (state) => state.sprints
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);

  const [project, setProject] = useState(null);
const [projectLoading, setProjectLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
    status: "PLANNED",
  });

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

  useEffect(() => {
    const loadSprints = async () => {
      dispatch(setLoading(true));
      dispatch(clearError());

      try {
        const data = await sprintAPI.getProjectSprints(projectId);

        dispatch(setSprints(data));
      } catch (err) {
        console.error("Failed to load sprints:", err);

        dispatch(
          setError(
            err.response?.data?.detail ||
              "Failed to load sprints"
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadSprints();
  }, [dispatch, projectId]);

  const handleOpenCreate = () => {
    setEditingSprint(null);

    setFormData({
      name: "",
      goal: "",
      start_date: "",
      end_date: "",
      status: "PLANNED",
    });

    dispatch(clearError());
    setDialogOpen(true);
  };

  const handleOpenEdit = (sprint) => {
    setEditingSprint(sprint);

    setFormData({
      name: sprint.name,
      goal: sprint.goal || "",
      start_date: sprint.start_date,
      end_date: sprint.end_date,
      status: sprint.status,
    });

    dispatch(clearError());
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSprint(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    dispatch(clearError());

    if (!formData.name.trim()) {
      dispatch(setError("Sprint name is required"));
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      dispatch(
        setError("Start date and end date are required")
      );
      return;
    }

    if (formData.start_date > formData.end_date) {
      dispatch(
        setError("Start date cannot be after end date")
      );
      return;
    }

    try {
      if (editingSprint) {
        const updatedSprint = await sprintAPI.updateSprint(
          editingSprint.id,
          formData
        );

        dispatch(updateSprint(updatedSprint));
      } else {
        const newSprint = await sprintAPI.createSprint({
          project_id: Number(projectId),
          ...formData,
        });

        dispatch(addSprint(newSprint));
      }

      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save sprint:", err);

      dispatch(
        setError(
          err.response?.data?.detail ||
            "Failed to save sprint"
        )
      );
    }
  };

  const handleDelete = async (sprintId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sprint?"
    );

    if (!confirmed) {
      return;
    }

    dispatch(clearError());

    try {
      await sprintAPI.deleteSprint(sprintId);

      dispatch(removeSprint(sprintId));
    } catch (err) {
      console.error("Failed to delete sprint:", err);

      dispatch(
        setError(
          err.response?.data?.detail ||
            "Failed to delete sprint"
        )
      );
    }
  };

  const getStatusColor = (status) => {
    if (status === "ACTIVE") {
      return "success";
    }

    if (status === "COMPLETED") {
      return "info";
    }

    if (status === "CANCELLED") {
      return "error";
    }

    return "default";
  };

  const totalSprints = sprints.length;

  const plannedSprints = sprints.filter(
    (sprint) => sprint.status === "PLANNED"
  ).length;

  const activeSprints = sprints.filter(
    (sprint) => sprint.status === "ACTIVE"
  ).length;

  const completedSprints = sprints.filter(
    (sprint) => sprint.status === "COMPLETED"
  ).length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          py: 2,
        }}
      >
        <PageContainer>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: {
                xs: "stretch",
                sm: "center",
              },
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() =>
                navigate(`/projects/${projectId}`)
              }
              sx={{
                alignSelf: {
                  xs: "flex-start",
                  sm: "auto",
                },
              }}
            >
              Project Workspace
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Create Sprint
            </Button>
          </Stack>
        </PageContainer>
      </Box>

      <PageContainer sx={{ py: 3 }}>
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
    Sprints
  </Typography>
</Breadcrumbs>
        {/* Page Header */}
        <Card
          sx={{
            mb: 3,
            background:
              "linear-gradient(110deg, #ffffff 0%, #f4f6fd 100%)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{
                justifyContent: "space-between",
                alignItems: {
                  xs: "flex-start",
                  md: "center",
                },
              }}
            >
              <Stack
                direction="row"
                spacing={3}
                sx={{
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 3,
                    flexShrink: 0,
                  }}
                >
                  <SprintIcon fontSize="large" />
                </Box>

                <Box>
                  <Typography
                    variant="h4"
                    color="text.primary"
                  >
                    Project Sprints
                  </Typography>

                  <Typography
                    sx={{ mt: 0.5 }}
                    color="text.secondary"
                  >
                    Plan and manage project development
                    sprints.
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Grid
          container
          spacing={2}
          sx={{ mb: 4 }}
        >
          {/* Total */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: "secondary.light",
                      color: "secondary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SprintIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Total
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={500}
                    >
                      {totalSprints}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Planned */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                      color: "text.secondary",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ScheduleIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Planned
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={500}
                    >
                      {plannedSprints}
                    </Typography>
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
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: "success.light",
                      color: "success.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PlayArrowIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Active
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={500}
                    >
                      {activeSprints}
                    </Typography>
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
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: "success.light",
                      color: "success.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircleIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Completed
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={500}
                    >
                      {completedSprints}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Section Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            mb: 2.5,
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
          }}
        >
          <Box>
            <Typography
              variant="h5"
              color="text.primary"
            >
              All Sprints
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Plan and track development cycles.
            </Typography>
          </Box>

          <Chip
            label={`${totalSprints} Sprint${
              totalSprints !== 1 ? "s" : ""
            }`}
            size="small"
            color="secondary"
          />
        </Stack>

        {/* Error */}
        {error && (
          <Card
            sx={{
              mb: 3,
              border: 1,
              borderColor: "error.light",
              boxShadow: "none",
            }}
          >
            <CardContent>
              <Typography color="error">
                {error}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : sprints.length === 0 ? (
          <Card>
            <CardContent
              sx={{
                textAlign: "center",
                py: 8,
              }}
            >
              <SprintIcon
                sx={{
                  fontSize: 50,
                  color: "primary.main",
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                fontWeight={600}
              >
                No sprints yet
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1, mb: 3 }}
              >
                Create your first sprint to start
                planning project work.
              </Typography>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
              >
                Create Sprint
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {sprints.map((sprint) => (
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4,
                }}
                key={sprint.id}
              >
                <Card sx={{ height: "100%" }}>
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Sprint title */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={500}
                          sx={{
                            wordBreak: "break-word",
                          }}
                        >
                          {sprint.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Sprint #{sprint.id}
                        </Typography>
                      </Box>

                      <Chip
                        label={sprint.status}
                        size="small"
                        color={getStatusColor(
                          sprint.status
                        )}
                        sx={{
                          fontWeight: 700,
                        }}
                      />
                    </Stack>

                    {/* Goal */}
                    <Typography
                      sx={{
                        mt: 2,
                        minHeight: 50,
                      }}
                      color="text.secondary"
                    >
                      {sprint.goal ||
                        "No sprint goal provided."}
                    </Typography>

                    {/* Divider */}
                    <Box
                      sx={{
                        borderTop: 1,
                        borderColor: "divider",
                        my: 2,
                      }}
                    />

                    {/* Timeline */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        mb: 1.5,
                        alignItems: "center",
                      }}
                    >
                      <CalendarTodayIcon
                        sx={{
                          fontSize: 18,
                          color: "text.secondary",
                        }}
                      />

                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        Sprint Timeline
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Start Date
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {sprint.start_date}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          End Date
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {sprint.end_date}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Actions */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 3 }}
                    >
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() =>
                          handleOpenEdit(sprint)
                        }
                      >
                        Edit Sprint
                      </Button>

                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDelete(sprint.id)
                        }
                        sx={{
                          border: 1,
                          borderColor: "error.light",
                          borderRadius: 2,
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create / Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingSprint
              ? "Edit Sprint"
              : "Create Sprint"}
          </DialogTitle>

          <DialogContent>
            <Stack
              spacing={3}
              sx={{ mt: 1 }}
            >
              <TextField
                label="Sprint Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Sprint Goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                placeholder="What should this sprint accomplish?"
              />

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
              >
                <TextField
                  label="Start Date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  fullWidth
                  required
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />

                <TextField
                  label="End Date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  fullWidth
                  required
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Stack>

              <TextField
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="PLANNED">
                  PLANNED
                </MenuItem>

                <MenuItem value="ACTIVE">
                  ACTIVE
                </MenuItem>

                <MenuItem value="COMPLETED">
                  COMPLETED
                </MenuItem>

                <MenuItem value="CANCELLED">
                  CANCELLED
                </MenuItem>
              </TextField>
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              pb: 2.5,
            }}
          >
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
            >
              {editingSprint
                ? "Update Sprint"
                : "Create Sprint"}
            </Button>
          </DialogActions>
        </Dialog>
      </PageContainer>
    </Box>
  );
}

export default Sprints;