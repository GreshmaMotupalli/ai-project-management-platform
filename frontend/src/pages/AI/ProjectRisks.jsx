import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";

import PageContainer from "../../components/layout/PageContainer";
import aiAPI from "../../api/aiAPI";

function ProjectRisks() {
  const { projectId } = useParams();

  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyzeRisks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await aiAPI.generateProjectRisks(
        Number(projectId)
      );

      setRiskData(data);
    } catch (err) {
      console.error("Failed to analyze project risks:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to analyze project risks."
      );
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === "HIGH") {
      return "error";
    }

    if (severity === "MEDIUM") {
      return "warning";
    }

    return "info";
  };

  return (
    <PageContainer sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Analyze Risks
          </Typography>

          <Typography color="text.secondary">
            Identify potential project risks and get AI-generated
            mitigation suggestions.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <AutoAwesomeIcon />
            )
          }
          onClick={handleAnalyzeRisks}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Risks"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {riskData && (
        <>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {riskData.project_name}
          </Typography>

          {riskData.risks.length === 0 ? (
            <Card>
              <CardContent
                sx={{
                  py: 8,
                  textAlign: "center",
                }}
              >
                <CheckCircleOutlineIcon
                  color="success"
                  sx={{
                    fontSize: 48,
                    mb: 2,
                  }}
                />

                <Typography variant="h6" gutterBottom>
                  No Significant Risks Identified
                </Typography>

                <Typography color="text.secondary">
                  The current project data does not indicate any
                  significant risks.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {riskData.risks.map((risk, index) => (
                <Card key={`${risk.risk}-${index}`}>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: {
                          xs: "flex-start",
                          sm: "center",
                        },
                        gap: 2,
                        mb: 2,
                        flexDirection: {
                          xs: "column",
                          sm: "row",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <WarningAmberOutlinedIcon
                          color={getSeverityColor(
                            risk.severity
                          )}
                        />

                        <Typography variant="h6">
                          {risk.risk}
                        </Typography>
                      </Box>

                      <Chip
                        label={risk.severity}
                        color={getSeverityColor(
                          risk.severity
                        )}
                        size="small"
                      />
                    </Box>

                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Explanation
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, mb: 2.5 }}
                    >
                      {risk.explanation}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Suggested Action
                    </Typography>

                    <Typography
                      sx={{
                        lineHeight: 1.7,
                        fontWeight: 500,
                      }}
                    >
                      {risk.mitigation}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}

      {!riskData && !loading && !error && (
        <Card>
          <CardContent
            sx={{
              py: 8,
              textAlign: "center",
            }}
          >
            <WarningAmberOutlinedIcon
              sx={{
                fontSize: 48,
                color: "warning.main",
                mb: 2,
              }}
            />

            <Typography variant="h6" gutterBottom>
              Analyze Project Risks
            </Typography>

            <Typography color="text.secondary">
              Click "Analyze Risks" to let AI evaluate the
              current project data for potential risks.
            </Typography>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

export default ProjectRisks;
