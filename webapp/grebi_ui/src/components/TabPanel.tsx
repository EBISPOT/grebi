import { Box, Typography } from "@mui/material";

export interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

export default function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        // <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        // </Box>
      )}
    </div>
  );
}

