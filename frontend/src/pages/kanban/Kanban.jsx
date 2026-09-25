import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import taskAPI from "../../features/tasks/taskAPI";
import PageContainer from "../../components/layout/PageContainer";

function Kanban() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await taskAPI.getProjectTasks(projectId);
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);

        setError(
          err.response?.data?.detail || "Failed to load project tasks."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const columns = useMemo(() => {
    return {
      TODO: tasks.filter((task) => task.status === "TODO"),
      IN_PROGRESS: tasks.filter(
        (task) => task.status === "IN_PROGRESS"
      ),
      DONE: tasks.filter((task) => task.status === "DONE"),
    };
  }, [tasks]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "error";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "success";
      default:
        return "default";
    }
  };

  const getColumnTitle = (status) => {
    switch (status) {
      case "TODO":
        return "To Do";
      case "IN_PROGRESS":
        return "In Progress";
      case "DONE":
        return "Done";
      default:
        return status;
    }
  };

  const handleDragStart = (event, taskId) => {
    setDraggedTaskId(taskId);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(taskId));
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (event, newStatus) => {
    event.preventDefault();

    const taskId = Number(event.dataTransfer.getData("text/plain"));

    if (!taskId) {
      return;
    }

    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      return;
    }

    if (task.status === newStatus) {
      setDraggedTaskId(null);
      return;
    }

    const previousTasks = [...tasks];

    // Optimistic UI update
    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === taskId
          ? { ...item, status: newStatus }
          : item
      )
    );

    setDraggedTaskId(null);
    setUpdatingTaskId(taskId);
    setError("");

    try {
      await taskAPI.updateTask(taskId, {
        sprint_id: task.sprint_id,
        assigned_to: task.assigned_to,
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        story_points: task.story_points,
        due_date: task.due_date,
      });
    } catch (err) {
      console.error("Failed to update task status:", err);

      // Roll back optimistic update
      setTasks(previousTasks);

      setError(
        err.response?.data?.detail ||
          "Failed to update task status. The task was moved back."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const renderTaskCard = (task) => {
    const isDragging = draggedTaskId === task.id;
    const isUpdating = updatingTaskId === task.id;

    return (
      <Card
        key={task.id}
        draggable={!isUpdating}
        onDragStart={(event) => handleDragStart(event, task.id)}
        onDragEnd={handleDragEnd}
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          mb: 1.5,
          backgroundColor: "background.paper",
          cursor: isUpdating ? "default" : "grab",
          opacity: isDragging ? 0.45 : 1,
          transition: "opacity 0.2s, box-shadow 0.2s",
          "&:hover": {
            boxShadow: isUpdating ? "none" : 3,
          },
          "&:active": {
            cursor: isUpdating ? "default" : "grabbing",
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: 1 }}
            >
              {task.title}
            </Typography>

            {isUpdating && <CircularProgress size={18} />}
          </Stack>

          {task.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {task.description}
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              mb: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={task.priority}
              size="small"
              color={getPriorityColor(task.priority)}
            />

            {task.story_points !== null &&
              task.story_points !== undefined && (
                <Chip
                  label={`${task.story_points} pts`}
                  size="small"
                  variant="outlined"
                />
              )}
          </Stack>

          {task.due_date && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Due: {task.due_date}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

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
            <Box>
              <Typography
                variant="h5"
                color="text.primary"
                fontWeight={700}
              >
                Kanban Board
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Drag and drop tasks to update their status.
              </Typography>
            </Box>

            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/projects/${projectId}`)}
              variant="outlined"
            >
              Project Workspace
            </Button>
          </Stack>
        </PageContainer>
      </Box>

      {/* Main Content */}
      <PageContainer sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

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
        ) : (
          <>
            {/* Board Summary */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Chip
                icon={<AssignmentOutlinedIcon />}
                label={`${tasks.length} Total Tasks`}
                variant="outlined"
              />

              <Chip
                label={`${columns.TODO.length} To Do`}
                variant="outlined"
              />

              <Chip
                label={`${columns.IN_PROGRESS.length} In Progress`}
                variant="outlined"
              />

              <Chip
                label={`${columns.DONE.length} Done`}
                variant="outlined"
              />
            </Stack>

            {/* Kanban Columns */}
            <Grid container spacing={2}>
              {Object.entries(columns).map(
                ([status, columnTasks]) => (
                  <Grid
                    key={status}
                    size={{ xs: 12, md: 4 }}
                  >
                    <Card
                      elevation={0}
                      onDragOver={handleDragOver}
                      onDrop={(event) =>
                        handleDrop(event, status)
                      }
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 3,
                        height: "100%",
                        minHeight: 400,
                        backgroundColor: "action.hover",
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Stack
                          direction="row"
                          sx={{
                            mb: 2,
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={700}
                          >
                            {getColumnTitle(status)}
                          </Typography>

                          <Chip
                            label={columnTasks.length}
                            size="small"
                          />
                        </Stack>

                        <Divider sx={{ mb: 2 }} />

                        {columnTasks.length === 0 ? (
                          <Box
                            sx={{
                              py: 5,
                              textAlign: "center",
                              color: "text.secondary",
                              border: "2px dashed",
                              borderColor: "divider",
                              borderRadius: 2,
                            }}
                          >
                            <AssignmentOutlinedIcon
                              sx={{
                                fontSize: 40,
                                opacity: 0.5,
                                mb: 1,
                              }}
                            />

                            <Typography variant="body2">
                              Drop tasks here
                            </Typography>
                          </Box>
                        ) : (
                          columnTasks.map(renderTaskCard)
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          </>
        )}
      </PageContainer>
    </Box>
  );
}

export default Kanban;