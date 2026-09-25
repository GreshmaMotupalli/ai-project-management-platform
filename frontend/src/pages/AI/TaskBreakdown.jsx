import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import aiAPI from "../../api/aiAPI";
import taskAPI from "../../features/tasks/taskAPI";
import PageContainer from "../../components/layout/PageContainer";

function TaskBreakdown() {
  const { projectId } = useParams();

  const [requirement, setRequirement] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [creatingTasks, setCreatingTasks] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleGenerate = async () => {
    if (!projectId) {
      setError("Project could not be identified.");
      setSuccessMessage("");
      return;
    }

    if (!requirement.trim()) {
      setError("Please enter a software requirement.");
      setSuccessMessage("");
      return;
    }

    setError("");
    setSuccessMessage("");
    setTasks([]);
    setSelectedTasks([]);
    setLoading(true);

    try {
      const response = await aiAPI.generateTaskBreakdown(
        requirement.trim()
      );

      setTasks(response.tasks || []);
    } catch (err) {
      console.error("Failed to generate tasks:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to generate tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelection = (index) => {
    setSelectedTasks((current) => {
      if (current.includes(index)) {
        return current.filter((taskIndex) => taskIndex !== index);
      }

      return [...current, index];
    });
  };

  const handleCreateSelectedTasks = async () => {
    if (!projectId || selectedTasks.length === 0) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setCreatingTasks(true);

    try {
      const tasksToCreate = selectedTasks.map(
        (index) => tasks[index]
      );

      for (const task of tasksToCreate) {
        await taskAPI.createTask({
          project_id: Number(projectId),
          title: task.title,
          description: task.description,
          status: "TODO",
          priority: "MEDIUM",
        });
      }

      setSuccessMessage(
        `${tasksToCreate.length} task${
          tasksToCreate.length > 1 ? "s" : ""
        } created successfully.`
      );

      setTasks([]);
      setSelectedTasks([]);
    } catch (err) {
      console.error("Failed to create tasks:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to create selected tasks. Please try again."
      );
    } finally {
      setCreatingTasks(false);
    }
  };

  return (
    <PageContainer sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            AI Task Breakdown
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Describe a software requirement and let AI break it
            into actionable development tasks for this project.
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Software Requirement"
                placeholder="Example: Users should be able to create projects and assign tasks to team members."
                multiline
                minRows={5}
                fullWidth
                value={requirement}
                onChange={(event) => {
                  setRequirement(event.target.value);
                  setError("");
                  setSuccessMessage("");
                }}
                disabled={loading || creatingTasks}
              />

              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert severity="success">
                  {successMessage}
                </Alert>
              )}

              <Box>
                <Button
                  variant="contained"
                  onClick={handleGenerate}
                  disabled={loading || creatingTasks}
                >
                  {loading ? (
                    <>
                      <CircularProgress
                        size={20}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />
                      Generating...
                    </>
                  ) : (
                    "Generate Tasks"
                  )}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {tasks.length > 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Generated Tasks
            </Typography>

            <Stack spacing={2}>
              {tasks.map((task, index) => (
                <Card key={`${task.title}-${index}`}>
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                    >
                      <Checkbox
                        checked={selectedTasks.includes(index)}
                        onChange={() =>
                          handleTaskSelection(index)
                        }
                        disabled={creatingTasks}
                      />

                      <Box sx={{ pt: 0.5 }}>
                        <Typography variant="h6">
                          {index + 1}. {task.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {task.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Button
              variant="contained"
              sx={{ mt: 3 }}
              disabled={
                selectedTasks.length === 0 ||
                creatingTasks
              }
              onClick={handleCreateSelectedTasks}
            >
              {creatingTasks ? (
                <>
                  <CircularProgress
                    size={20}
                    color="inherit"
                    sx={{ mr: 1 }}
                  />
                  Creating Tasks...
                </>
              ) : (
                "Create Selected Tasks"
              )}
            </Button>
          </Box>
        )}
      </Stack>
    </PageContainer>
  );
}

export default TaskBreakdown;