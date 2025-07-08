import { Typography } from "@mui/material";

export interface PageTitleProps {
    title: string;
}

const bigBox: React.FC<PageTitleProps> = ({ title }) => {
    return (
        <Typography variant="h4" fontWeight='bold'>
            {title}
        </Typography>
    );
};

export default bigBox;
