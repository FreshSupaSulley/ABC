import React from 'react';
import { Link } from 'react-router-dom';
import { Button, ButtonProps, useTheme } from '@mui/material';

interface StyledLinkProps extends ButtonProps {
    to: string;
    label: string;
}

const StyledLink: React.FC<StyledLinkProps> = ({ to, label, ...buttonProps }) => {
    const theme = useTheme();
    return (
        <Link to={to} viewTransition={true}>
            <Button variant="text" sx={{ color: theme.palette.text.primary }} {...buttonProps}>
                {label}
            </Button>
        </Link>
    );
};

export default StyledLink;
