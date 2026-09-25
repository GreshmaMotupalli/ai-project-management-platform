import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

import commentAPI from "../../features/comments/commentAPI";

import {
  setComments,
  addComment,
  removeComment,
  setLoading,
  setError,
} from "../../features/comments/commentSlice";

function TaskComments({ taskId }) {
  const dispatch = useDispatch();

  const {
    comments,
    loading,
    error,
  } = useSelector(
    (state) => state.comments
  );

  const [commentText, setCommentText] = useState("");
  const [addingComment, setAddingComment] =
    useState(false);
  const [deletingCommentId, setDeletingCommentId] =
    useState(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const data =
          await commentAPI.getTaskComments(
            taskId
          );

        dispatch(setComments(data));
      } catch (error) {
        console.error(
          "Failed to load comments:",
          error
        );

        dispatch(
          setError(
            "Failed to load comments."
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (taskId) {
      loadComments();
    }
  }, [dispatch, taskId]);

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      return;
    }

    try {
      setAddingComment(true);
      dispatch(setError(null));

      const newComment =
        await commentAPI.createComment({
          task_id: taskId,
          content: commentText.trim(),
        });

      dispatch(addComment(newComment));

      setCommentText("");
    } catch (error) {
      console.error(
        "Failed to add comment:",
        error
      );

      dispatch(
        setError(
          "Failed to add comment."
        )
      );
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteComment = async (
    commentId
  ) => {
    try {
      setDeletingCommentId(commentId);
      dispatch(setError(null));

      await commentAPI.deleteComment(
        commentId
      );

      dispatch(removeComment(commentId));
    } catch (error) {
      console.error(
        "Failed to delete comment:",
        error
      );

      dispatch(
        setError(
          "Failed to delete comment."
        )
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 2 }} />

      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ mb: 1.5 }}
      >
        Comments
      </Typography>

      {/* Add Comment */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          placeholder="Write a comment..."
          value={commentText}
          onChange={(event) =>
            setCommentText(event.target.value)
          }
        />

        <Button
          variant="contained"
          onClick={handleAddComment}
          disabled={
            addingComment ||
            !commentText.trim()
          }
          sx={{
            mt: 1,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          {addingComment
            ? "Adding..."
            : "Add Comment"}
        </Button>
      </Box>

      {/* Loading */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
          }}
        >
          <CircularProgress size={16} />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Loading comments...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      )}

      {/* No comments */}
      {!loading &&
        !error &&
        comments.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            No comments yet.
          </Typography>
        )}

      {/* Comments */}
      {!loading &&
        comments.length > 0 && (
          <Box>
            {comments.map((comment) => (
              <Box
                key={comment.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                  py: 1.5,
                  borderBottom:
                    "1px solid #eee",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak:
                        "break-word",
                    }}
                  >
                    {comment.content}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    User {comment.user_id}
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() =>
                    handleDeleteComment(
                      comment.id
                    )
                  }
                  disabled={
                    deletingCommentId ===
                    comment.id
                  }
                >
                  {deletingCommentId ===
                  comment.id ? (
                    <CircularProgress
                      size={18}
                    />
                  ) : (
                    <DeleteOutlineIcon
                      fontSize="small"
                    />
                  )}
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
    </Box>
  );
}

export default TaskComments;