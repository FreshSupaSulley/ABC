import { Box, Button, Card, CardContent, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, ListItemText, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import ItemList from "../components/ItemList";
import { useState, useEffect } from "react";
import api from "../api";
import { SchemaType } from "./pe/EditSchema";
import { useNavigate, useParams } from "react-router-dom";
import YamlEditor from "../components/YamlEditor";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FileDownloadOutlined } from "@mui/icons-material";
import BigBox from "../components/BigBox";
import { title } from "process";
import PageTitle from "../components/PageTitle";

export default function Build() {
    const navigation = useNavigate();
    const { schemaId } = useParams();
    const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
    const [schema, setSchema] = useState<SchemaType | null>(null);

    const downloadBOM = () => {
        // Close dialog
        api.post(`/api/schema/${schemaId}/bom`, { answers: answers }, { responseType: 'blob' }).then((res) => {
            const blob = new Blob([res.data], { type: res.headers['content-type'] });

            // Get filename from the header
            const contentDisposition = res.headers['content-disposition'];
            let filename = 'bom.xlsx';
            console.log(contentDisposition);
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match?.[1]) {
                    filename = match[1];
                }
            }

            // Trigger download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
        }).catch(e => {
            alert("Something went wrong creating BOM");
            console.error(e);
        });
    };

    useEffect(() => {
        api.get<SchemaType>(`/api/schema/${schemaId}`)
            .then((res) => res.data)
            .then((data) => {
                setSchema(data);
                // Initialize answers from question defaults
                const initialAnswers: Record<string, string | number | boolean> = {};
                data.questions?.forEach((q) => {
                    initialAnswers[q.name] = q.default;
                });
                setAnswers(initialAnswers);
            })
            .catch((err) => alert(err));
    }, [schemaId]);


    return (
        <BigBox>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flex: 'none' }}>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigation("/", { viewTransition: true })}>
                        Back
                    </Button>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <PageTitle title={`Build BOM for ${schemaId}`} />
                </Box>
                {/* Invisible. Used only to center */}
                <Box sx={{ flex: 'none', width: 'auto', visibility: 'hidden' }}>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />}>Back</Button>
                </Box>
            </Box>
            <Divider />
            <Card>
                <CardContent>
                    {/* Questions are put into a responsive grid */}
                    <Grid container rowSpacing={2} columnSpacing={8} sx={{ my: 6 }} justifyContent='center'>
                        {/* Render questions */}
                        {!schema?.questions ? <p>BOM is not yet complete.</p> :
                            schema?.questions?.map((q) => (
                                <Box key={q.name}>
                                    <Typography>{q.prompt}</Typography>
                                    {q.type === "boolean" ? (
                                        <Checkbox value={answers[q.name] || false} onChange={(e) => setAnswers({ ...answers, [q.name]: e.target.checked })} />
                                    ) : q.type === "enum" ? (
                                        <Select value={answers[q.name] ?? q.default} onChange={(e) => setAnswers({ ...answers, [q.name]: e.target.value })}>
                                            {q.choices?.map((c) => (
                                                <MenuItem key={c} value={c}>{c}</MenuItem>
                                            ))}
                                        </Select>
                                    ) : (
                                        <TextField
                                            type="number"
                                            value={answers[q.name] ?? q.default}
                                            onChange={(e) => setAnswers({ ...answers, [q.name]: parseInt(e.target.value) })}
                                        />
                                    )}
                                </Box>
                            ))
                        }
                    </Grid>
                </CardContent>
                <Divider />
                <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                    {/* Submit BOM request */}
                    <Button sx={{}} variant="contained" startIcon={<FileDownloadOutlined />} onClick={() => downloadBOM()}>
                        Download BOM
                    </Button>
                </CardContent>
            </Card>
        </BigBox>
    );
}
