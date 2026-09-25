import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  addTeamMember,
  createTeam,
  deleteTeam,
  fetchProjectTeams,
  fetchTeamMembers,
  fetchUsers,
  removeTeamMember,
  updateTeam,
} from "../../features/teams/teamSlice";

import projectAPI from "../../api/projectAPI";

import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import PageContainer from "../../components/layout/PageContainer";

function Teams() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

const {
  teams = [],
  members = {},
  users = [],
  loading = false,
  error = null,
} = useSelector((state) => state.teams);

  /* -----------------------------
     PROJECT STATE
  ----------------------------- */

  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);

  /* -----------------------------
     TEAM DIALOG STATE
  ----------------------------- */

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamName, setTeamName] = useState("");

  /* -----------------------------
     MEMBER DIALOG STATE
  ----------------------------- */

  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  /* -----------------------------
     USER SEARCH STATE
  ----------------------------- */

  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchLoading, setUserSearchLoading] =
    useState(false);

  /* =============================
     FETCH PROJECT + TEAMS
  ============================= */

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

    dispatch(
      fetchProjectTeams(Number(projectId))
    );
  }, [dispatch, projectId]);

  /* =============================
     FETCH MEMBERS FOR ALL TEAMS
  ============================= */

  useEffect(() => {
    if (!teams.length) {
      return;
    }

    teams.forEach((team) => {
      dispatch(fetchTeamMembers(team.id));
    });
  }, [dispatch, teams]);

  /* =============================
     TEAM HANDLERS
  ============================= */

  const handleOpenCreate = () => {
    setEditingTeam(null);
    setTeamName("");
    setOpenDialog(true);
  };

  const handleOpenEdit = (team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTeam(null);
    setTeamName("");
  };

  const handleSubmit = async () => {
    const trimmedName = teamName.trim();

    if (!trimmedName) {
      return;
    }

    if (editingTeam) {
      await dispatch(
        updateTeam({
          teamId: editingTeam.id,
          teamData: {
            name: trimmedName,
          },
        })
      );
    } else {
      await dispatch(
        createTeam({
          name: trimmedName,
          project_id: Number(projectId),
        })
      );
    }

    handleCloseDialog();
  };

  const handleDelete = async (teamId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this team?"
    );

    if (!confirmed) {
      return;
    }

    await dispatch(deleteTeam(teamId));
  };

  /* =============================
     MEMBER HANDLERS
  ============================= */

  const handleOpenMembers = async (team) => {
    setSelectedTeam(team);
    setMemberDialogOpen(true);

    setUserSearch("");
    setSelectedUser(null);

    await dispatch(fetchTeamMembers(team.id));
  };

  const handleCloseMembers = () => {
    setMemberDialogOpen(false);
    setSelectedTeam(null);
    setUserSearch("");
    setSelectedUser(null);
  };

  const handleUserSearch = async (event) => {
    const value = event.target.value;

    setUserSearch(value);
    setSelectedUser(null);

    if (!value.trim()) {
      return;
    }

    try {
      setUserSearchLoading(true);

      await dispatch(
        fetchUsers(value.trim())
      ).unwrap();
    } catch (searchError) {
      console.error(
        "Failed to search users:",
        searchError
      );
    } finally {
      setUserSearchLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUserSearch(user.name);
  };

  const handleAddMember = async () => {
    if (!selectedUser || !selectedTeam) {
      return;
    }

    const result = await dispatch(
      addTeamMember({
        teamId: selectedTeam.id,
        userId: selectedUser.id,
      })
    );

    if (!result.error) {
      setUserSearch("");
      setSelectedUser(null);

      await dispatch(
        fetchTeamMembers(selectedTeam.id)
      );
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedTeam) {
      return;
    }

    await dispatch(
      removeTeamMember({
        teamId: selectedTeam.id,
        userId,
      })
    );
  };

  /* =============================
     HELPERS
  ============================= */

  const getInitial = (name) => {
    if (!name) {
      return "?";
    }

    return name.charAt(0).toUpperCase();
  };

  const getTeamMembers = (teamId) => {
    return members[teamId] || [];
  };

  const getMemberNames = (teamId) => {
    const teamMembers = getTeamMembers(teamId);

    if (teamMembers.length === 0) {
      return "";
    }

    const visibleNames = teamMembers
      .slice(0, 2)
      .map((member) => member.name)
      .join(", ");

    if (teamMembers.length > 2) {
      return `${visibleNames} +${
        teamMembers.length - 2
      } more`;
    }

    return visibleNames;
  };

  const currentMembers =
  selectedTeam && members
    ? members[selectedTeam.id] || []
    : [];

  const availableUsers = (Array.isArray(users) ? users : []).filter(
  (user) =>
    !currentMembers.some(
      (member) => member.user_id === user.id
    )
);

  /* =============================
     RENDER
  ============================= */

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
            Teams
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
              minWidth={0}
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
                <GroupsOutlinedIcon
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
                  PROJECT TEAMS
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
                    ? "Project Teams"
                    : `${project?.name || "Project"} — Teams`}
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    maxWidth: 650,
                  }}
                >
                  Organize project members into focused
                  teams and manage collaboration.
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
              Create Team
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
              md: 4,
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
                  <GroupsOutlinedIcon />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Teams
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mt: 0.25,
                    }}
                  >
                    {teams.length}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
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
                  <GroupOutlinedIcon />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Collaboration
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mt: 0.25,
                    }}
                  >
                    Team Members
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

        {loading && teams.length === 0 && (
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
              Loading teams...
            </Typography>
          </Paper>
        )}

        {/* =========================
            EMPTY STATE
        ========================= */}

        {!loading && teams.length === 0 && (
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
              backgroundColor: "background.paper",
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
              <GroupsOutlinedIcon
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
              No teams yet
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                maxWidth: 460,
                mx: "auto",
                mb: 3,
              }}
            >
              Create your first team to organize
              developers and project members.
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Create Your First Team
            </Button>
          </Paper>
        )}

        {/* =========================
            TEAM LIST
        ========================= */}

        {teams.length > 0 && (
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
                  Your Teams
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Manage teams, members, and collaboration.
                </Typography>
              </Box>

              <Chip
                label={`${teams.length} ${
                  teams.length === 1
                    ? "Team"
                    : "Teams"
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
              {teams.map((team) => {
                const teamMembers =
                  getTeamMembers(team.id);

                const teamMemberCount =
                  teamMembers.length;

                return (
                  <Grid
                    key={team.id}
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
                        overflow: "hidden",
                        transition:
                          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                        "&:hover": {
                          transform:
                            "translateY(-3px)",
                          boxShadow:
                            "0 10px 28px rgba(30, 50, 90, 0.10)",
                          borderColor:
                            "primary.light",
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
                        {/* Card Header */}

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: 2.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor:
                                "primary.light",
                              color:
                                "primary.dark",
                            }}
                          >
                            <GroupsOutlinedIcon />
                          </Box>

                          <Stack
                            direction="row"
                            spacing={0.25}
                          >
                            <Tooltip title="Edit team">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleOpenEdit(
                                    team
                                  )
                                }
                                sx={{
                                  color:
                                    "text.secondary",
                                  "&:hover": {
                                    color:
                                      "primary.main",
                                    backgroundColor:
                                      "primary.light",
                                  },
                                }}
                              >
                                <EditOutlinedIcon
                                  fontSize="small"
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete team">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDelete(
                                    team.id
                                  )
                                }
                                sx={{
                                  color:
                                    "text.secondary",
                                  "&:hover": {
                                    color:
                                      "error.main",
                                    backgroundColor:
                                      "error.light",
                                  },
                                }}
                              >
                                <DeleteOutlinedIcon
                                  fontSize="small"
                                />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        {/* Team Information */}

                        <Box
                          sx={{
                            mt: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              wordBreak:
                                "break-word",
                            }}
                          >
                            {team.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.35,
                            }}
                          >
                            Project team
                          </Typography>
                        </Box>

                        <Divider
                          sx={{
                            my: 2,
                          }}
                        />

                        {/* Member Summary */}

                        <Stack
                          spacing={1.5}
                          sx={{
                            flex: 1,
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Stack
                              direction="row"
                              spacing={0.8}
                              alignItems="center"
                            >
                              <GroupOutlinedIcon
                                sx={{
                                  fontSize: 19,
                                  color:
                                    "text.secondary",
                                }}
                              />

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {teamMemberCount}{" "}
                                {teamMemberCount ===
                                1
                                  ? "member"
                                  : "members"}
                              </Typography>
                            </Stack>

                            <Chip
                              label="Team"
                              size="small"
                              variant="outlined"
                            />
                          </Stack>

                          {/* Member Preview */}

                          {teamMemberCount > 0 ? (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                backgroundColor:
                                  "background.default",
                                border: "1px solid",
                                borderColor:
                                  "divider",
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={1.25}
                                alignItems="center"
                              >
                                {/* Avatars */}

                                <Stack
                                  direction="row"
                                  sx={{
                                    flexShrink: 0,
                                    "& .MuiAvatar-root":
                                      {
                                        ml: -0.75,
                                        border:
                                          "2px solid",
                                        borderColor:
                                          "background.paper",
                                      },
                                    "& .MuiAvatar-root:first-of-type":
                                      {
                                        ml: 0,
                                      },
                                  }}
                                >
                                  {teamMembers
                                    .slice(0, 3)
                                    .map(
                                      (
                                        member
                                      ) => (
                                        <Tooltip
                                          key={
                                            member.id
                                          }
                                          title={`${member.name} • ${member.email}`}
                                        >
                                          <Avatar
                                            sx={{
                                              width: 32,
                                              height: 32,
                                              fontSize:
                                                "0.78rem",
                                              fontWeight:
                                                700,
                                              bgcolor:
                                                "primary.light",
                                              color:
                                                "primary.dark",
                                            }}
                                          >
                                            {getInitial(
                                              member.name
                                            )}
                                          </Avatar>
                                        </Tooltip>
                                      )
                                    )}
                                </Stack>

                                {/* Names */}

                                <Box
                                  minWidth={0}
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight={
                                      600
                                    }
                                    noWrap
                                  >
                                    {getMemberNames(
                                      team.id
                                    )}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Team members
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          ) : (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor:
                                  "background.default",
                                border: "1px dashed",
                                borderColor:
                                  "divider",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No members added yet.
                              </Typography>
                            </Paper>
                          )}
                        </Stack>

                        {/* Manage Members */}

                        <Button
                          fullWidth
                          variant="outlined"
                          endIcon={
                            <ArrowForwardOutlinedIcon />
                          }
                          startIcon={
                            <GroupsOutlinedIcon />
                          }
                          onClick={() =>
                            handleOpenMembers(
                              team
                            )
                          }
                          sx={{
                            mt: 2,
                            py: 1,
                            fontWeight: 700,
                          }}
                        >
                          Manage Members
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* =========================
            CREATE / EDIT DIALOG
        ========================= */}

        <Dialog
          open={openDialog}
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
            {editingTeam
              ? "Edit Team"
              : "Create New Team"}
          </DialogTitle>

          <DialogContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2.5,
              }}
            >
              {editingTeam
                ? "Update the team name below."
                : "Give your project team a clear and meaningful name."}
            </Typography>

            <TextField
              autoFocus
              fullWidth
              label="Team Name"
              placeholder="e.g. Frontend Team"
              value={teamName}
              onChange={(event) =>
                setTeamName(
                  event.target.value
                )
              }
            />
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
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
                !teamName.trim()
              }
            >
              {editingTeam
                ? "Save Changes"
                : "Create Team"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* =========================
            MEMBERS DIALOG
        ========================= */}

        <Dialog
          open={memberDialogOpen}
          onClose={handleCloseMembers}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle
            sx={{
              p: {
                xs: 2.5,
                sm: 3,
              },
              pb: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
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
                  {selectedTeam?.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Manage members of this team
                </Typography>
              </Box>

              <IconButton
                onClick={handleCloseMembers}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent
            dividers
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
            }}
          >
            {/* =========================
                ADD MEMBER
            ========================= */}

            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 2,
                  sm: 2.5,
                },
                mb: 3,
                borderRadius: 2.5,
                backgroundColor:
                  "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mb: 1.5,
                }}
              >
                <PersonAddOutlinedIcon
                  sx={{
                    color: "primary.main",
                    fontSize: 21,
                  }}
                />

                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Add Team Member
                </Typography>
              </Stack>

              <TextField
                fullWidth
                size="small"
                label="Search by name or email"
                placeholder="e.g. John or john@example.com"
                value={userSearch}
                onChange={handleUserSearch}
                autoComplete="off"
                InputProps={{
                  endAdornment:
                    userSearchLoading ? (
                      <CircularProgress
                        size={18}
                      />
                    ) : null,
                }}
              />

              {/* Search Results */}

              {userSearch.trim() &&
                !selectedUser &&
                !userSearchLoading &&
                availableUsers.length > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                      backgroundColor:
                        "background.paper",
                    }}
                  >
                    {availableUsers.map(
                      (user) => (
                        <Box
                          key={user.id}
                          onClick={() =>
                            handleSelectUser(
                              user
                            )
                          }
                          sx={{
                            px: 2,
                            py: 1.5,
                            cursor: "pointer",
                            transition:
                              "background-color 0.15s ease",
                            "&:hover": {
                              backgroundColor:
                                "action.hover",
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                fontSize:
                                  "0.85rem",
                                fontWeight: 700,
                                bgcolor:
                                  "primary.light",
                                color:
                                  "primary.dark",
                              }}
                            >
                              {getInitial(
                                user.name
                              )}
                            </Avatar>

                            <Box
                              minWidth={0}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                noWrap
                              >
                                {user.name}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                              >
                                {user.email}
                                {user.role
                                  ? ` • ${user.role}`
                                  : ""}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      )
                    )}
                  </Paper>
                )}

              {/* No Results */}

              {userSearch.trim() &&
                !selectedUser &&
                !userSearchLoading &&
                availableUsers.length ===
                  0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: 1,
                    }}
                  >
                    No available users found.
                  </Typography>
                )}

              {/* Selected User */}

              {selectedUser && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    border: "1px solid",
                    borderColor:
                      "success.main",
                    borderRadius: 2,
                    backgroundColor:
                      "success.light",
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
                      spacing={1.25}
                      alignItems="center"
                      minWidth={0}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize:
                            "0.85rem",
                          fontWeight: 700,
                          bgcolor:
                            "success.main",
                          color:
                            "success.contrastText",
                        }}
                      >
                        {getInitial(
                          selectedUser.name
                        )}
                      </Avatar>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          noWrap
                        >
                          {selectedUser.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {selectedUser.email}
                        </Typography>
                      </Box>
                    </Stack>
<IconButton
  size="small"
  onClick={() => {
    setSelectedUser(null);
    setUserSearch("");
  }}
>
  <CloseIcon fontSize="small" />
</IconButton>
                  </Stack>
                </Paper>
              )}

              <Button
                fullWidth
                variant="contained"
                startIcon={
                  <PersonAddOutlinedIcon />
                }
                onClick={handleAddMember}
                disabled={
                  loading ||
                  !selectedUser
                }
                sx={{
                  mt: 1.5,
                  py: 1,
                  fontWeight: 700,
                }}
              >
                Add Member
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 1,
                }}
              >
                Search for an existing user by
                name or email.
              </Typography>
            </Paper>

            {/* =========================
                MEMBER LIST HEADER
            ========================= */}

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                mb: 1.5,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Team Members
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  People currently assigned to this
                  team
                </Typography>
              </Box>

              <Chip
                label={`${currentMembers.length} ${
                  currentMembers.length === 1
                    ? "member"
                    : "members"
                }`}
                size="small"
                variant="outlined"
              />
            </Stack>

            {/* =========================
                EMPTY MEMBERS
            ========================= */}

            {selectedTeam &&
              currentMembers.length ===
                0 && (
                <Paper
                  elevation={0}
                  sx={{
                    py: 4,
                    px: 2,
                    textAlign: "center",
                    borderRadius: 2.5,
                    border: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <GroupsOutlinedIcon
                    sx={{
                      fontSize: 42,
                      color: "text.disabled",
                      mb: 1,
                    }}
                  />

                  <Typography
                    variant="body2"
                    fontWeight={600}
                  >
                    No members yet
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Search for a user above to add
                    them to this team.
                  </Typography>
                </Paper>
              )}

            {/* =========================
                MEMBERS LIST
            ========================= */}

            <Stack spacing={1.25}>
              {currentMembers.map(
                (member) => (
                  <Paper
                    key={member.id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor: "divider",
                      transition:
                        "border-color 0.15s ease, background-color 0.15s ease",
                      "&:hover": {
                        borderColor:
                          "primary.light",
                        backgroundColor:
                          "action.hover",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        minWidth={0}
                      >
                        <Avatar
                          sx={{
                            width: 42,
                            height: 42,
                            fontSize:
                              "0.9rem",
                            fontWeight: 700,
                            bgcolor:
                              "primary.light",
                            color:
                              "primary.dark",
                            flexShrink: 0,
                          }}
                        >
                          {getInitial(
                            member.name
                          )}
                        </Avatar>

                        <Box
                          minWidth={0}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            noWrap
                          >
                            {member.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {member.email}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                      >
                        <Chip
                          label={member.role}
                          size="small"
                          variant="outlined"
                          sx={{
                            display: {
                              xs: "none",
                              sm: "flex",
                            },
                          }}
                        />

                        <Tooltip title="Remove member">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleRemoveMember(
                                member.user_id
                              )
                            }
                          >
                            <CloseIcon
                              fontSize="small"
                            />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                )
              )}
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              px: {
                xs: 2,
                sm: 3,
              },
              py: 2,
            }}
          >
            <Button
              onClick={handleCloseMembers}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </PageContainer>
    </Box>
  );
}

export default Teams;