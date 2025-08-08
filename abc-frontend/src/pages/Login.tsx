import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { Box, Button, TextField } from "@mui/material";
import { useAPI } from "../components/APIProvider";
import BigBox from "../components/BigBox";
import { useLoading } from "../components/LoadingContext";

const Form: React.FC = () => {
    const api = useAPI();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const { loading } = useLoading();
    const navigate = useNavigate();

    const handleSubmit = () => {
        api.post("/api/token", { username, password }).then(res => {
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            navigate("/");
        }).catch(console.error);
    };

    return (
        <BigBox sx={{ textAlign: 'center', gap: 1, display: 'flex', flexDirection: 'column', pt: 4 }}>
            <title>Login</title>
            <h1>Admin Login</h1>
            <p>If you don't have an account, you'll need an existing admin to create one for you.</p>
            <Box sx={{ maxWidth: '40%', width: '100%', display: 'flex', flexDirection: 'column', gap: 1, alignSelf: 'center' }}>
                <TextField required fullWidth value={username} onChange={(e) => setUsername(e.target.value)} label="Username" variant="standard" />
                <TextField required fullWidth value={password} onChange={(e) => setPassword(e.target.value)} label="Password" type="password" variant="standard" onKeyDown={(e) => {
                    if (e.key == "Enter") handleSubmit();
                }} />
                <Button fullWidth sx={{ mt: 2 }} variant="contained" onClick={handleSubmit} disabled={loading}>
                    Login
                </Button>
            </Box>
        </BigBox>
    );
};

export default Form;
