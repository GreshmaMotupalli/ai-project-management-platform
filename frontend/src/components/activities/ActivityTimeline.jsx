import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Alert,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";

import activityAPI from "../../features/activities/activityAPI";

import {
  setActivities,
  setLoading,
  setError,
} from "../../features/activities/activitySlice";

function getActivityColor(entityType) {
  switch (entityType) {
    case "TASK":
      return "#1976d2";

    case "SPRINT":
      return "#7b1fa2";

    case "COMMENT":
      return "#00897b";

    default:
      return "#607d8b";
  }
}

function ActivityTimeline({ projectId }) {
  const dispatch = useDispatch();

  const {
    activities,
    loading,
    error,
  } = useSelector(
    (state) => state.activities
  );

  useEffect(() => {
    const loadActivities = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const data =
          await activityAPI.getProjectActivities(
            projectId
          );

        dispatch(setActivities(data));
      } catch (error) {
        console.error(
          "Failed to load activities:",
          error
        );

        dispatch(
          setError(
            "Failed to load project activities."
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (projectId) {
      loadActivities();
    }
  }, [dispatch, projectId]);

  return (
    <Box>
      {/* Section Header */}
      <Box
        sx={{
          mb: 3,
          textAlign: "left",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={500}
          sx={{
            color: "#374151",
          }}
        >
          Activity
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
          }}
        >
          Recent changes and updates in this project
        </Typography>
      </Box>

      {/* Loading */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            py: 4,
          }}
        >
          <CircularProgress size={20} />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Loading activity...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!loading &&
        !error &&
        activities.length === 0 && (
          <Box
            sx={{
              py: 6,
              textAlign: "center",
              border: "1px dashed #d5d9e2",
              borderRadius: 2,
              backgroundColor: "#fafbfc",
            }}
          >
            <Typography
              variant="body1"
              fontWeight={600}
              color="text.secondary"
            >
              No activity yet
            </Typography>

            <Typography
              variant="body2"
              color="text.disabled"
              sx={{
                mt: 0.5,
              }}
            >
              Project changes will appear here.
            </Typography>
          </Box>
        )}

      {/* Activity Timeline */}
      {!loading &&
        !error &&
        activities.length > 0 && (
          <Box>
            {activities.map((activity, index) => {
              const activityColor =
                getActivityColor(
                  activity.entity_type
                );

              const isLast =
                index === activities.length - 1;

              return (
                <Box
                  key={activity.id}
                  sx={{
                    display: "flex",
                    position: "relative",
                    minHeight: isLast ? "auto" : 76,
                  }}
                >
                  {/* Timeline column */}
                  <Box
                    sx={{
                      width: 28,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {/* Activity dot */}
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor:
                          activityColor,
                        mt: 1.25,
                        zIndex: 1,
                        boxShadow: `0 0 0 4px ${activityColor}18`,
                      }}
                    />

                    {/* Timeline line */}
                    {!isLast && (
                      <Box
                        sx={{
                          width: "1px",
                          flex: 1,
                          backgroundColor:
                            "#e1e4e8",
                          mt: 0.5,
                        }}
                      />
                    )}
                  </Box>

                  {/* Activity row */}
                  <Box
                    sx={{
                      flex: 1,
                      ml: 1,
                      mb: isLast ? 0 : 1,
                      px: 1.5,
                      py: 1.25,
                      borderRadius: 2,
                      transition:
                        "background-color 0.15s ease",
                      "&:hover": {
                        backgroundColor: "#f8f9fb",
                      },
                    }}
                  >
                    {/* Action + Time */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{
                          color: "#263238",
                        }}
                      >
                        {activity.action}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {new Date(
                          activity.created_at
                        ).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>

                    {/* Metadata */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                        mt: 0.75,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        User {activity.user_id}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.disabled"
                      >
                        •
                      </Typography>

                      {/* Entity Badge */}
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          backgroundColor: `${activityColor}12`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          sx={{
                            color:
                              activityColor,
                          }}
                        >
                          {activity.entity_type} #
                          {activity.entity_id}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
    </Box>
  );
}

export default ActivityTimeline;