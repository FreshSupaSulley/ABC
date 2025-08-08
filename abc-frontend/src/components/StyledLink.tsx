import React from 'react';
import { NavigateOptions, useNavigate } from 'react-router-dom';
import { MenuItem, MenuItemProps } from '@mui/material';

interface StyledLinkProps extends MenuItemProps {
    to: string;
    label: string;
    onClose: () => void;
}

const StyledLink: React.FC<StyledLinkProps> = ({ to, label, onClose, ...buttonProps }) => {
    const navigation = useNavigate();
    const onClick = () => {
        navigation(to);
        onClose();
    }
    return (
        <MenuItem onClick={onClick} {...buttonProps}>
            {label}
        </MenuItem>
    );
};

export default StyledLink;
