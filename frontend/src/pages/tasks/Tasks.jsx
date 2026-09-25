import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  createTask,
  deleteTask,
  fetchProjectTasks,
  updateTask,
} from "../../features/tasks/taskSlice";

import TaskComments from "../../components/comments/TaskComments";
import projectAPI from "../../api/projectAPI";
import teamAPI from "../../features/teams/teamAPI";
import PageContainer from "../../components/layout/PageContainer";

import {
  Alert,
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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

const STATUS_OPTIONS = [
  {
    value: "TODO",
    label: "To Do",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
  },
  {
    value: "DONE",
    label: "Done",
  },
];

const PRIORITY_OPTIONS = [
  {
    value: "LOW",
    label: "Low",
  },
  {
    value: "MEDIUM",
    label: "Medium",
  },
  {
    value: "HIGH",
    label: "High",
  },
  {
    value: "CRITICAL",
    label: "Critical",
  },
];

const initialForm = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  assigned_to: "",
  story_points: "",
  due_date: "",
};

function Tasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    tasks = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.tasks);

  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);

  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  /* =========================
     LOAD PROJECT + TASKS + MEMBERS
  ========================= */

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

    const loadMembers = async () => {
      try {
        setMembersLoading(true);

        const teams = await teamAPI.getProjectTeams(
          Number(projectId)
        );

        const teamList = Array.isArray(teams)
          ? teams
          : [];

        const memberResponses = await Promise.all(
          teamList
            .filter((team) => team?.id)
            .map((team) =>
              teamAPI.getMembers(team.id)
            )
        );

        const allMembers = memberResponses.flatMap(
          (response) =>
            Array.isArray(response)
              ? response
              : []
        );

        /*
         * Normalize different possible backend
         * member response shapes.
         */
        const normalizedMembers =
  allMembers
    .map((member) => {
      const user = member?.user;

      // Always prefer the actual users.id.
      // team_members.id is NOT the same as users.id.
      const id =
        member?.user_id ??
        user?.id ??
        member?.id;

      const name =
        user?.name ||
        member?.name ||
        user?.full_name ||
        member?.full_name ||
        user?.email ||
        member?.email ||
        `User ${id}`;

      if (!id) {
        return null;
      }

      return {
        id: Number(id),
        name,
      };
    })
    .filter(Boolean);
        /*
         * Remove duplicate users in case the
         * project has multiple teams.
         */
        const uniqueMembers = Array.from(
          new Map(
            normalizedMembers.map((member) => [
              member.id,
              member,
            ])
          ).values()
        );

        setMembers(uniqueMembers);
      } catch (memberError) {
        console.error(
          "Failed to load project members:",
          memberError
        );

        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };

    loadProject();
    loadMembers();

    dispatch(
      fetchProjectTasks(Number(projectId))
    );
  }, [dispatch, projectId]);

  /* =========================
     SUMMARY
  ========================= */

  const summary = useMemo(() => {
    return {
      total: tasks.length,

      todo: tasks.filter(
        (task) => task.status === "TODO"
      ).length,

      inProgress: tasks.filter(
        (task) => task.status === "IN_PROGRESS"
      ).length,

      done: tasks.filter(
        (task) => task.status === "DONE"
      ).length,
    };
  }, [tasks]);

  /* =========================
     DIALOG HANDLERS
  ========================= */

  const handleOpenCreate = () => {
    setEditingTask(null);

    setFormData({
      ...initialForm,
    });

    setDialogOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);

    setFormData({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "TODO",
      priority: task.priority || "MEDIUM",
      assigned_to: task.assigned_to ?? "",
      story_points: task.story_points ?? "",
      due_date: task.due_date || "",
    });

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);

    setFormData({
      ...initialForm,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================
     CREATE / UPDATE
  ========================= */

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      return;
    }

    const taskData = {
      project_id: Number(projectId),

      sprint_id: null,

      assigned_to:
        formData.assigned_to === ""
          ? null
          : Number(formData.assigned_to),

      title: formData.title.trim(),

      description:
        formData.description.trim() || null,

      status: formData.status,

      priority: formData.priority,

      story_points:
        formData.story_points === ""
          ? null
          : Number(formData.story_points),

      due_date:
        formData.due_date || null,
    };

    if (editingTask) {
      await dispatch(
        updateTask({
          taskId: editingTask.id,
          taskData,
        })
      );
    } else {
      await dispatch(createTask(taskData));
    }

    handleCloseDialog();
  };

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    await dispatch(deleteTask(taskId));
  };

  /* =========================
     HELPERS
  ========================= */

  const getStatusLabel = (status) => {
    const option = STATUS_OPTIONS.find(
      (item) => item.value === status
    );

    return option?.label || status;
  };

  const getPriorityLabel = (priority) => {
    const option = PRIORITY_OPTIONS.find(
      (item) => item.value === priority
    );

    return option?.label || priority;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DONE":
        return "success";

      case "IN_PROGRESS":
        return "info";

      case "TODO":
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return "error";

      case "HIGH":
        return "warning";

      case "MEDIUM":
        return "info";

      case "LOW":
      default:
        return "default";
    }
  };

  const getMemberName = (userId) => {
    if (!userId) {
      return "Unassigned";
    }

    const member = members.find(
      (item) => Number(item.id) === Number(userId)
    );

    return member?.name || `User ${userId}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "No due date";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================
     RENDER
  ========================= */

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
            Tasks
          </Typography>
        </Breadcrumbs>

        {/* =========================
            PAGE HEADER
        ========================= */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2.5,
              sm: 3,
              md: 4,
            },
            mb: 3,
            border: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, #ffffff 0%, #f7f9ff 100%)",
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
            spacing={3}
          >
            <Stack
              direction="row"
              spacing={{
                xs: 1.5,
                sm: 2,
              }}
              alignItems="center"
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "primary.light",
                  color: "primary.dark",
                  flexShrink: 0,
                }}
              >
                <AssignmentOutlinedIcon
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
                  PROJECT TASKS
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mt: -0.5,
                    wordBreak: "break-word",
                    fontSize: {
                      xs: "1.65rem",
                      sm: "2rem",
                    },
                  }}
                >
                  {projectLoading
                    ? "Project Tasks"
                    : `${project?.name || "Project"} — Tasks`}
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    maxWidth: 650,
                  }}
                >
                  Plan, assign and track
                  development work.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{
                width: {
                  xs: "100%",
                  md: "auto",
                },
                flexShrink: 0,
                py: 1.2,
              }}
            >
              Create Task
            </Button>
          </Stack>
        </Paper>

        {/* =========================
            SUMMARY CARDS
        ========================= */}

        <Grid
          container
          spacing={2}
          sx={{
            mb: 4,
          }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                transition:
                  "border-color 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  borderColor: "primary.light",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.75}
                alignItems="center"
              >
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
                    flexShrink: 0,
                  }}
                >
                  <AssignmentOutlinedIcon />
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
                    sx={{
                      fontWeight: 700,
                      mt: 0.25,
                    }}
                  >
                    {summary.total}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                transition:
                  "border-color 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  borderColor: "warning.light",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.75}
                alignItems="center"
              >
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
                    flexShrink: 0,
                  }}
                >
                  <HourglassEmptyIcon />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    To Do
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mt: 0.25,
                    }}
                  >
                    {summary.todo}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                transition:
                  "border-color 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  borderColor: "info.light",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.75}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "info.light",
                    color: "info.main",
                    flexShrink: 0,
                  }}
                >
                  <PriorityHighIcon />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    In Progress
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mt: 0.25,
                    }}
                  >
                    {summary.inProgress}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                transition:
                  "border-color 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  borderColor: "success.light",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.75}
                alignItems="center"
              >
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
                    flexShrink: 0,
                  }}
                >
                  <CheckCircleIcon />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Done
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mt: 0.25,
                    }}
                  >
                    {summary.done}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
            }}
          >
            {error}
          </Alert>
        )}

        {/* =========================
            LOADING
        ========================= */}

        {loading && tasks.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 4,
                md: 6,
              },
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CircularProgress
              size={30}
              sx={{
                mb: 2,
              }}
            />

            <Typography
              variant="body1"
              color="text.secondary"
            >
              Loading tasks...
            </Typography>
          </Paper>
        )}

        {/* =========================
            EMPTY STATE
        ========================= */}

        {!loading && tasks.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 4,
                md: 7,
              },
              textAlign: "center",
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                width: 76,
                height: 76,
                mx: "auto",
                mb: 2,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "primary.light",
                color: "primary.dark",
              }}
            >
              <AssignmentOutlinedIcon
                sx={{
                  fontSize: 38,
                }}
              />
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 0.75,
              }}
            >
              No tasks yet
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                maxWidth: 460,
                mx: "auto",
                mb: 3,
              }}
            >
              Create tasks to break your
              project work into manageable
              pieces.
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Create Your First Task
            </Button>
          </Paper>
        )}

        {/* =========================
            TASK LIST
        ========================= */}

        {tasks.length > 0 && (
          <Box>
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
              sx={{
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  All Tasks
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Track work across the project.
                </Typography>
              </Box>

              <Chip
                label={`${tasks.length} ${
                  tasks.length === 1
                    ? "Task"
                    : "Tasks"
                }`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>

            <Grid
              container
              spacing={2.5}
            >
              {tasks.map((task) => (
                <Grid
                  key={task.id}
                  size={{
                    xs: 12,
                    sm: 6,
                    lg: 4,
                  }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition:
                        "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow:
                          "0 10px 28px rgba(30, 50, 90, 0.10)",
                        borderColor: "primary.light",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: {
                          xs: 2.25,
                          sm: 2.5,
                        },
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      {/* CARD HEADER */}

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              wordBreak: "break-word",
                            }}
                          >
                            {task.title}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Task #{task.id}
                          </Typography>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={0.25}
                          sx={{
                            flexShrink: 0,
                          }}
                        >
                          <IconButton
                            size="small"
                            aria-label="Edit task"
                            onClick={() =>
                              handleOpenEdit(task)
                            }
                            sx={{
                              color: "text.secondary",
                              "&:hover": {
                                color: "primary.main",
                                backgroundColor:
                                  "primary.light",
                              },
                            }}
                          >
                            <EditOutlinedIcon
                              fontSize="small"
                            />
                          </IconButton>

                          <IconButton
                            size="small"
                            aria-label="Delete task"
                            onClick={() =>
                              handleDelete(task.id)
                            }
                            sx={{
                              color: "text.secondary",
                              "&:hover": {
                                color: "error.main",
                                backgroundColor:
                                  "error.light",
                              },
                            }}
                          >
                            <DeleteOutlinedIcon
                              fontSize="small"
                            />
                          </IconButton>
                        </Stack>
                      </Stack>

                      {/* DESCRIPTION */}

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1.2,
                          minHeight: 42,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {task.description ||
                          "No description provided."}
                      </Typography>

                      <Divider
                        sx={{
                          my: 2,
                        }}
                      />

                      {/* STATUS + PRIORITY */}

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={getStatusLabel(
                            task.status
                          )}
                          color={getStatusColor(
                            task.status
                          )}
                          size="small"
                          sx={{
                            fontWeight: 700,
                          }}
                        />

                        <Chip
                          label={`Priority: ${getPriorityLabel(
                            task.priority
                          )}`}
                          color={getPriorityColor(
                            task.priority
                          )}
                          size="small"
                          variant={
                            task.priority === "LOW"
                              ? "outlined"
                              : "filled"
                          }
                          sx={{
                            fontWeight: 700,
                          }}
                        />
                      </Stack>

                      {/* METADATA */}

                      <Stack
                        spacing={1.5}
                        sx={{
                          mt: 2,
                        }}
                      >
                        {/* ASSIGNED USER */}

                        <Box
                          sx={{
                            p: 1.25,
                            borderRadius: 2,
                            backgroundColor:
                              "primary.light",
                            border: "1px solid",
                            borderColor:
                              "rgba(25, 118, 210, 0.16)",
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={2}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <GroupsOutlinedIcon
                                sx={{
                                  fontSize: 19,
                                  color:
                                    "primary.dark",
                                }}
                              />

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Assigned to
                              </Typography>
                            </Stack>

                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="primary.dark"
                              sx={{
                                textAlign: "right",
                              }}
                            >
                              {getMemberName(
                                task.assigned_to
                              )}
                            </Typography>
                          </Stack>
                        </Box>

                        {/* STORY POINTS */}

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Story Points
                          </Typography>

                          <Chip
                            label={
                              task.story_points ?? "—"
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              minWidth: 35,
                              fontWeight: 700,
                            }}
                          />
                        </Stack>

                        {/* DUE DATE */}

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={2}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <CalendarTodayOutlinedIcon
                              sx={{
                                fontSize: 17,
                                color:
                                  "text.secondary",
                              }}
                            />

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Due date
                            </Typography>
                          </Stack>

                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              textAlign: "right",
                            }}
                          >
                            {formatDate(
                              task.due_date
                            )}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* COMMENTS */}

                      <TaskComments
                        taskId={task.id}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* =========================
            CREATE / EDIT DIALOG
        ========================= */}

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              pb: 1,
            }}
          >
            {editingTask
              ? "Edit Task"
              : "Create New Task"}
          </DialogTitle>

          <DialogContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2.5,
              }}
            >
              {editingTask
                ? "Update the task details below."
                : "Add a task and define its priority, status and ownership."}
            </Typography>

            <Stack spacing={2}>
              <TextField
                autoFocus
                fullWidth
                label="Task Title"
                name="title"
                placeholder="e.g. Implement authentication API"
                value={formData.title}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                placeholder="Describe what needs to be done..."
                value={formData.description}
                onChange={handleChange}
              />

              <Grid
                container
                spacing={2}
              >
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel>
                      Status
                    </InputLabel>

                    <Select
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      {STATUS_OPTIONS.map(
                        (option) => (
                          <MenuItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel>
                      Priority
                    </InputLabel>

                    <Select
                      label="Priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      {PRIORITY_OPTIONS.map(
                        (option) => (
                          <MenuItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid
                container
                spacing={2}
              >
                {/* ASSIGNED USER */}

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel>
                      Assigned To
                    </InputLabel>

                    <Select
                      label="Assigned To"
                      name="assigned_to"
                      value={formData.assigned_to}
                      onChange={handleChange}
                      disabled={membersLoading}
                    >
                      <MenuItem value="">
                        Unassigned
                      </MenuItem>

                      {members.map((member) => (
                        <MenuItem
                          key={member.id}
                          value={member.id}
                        >
                          {member.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {!membersLoading &&
                    members.length === 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          mt: 0.75,
                        }}
                      >
                        No project team members
                        available.
                      </Typography>
                    )}
                </Grid>

                {/* STORY POINTS */}

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    type="number"
                    label="Story Points"
                    name="story_points"
                    placeholder="5"
                    slotProps={{
                      htmlInput: {
                        min: 0,
                      },
                    }}
                    value={formData.story_points}
                    onChange={handleChange}
                    helperText="Relative effort"
                  />
                </Grid>

                {/* DUE DATE */}

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    type="date"
                    label="Due Date"
                    name="due_date"
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    value={formData.due_date}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              {/* STORY POINT EXPLANATION */}

              <Alert
                severity="info"
                variant="outlined"
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  Story Points estimate relative
                  task effort and complexity.
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  They are not hours. For example,
                  1 is a very small task, 3 is
                  small-to-moderate, and 5 or 8
                  represents more complex work.
                </Typography>
              </Alert>
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              px: {
                xs: 2,
                sm: 3,
              },
              pb: 2.5,
            }}
          >
            <Button
              onClick={handleCloseDialog}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                loading ||
                !formData.title.trim()
              }
            >
              {editingTask
                ? "Save Changes"
                : "Create Task"}
            </Button>
          </DialogActions>
        </Dialog>
      </PageContainer>
    </Box>
  );
}

export default Tasks;