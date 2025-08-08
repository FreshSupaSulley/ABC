import { Box, BoxProps } from "@mui/material";

const bigBox: React.FC<BoxProps> = (props) => {
    return (
        <Box sx={{ width: '100%', maxWidth: 1000, my: 5, ...props.sx }}>
            {props.children}
        </Box>
    );
};

export default bigBox;
