import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";

import { useParams } from "react-router-dom";
import aiAPI from "../../api/aiAPI";

function ProjectAssistant() {
  const { projectId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // Load conversations when project changes
  // --------------------------------------------------

  useEffect(() => {
    loadConversations(true);
  }, [projectId]);

  // --------------------------------------------------
  // Load conversation list
  // --------------------------------------------------

  const loadConversations = async (openLatest = false) => {
    try {
      const data = await aiAPI.getConversations(projectId);

      setConversations(data);

      if (openLatest && data.length > 0) {
        await loadMessages(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  // --------------------------------------------------
  // Load messages for selected conversation
  // --------------------------------------------------

  const loadMessages = async (conversationId) => {
    try {
      const data = await aiAPI.getConversationMessages(
        projectId,
        conversationId
      );

      setActiveConversationId(conversationId);
      setMessages(data.messages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  // --------------------------------------------------
  // Start a new chat
  // --------------------------------------------------

  const handleNewChat = () => {
    if (loading) {
      return;
    }

    setActiveConversationId(null);
    setMessages([]);
    setQuestion("");
  };

  // --------------------------------------------------
  // Send message with streaming
  // --------------------------------------------------

  const handleSend = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    setLoading(true);
    setQuestion("");

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    // Show user message immediately.
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        id: userMessageId,
        role: "user",
        content: trimmedQuestion,
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      },
    ]);

    try {
      // --------------------------------------------------
      // Stream AI response
      // --------------------------------------------------

      const returnedConversationId =
        await aiAPI.streamProjectAssistant(
          projectId,
          trimmedQuestion,
          activeConversationId,
          (chunk) => {
            setMessages((previousMessages) =>
              previousMessages.map((message) => {
                if (message.id !== assistantMessageId) {
                  return message;
                }

                return {
                  ...message,
                  content: message.content + chunk,
                };
              })
            );
          }
        );

      // --------------------------------------------------
      // Store the real database conversation ID
      // --------------------------------------------------

      setActiveConversationId(returnedConversationId);

      // --------------------------------------------------
      // Refresh conversation history
      // --------------------------------------------------

      await loadConversations(false);

    } catch (error) {
      console.error("Failed to stream AI response:", error);

      setMessages((previousMessages) =>
        previousMessages.map((message) => {
          if (message.id !== assistantMessageId) {
            return message;
          }

          return {
            ...message,
            content:
              "Sorry, I could not generate a response. Please try again.",
          };
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 120px)",
        gap: 2,
      }}
    >
      {/* ==================================================
          SIDEBAR
          ================================================== */}

      <Paper
        elevation={0}
        sx={{
          width: 280,
          flexShrink: 0,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* New Chat button */}

        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleNewChat}
            disabled={loading}
          >
            New Chat
          </Button>
        </Box>

        <Divider />

        {/* Conversation history */}

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 1,
          }}
        >
          {conversations.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                px: 1.5,
                py: 2,
              }}
            >
              No conversations yet.
            </Typography>
          ) : (
            conversations.map((conversation) => (
              <Button
                key={conversation.id}
                fullWidth
                onClick={() => loadMessages(conversation.id)}
                disabled={loading}
                sx={{
                  justifyContent: "flex-start",
                  textAlign: "left",
                  mb: 0.5,
                  px: 1.5,
                  py: 1,
                  backgroundColor:
                    activeConversationId === conversation.id
                      ? "action.selected"
                      : "transparent",
                }}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    width: "100%",
                    textTransform: "none",
                  }}
                >
                  {conversation.title}
                </Typography>
              </Button>
            ))
          )}
        </Box>
      </Paper>

      {/* ==================================================
          CHAT AREA
          ================================================== */}

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}

        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            fontWeight={600}
          >
            AI Project Assistant
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Ask questions about your project, tasks, progress, and risks.
          </Typography>
        </Box>

        <Divider />

        {/* ==================================================
            MESSAGES
            ================================================== */}

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 2, md: 4 },
          }}
        >
          {messages.length === 0 ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                height: "100%",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h5"
                fontWeight={600}
              >
                Ask about your project
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Ask about tasks, progress, risks, or project details.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {messages.map((message, index) => {
                const isUser = message.role === "user";

                return (
                  <Box
                    key={message.id ?? index}
                    sx={{
                      display: "flex",
                      justifyContent: isUser
                        ? "flex-end"
                        : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "75%",
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        backgroundColor: isUser
                          ? "primary.main"
                          : "action.hover",
                        color: isUser
                          ? "primary.contrastText"
                          : "text.primary",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {message.content}

                        {!isUser &&
                          loading &&
                          index === messages.length - 1 && (
                            <Box
                              component="span"
                              sx={{
                                display: "inline-block",
                                ml: 0.5,
                                animation: "blink 1s infinite",
                                "@keyframes blink": {
                                  "0%, 50%": {
                                    opacity: 1,
                                  },
                                  "51%, 100%": {
                                    opacity: 0,
                                  },
                                },
                              }}
                            >
                              ▌
                            </Box>
                          )}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        <Divider />

        {/* ==================================================
            INPUT
            ================================================== */}

        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            spacing={1}
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={
                loading
                  ? "AI is generating a response..."
                  : "Ask about your project..."
              }
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
            />

            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!question.trim() || loading}
              sx={{
                alignSelf: "flex-end",
                mb: 0.5,
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default ProjectAssistant;