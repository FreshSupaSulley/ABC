import { AppBar, Box, Container, LinearProgress, Toolbar, Typography } from "@mui/material";
import { Link, useNavigation } from 'react-router-dom';
import StyledLink from "./StyledLink";
import { ACCESS_TOKEN } from "../constants";

const ABCBar: React.FC = () => {
    const { state } = useNavigation();
    const loggedIn = !!localStorage.getItem(ACCESS_TOKEN);
    return (
        <>
            {/* Smooth loading effect while waiting for pages to load */}
            {state !== 'idle' && (
                <LinearProgress />
            )}
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ gap: 2 }}>
                        {/* Navigation */}
                        <Box sx={{ flexGrow: 1, display: 'flex', gap: 3, alignItems: 'center' }}>
                            <Typography component={Link} to='/' viewTransition={true} variant="h5" fontWeight='bold' sx={{ textDecoration: 'none', color: 'inherit' }}>
                                Approved BOM Catalog
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {/* Only show these if logged in */}
                            {loggedIn && <>
                                <StyledLink to='/pe/schema' label='Schemas' />
                                <StyledLink to='/pe/product' label='Products' />
                            </>}
                            <StyledLink to={loggedIn ? 'logout' : 'login'} label={loggedIn ? 'Logout' : 'Login'} variant='contained' />
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    );
};

export default ABCBar;
