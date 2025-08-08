import Box from '@mui/material/Box';
import { Outlet, useLocation } from 'react-router-dom';
import ABCBar from '../components/ABCBar';
import { Alert, Divider, LinearProgress, Snackbar } from '@mui/material';
import { useLoading } from '../components/LoadingContext';
import { APIProvider, useLastError } from '../components/APIProvider';
import { useEffect, useState } from 'react';
import BigBox from '../components/BigBox';

function MainLayout() {
    return (
        <APIProvider>
            <InnerLayout />
        </APIProvider>
    );
}

function InnerLayout() {
    const { loading } = useLoading();
    const location = useLocation();
    const lastError = useLastError();
    const [errorModal, setErrorModal] = useState<boolean>(false);
    const isEditPatternPage = location.pathname.startsWith('/pe/pattern/');

    useEffect(() => {
        if (lastError) {
            setErrorModal(true);
        }
    }, [lastError]);

    return <>
        {/* Display errors of the API */}
        <Snackbar open={errorModal} onClose={() => setErrorModal(false)} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert severity="error" variant="filled">
                {lastError}
            </Alert>
        </Snackbar>
        <ABCBar />
        {loading && <LinearProgress />}
        {/* Page Content with animation */}
        {isEditPatternPage ? <Outlet /> : <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', px: 10 }}>
            {/* START SUBPAGE CONTENT */}
            <Outlet />
        </Box>}
        {/* Our footer */}
        {/* Ripped the backgroundImage prop from the header */}
        <footer>
            <BigBox px={10} sx={{ justifySelf: 'center'}}>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', justifySelf: 'center', width: 'inherit' }}>
                    <Box sx={{ flex: 1 }}>
                        <h6><a href='https://gitlab.onefiserv.net/global/corp/tech-svcs/network-product-engineering/abc'>GitLab repository</a></h6>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}>
                        <h6>If you have difficulties using this site, please report issues to <a href="mailto:nidhirajsingh.jalal@fiserv.com">Nidhiraj Singh Jalal</a>.</h6>
                    </Box>
                </Box>
            </BigBox>
        </footer>
    </>
}

export default MainLayout;
