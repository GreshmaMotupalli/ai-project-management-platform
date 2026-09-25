import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import teamAPI from "./teamAPI";


export const fetchProjectTeams = createAsyncThunk(
  "teams/fetchProjectTeams",
  async (projectId, { rejectWithValue }) => {
    try {
      return await teamAPI.getProjectTeams(projectId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to fetch teams"
      );
    }
  }
);


export const createTeam = createAsyncThunk(
  "teams/createTeam",
  async (teamData, { rejectWithValue }) => {
    try {
      return await teamAPI.createTeam(teamData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to create team"
      );
    }
  }
);


export const updateTeam = createAsyncThunk(
  "teams/updateTeam",
  async ({ teamId, teamData }, { rejectWithValue }) => {
    try {
      return await teamAPI.updateTeam(teamId, teamData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to update team"
      );
    }
  }
);


export const deleteTeam = createAsyncThunk(
  "teams/deleteTeam",
  async (teamId, { rejectWithValue }) => {
    try {
      await teamAPI.deleteTeam(teamId);

      return teamId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to delete team"
      );
    }
  }
);


export const fetchTeamMembers = createAsyncThunk(
  "teams/fetchTeamMembers",
  async (teamId, { rejectWithValue }) => {
    try {
      return {
        teamId,
        members: await teamAPI.getMembers(teamId),
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to fetch team members"
      );
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "teams/fetchUsers",
  async (search, { rejectWithValue }) => {
    try {
      return await teamAPI.getUsers(search);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to search users"
      );
    }
  }
);

export const addTeamMember = createAsyncThunk(
  "teams/addTeamMember",
  async ({ teamId, userId }, { rejectWithValue }) => {
    try {
      return await teamAPI.addMember(teamId, userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to add team member"
      );
    }
  }
);


export const removeTeamMember = createAsyncThunk(
  "teams/removeTeamMember",
  async ({ teamId, userId }, { rejectWithValue }) => {
    try {
      await teamAPI.removeMember(teamId, userId);

      return {
        teamId,
        userId,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to remove team member"
      );
    }
  }
);


const initialState = {
  teams: [],
  members: {},
  loading: false,
  error: null,
};


const teamSlice = createSlice({
  name: "teams",
  initialState,

  reducers: {
    clearTeamError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch teams
      .addCase(fetchProjectTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProjectTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })

      .addCase(fetchProjectTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // Create team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.unshift(action.payload);
      })

      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // Update team
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.teams.findIndex(
          (team) => team.id === action.payload.id
        );

        if (index !== -1) {
          state.teams[index] = action.payload;
        }
      })

      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // Delete team
      .addCase(deleteTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;

        state.teams = state.teams.filter(
          (team) => team.id !== action.payload
        );

        delete state.members[action.payload];
      })

      .addCase(deleteTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // Fetch members
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false;

        state.members[action.payload.teamId] =
          action.payload.members;
      })

      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })

      // Add member
      .addCase(addTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.loading = false;

        const teamId = action.payload.team_id;

        if (!state.members[teamId]) {
          state.members[teamId] = [];
        }

        state.members[teamId].push(action.payload);
      })

      .addCase(addTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // Remove member
      .addCase(removeTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.loading = false;

        const { teamId, userId } = action.payload;

        if (state.members[teamId]) {
          state.members[teamId] = state.members[teamId].filter(
            (member) => member.user_id !== userId
          );
        }
      })

      .addCase(removeTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


export const { clearTeamError } = teamSlice.actions;

export default teamSlice.reducer;