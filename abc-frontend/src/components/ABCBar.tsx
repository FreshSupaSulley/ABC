import { AppBar, Box, Button, Container, Divider, LinearProgress, ListItemIcon, Menu, MenuItem, MenuList, Toolbar, Typography } from "@mui/material";
import { Link, useNavigate, useNavigation } from 'react-router-dom';
import StyledLink from "./StyledLink";
import { ACCESS_TOKEN } from "../constants";
import { useState } from "react";
import React from "react";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Home } from "@mui/icons-material";

const ABCBar: React.FC = () => {
    const { state } = useNavigation();
    const navigation = useNavigate();
    const [open, setOpen] = useState<boolean>(false);
    const loggedIn = !!localStorage.getItem(ACCESS_TOKEN);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setAnchorEl(null);
    };
    return (
        <>
            {/* Smooth loading effect while waiting for pages to load */}
            {state !== 'idle' && (
                <LinearProgress />
            )}
            {/* Sticky to make it "stick" to the top of the screen */}
            {/* If you don't like that, change it to "static" */}
            <AppBar position="sticky">
                <Container>
                    <Toolbar disableGutters sx={{ gap: 2 }}>
                        {/* Navigation */}
                        <Box sx={{ flexGrow: 1, display: 'flex', gap: 3, alignItems: 'center' }}>
                            <Typography component={Link} to='/' viewTransition={true} variant="h5" fontWeight='bold' sx={{ textDecoration: 'none', color: 'inherit' }}>
                                Approved BOM Catalog
                            </Typography>
                            <Button startIcon={<Home />} onClick={() => navigation("/")}>Home</Button>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {/* Only show these if logged in */}
                            {loggedIn && <>
                                <Button variant="outlined" onClick={handleClick}>
                                    Manage
                                </Button>
                                <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={(e) => setOpen(false)}
                                    slotProps={{
                                        list: {
                                            'aria-labelledby': 'basic-button',
                                        },
                                    }}>
                                    <StyledLink to='/pe/pattern' label='Patterns' onClose={handleClose} />
                                    <Divider />
                                    <StyledLink to='/pe/product' label='Products' onClose={handleClose} />
                                    <StyledLink to='/pe/product/manufacturer' label='Manufacturers' onClose={handleClose} />
                                    <StyledLink to='/pe/product/classification' label='Classifications' onClose={handleClose} />
                                    <StyledLink to='/pe/product/device-role' label='Device Roles' onClose={handleClose} />
                                    <Divider />
                                    {/* Special behavior because /admin is caught (in prod) to redirect to Django's admin page */}
                                    <MenuItem onClick={() => window.location.href = "/admin"}>
                                        <ListItemIcon>
                                            <AdminPanelSettingsIcon fontSize="small" />
                                        </ListItemIcon>
                                        Django Admin Site
                                    </MenuItem>
                                </Menu>
                            </>}
                            <Link to={loggedIn ? 'logout' : 'login'} viewTransition={true}>
                                <Button variant='contained' color='primary'>
                                    {loggedIn ? `Logout` : `Login`}
                                </Button>
                            </Link>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    );
};

export default ABCBar;
