import React from 'react';
import { Link } from 'react-router-dom';
import { Button, ButtonProps } from '@mui/material';

interface StyledLinkProps extends ButtonProps {
    to: string;
    label: string;
}

const StyledLink: React.FC<StyledLinkProps> = ({ to, label, ...buttonProps }) => {
    return (
        <Link to={to} viewTransition={true}>
            <Button variant='outlined' color='primary' {...buttonProps}>
                {label}
            </Button>
        </Link>
    );
};

export default StyledLink;
