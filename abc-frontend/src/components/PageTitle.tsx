import { Box, Typography } from "@mui/material";

export interface PageTitleProps {
    title: string;
    icon?: React.ReactNode
}

const bigBox: React.FC<PageTitleProps> = ({ title, icon }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'inherit' }}>
            {icon}
            <Typography variant="h4" fontWeight='bold' sx={{ marginLeft: icon ? 1 : 0, textAlign: 'inherit', width: '100%' }}>
                {title}
            </Typography>
        </Box>
    );
};

export default bigBox;
