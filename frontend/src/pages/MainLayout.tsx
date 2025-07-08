import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import ABCBar from '../components/ABCBar';

function MainLayout() {
    return (
        <>
            <ABCBar />
            {/* Page Content with animation */}
            <Box component="div" sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', px: 10 }}>
                <Outlet />
            </Box>
        </>
    );
}

export default MainLayout;
