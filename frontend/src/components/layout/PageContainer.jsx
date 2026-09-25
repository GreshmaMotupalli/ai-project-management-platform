import { Box } from "@mui/material";

function PageContainer({ children, sx = {}, ...props }) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "none",
        mx: "auto",
        px: {
          xs: 2,
          sm: 3,
          md: 4,
          lg: 5,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export default PageContainer;