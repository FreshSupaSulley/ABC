import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import StyledLink from '../components/StyledLink';
import { LinearProgress } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

function MainLayout() {
    const { state } = useNavigation();
    const location = useLocation();
    const prevLocation = useRef(location.pathname);
    const [direction, setDirection] = useState('left'); // default swipe left

    useEffect(() => {
        if (location.pathname !== prevLocation.current) {
            // Simple example logic:
            // If new path is alphabetically greater, swipe left, else swipe right
            setDirection(location.pathname > prevLocation.current ? 'left' : 'right');
            prevLocation.current = location.pathname;
        }
    }, [location.pathname]);

    return (
        <>
            {/* Smooth loading effect while waiting for pages to load */}
            {state !== 'idle' && (
                <LinearProgress />
            )}
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* Navigation */}
                        <Box sx={{ flexGrow: 1, display: 'flex', gap: 3, alignItems: 'center' }}>
                            <Typography variant="h5" fontWeight='bold'>
                                Approved BOM Catalog
                            </Typography>
                            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                                <StyledLink to='/' label='Home' />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <StyledLink to='admin' label='Admin' variant='outlined' />
                            <StyledLink to='login' label='Login' variant='contained' />
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            {/* Page Content with animation */}
            <Box component="div" sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', viewTransitionName: direction }}>
                <Outlet />
            </Box>
        </ >
    );
}

export default MainLayout;
