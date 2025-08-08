import { Alert, AlertTitle, Box, Button, Card, CardContent, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, FormHelperText, MenuItem, Select, Snackbar, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { PatternType } from "./pe/EditPattern";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Edit, Email, FileDownloadOutlined } from "@mui/icons-material";
import BigBox from "../components/BigBox";
import PageTitle from "../components/PageTitle";
import { useAPI } from "../components/APIProvider";
import { NumericFormat } from 'react-number-format';
import { ACCESS_TOKEN } from "../constants";
import { useLoading } from "../components/LoadingContext";

export default function Build() {
    const api = useAPI();
    const navigation = useNavigate();
    const { loading } = useLoading();
    const { patternId } = useParams();
    const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
    const [pattern, setPattern] = useState<PatternType | null>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [emailAddress, setEmailAddress] = useState("");
    const [error, setError] = useState('');

    // Top error message bar
    const [showTop, setShowTop] = useState<boolean>(false);

    const downloadBOM = () => {
        // Close dialog
        api.post(`/api/pattern/${patternId}/bom`, { answers }, { responseType: 'blob' }).then((res) => {
            // Trigger download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] }));
            link.download = `${pattern?.pattern_group.name}-bom.pdf`; // ignore content-disposition header idgaf
            link.click();
            URL.revokeObjectURL(link.href);
        }).catch(console.error);
    };

    // No need to check if email is valid, this shouldn't be triggered as the button will be disabled
    const emailBOM = () => {
        setShowTop(false); // safety net
        api.post(`/api/pattern/${patternId}/bom`, {
            answers, email: emailAddress
        }).then(() => {
            // On success, close the popup
            setCreateOpen(false);
            setShowTop(true);
        }).catch(console.error);
    };

    const checkEmail = (value: string) => {
        setEmailAddress(value);
        // Basic email validation regex
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            setError('Enter a valid email address');
        } else {
            setError('');
        }
    }

    useEffect(() => {
        api.get<PatternType>(`/api/pattern/${patternId}`)
            .then((res) => res.data)
            .then((data) => {
                setPattern(data);
                // Initialize answers from question defaults
                const initialAnswers: Record<string, string | number | boolean> = {};
                data.questions?.forEach((q) => {
                    initialAnswers[q.name] = q.default;
                });
                setAnswers(initialAnswers);
            })
            .catch(console.error);
    }, [patternId]);

    return (!pattern ? <CircularProgress sx={{ mt: 10 }} /> :
        <BigBox>
            <title>Build BOM</title>
            <Snackbar open={showTop} onClose={() => setShowTop(false)} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity="success" variant="filled">
                    Sent email to {emailAddress}
                </Alert>
            </Snackbar>
            {/* Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigation("/", { viewTransition: true })}>
                    Browse Patterns
                </Button>
                {/* Only show this if we're logged in as an admin (lazily checking the local storage for credentials (should work fine)) */}
                {localStorage.getItem(ACCESS_TOKEN) && <Button sx={{}} variant="outlined" startIcon={<Edit />} onClick={() => navigation(`/pe/pattern/${pattern?.id}`, { viewTransition: true })}>
                    Edit
                </Button>}
            </Box>
            {/* Warning if deprecated and PLs somehow got to this page (or an admin is here) */}
            {pattern?.deprecated && <Alert sx={{ my: 2 }} severity="warning" variant="filled">
                <AlertTitle>Deprecated</AlertTitle>
                This version is outdated and not recommended for use.
            </Alert>}
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <PageTitle title={`Build BOM`} />
                    <p><b>{pattern?.pattern_group.name}</b> — Version #{pattern?.version}</p>
                </Box>
            </Box>
            <Divider />
            <Card>
                <CardContent>
                    {/* Questions are put into a responsive grid */}
                    {pattern?.questions?.length > 0 ? (
                        <>
                            <h4 style={{ textAlign: 'center' }}>{pattern.questions.length} question{pattern.questions.length != 1 ? 's' : ''}</h4>
                            <Box display='flex' flexDirection='column' gap={2} justifyItems='center' px={'15%'} mb={10}>
                                {!pattern?.questions ? <p>BOM is not complete.</p> :
                                    pattern?.questions?.map((q, index) => (
                                        <Box key={q.name} alignContent='center' width='100%'>
                                            <h3>#{index + 1} - {q.prompt}</h3>
                                            {/* Optional description */}
                                            {q.description && <p>{q.description}</p>}
                                            {q.type === "boolean" ? (
                                                // Giving this a border because I want it to look like the other options
                                                <Box sx={{ userSelect: 'none', width: '100%', outline: 1, outlineColor: '#ffffff3b', borderRadius: 1, pl: 1 }}>
                                                    <FormControlLabel sx={{ userSelect: 'none', width: '100%' }} label={answers[q.name] ? "Yes" : "No"} control={<Checkbox size="large" defaultChecked={Boolean(q.default)} onChange={(e) => setAnswers({ ...answers, [q.name]: e.target.checked })} />} />
                                                </Box>
                                            ) : q.type === "enum" ? (
                                                <>
                                                    <FormHelperText>Select an option</FormHelperText>
                                                    <Select fullWidth value={answers[q.name]} onChange={(e) => setAnswers({ ...answers, [q.name]: e.target.value })}>
                                                        {q.choices?.map((c) => (
                                                            <MenuItem key={c} value={c}>{c}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </>
                                            ) : (
                                                <>
                                                    <FormHelperText>Enter a number{q.min !== undefined || q.max !== undefined ? ` - Range: [${q.min || '-∞'}, ${q.max || '∞'}]` : ''}</FormHelperText>
                                                    {/* Special setAnswers behavior. If the user deletes value, floatValue will be undefined. If so, replace it with the default value */}
                                                    <NumericFormat placeholder={`Default: ${q.default}`} allowLeadingZeros={false} valueIsNumericString isAllowed={(raw) => {
                                                        let { value } = raw;
                                                        return value <= (q.max ?? value) && value >= (q.min ?? value);
                                                    }} value={(answers[q.name] as number)} onValueChange={(e) => setAnswers({ ...answers, [q.name]: e.floatValue === undefined ? q.default : e.floatValue })} customInput={TextField} fullWidth thousandSeparator />
                                                </>
                                            )}
                                        </Box>
                                    )
                                    )}
                            </Box>
                        </>
                    ) : <h4 style={{ textAlign: 'center' }}>This BOM is ready to download.</h4>}
                </CardContent>
                <Divider />
                <CardContent sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    {/* Submit BOM request */}
                    <Button sx={{}} variant="contained" startIcon={<FileDownloadOutlined />} onClick={() => downloadBOM()}>
                        Download PDF
                    </Button>
                    <Button sx={{}} variant="contained" startIcon={<Email />} onClick={() => setCreateOpen(true)}>
                        Email
                    </Button>
                    <Dialog fullWidth open={createOpen} onClose={() => setCreateOpen(false)}>
                        <DialogTitle>Email BOM</DialogTitle>
                        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <DialogContentText>
                                Provide an email address to send the BOM to.
                            </DialogContentText>
                            <Box >
                                {/* Name will be autofilled if they're creating a new version */}
                                <TextField required label="Email Address" placeholder="first.last@fiserv.com" variant="outlined" value={emailAddress} onChange={e => checkEmail(e.target.value)} error={!!error} helperText={error} fullWidth />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={emailBOM} disabled={!!error || !emailAddress || loading} variant="contained">
                                Send
                            </Button>
                        </DialogActions>
                    </Dialog>
                </CardContent>
            </Card>
        </BigBox>
    )
}
