import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ListItemText, MenuItem, Select, TextField, Typography } from "@mui/material";
import ItemList from "../components/ItemList";
import { useState, useEffect } from "react";
import api from "../api";
import { SchemaType } from "./pe/EditSchema";
import { useNavigate, useParams } from "react-router-dom";
import YamlEditor from "../components/YamlEditor";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FileDownloadOutlined } from "@mui/icons-material";

export default function Build() {
    const navigation = useNavigate();
    const { schemaId } = useParams();
    const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
    const [schema, setSchema] = useState<SchemaType | null>(null);

    // Deletion modal
    const [open, setOpen] = useState(false);
    const downloadBOM = () => {
        // Close dialog
        setOpen(false);
        api.post(`/api/schema/${schemaId}/bom`, { answers: answers }, { responseType: 'blob' }).then((res) => {
            const blob = new Blob([res.data], { type: res.headers['content-type'] });

            // Get filename from the header
            const contentDisposition = res.headers['content-disposition'];
            let filename = 'bom.xlsx';
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
        <Box sx={{ width: '100%', maxWidth: 1000, my: 5, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', mb: 2 }}>
                {/* Back button aligned left */}
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigation("/", { viewTransition: true })} sx={{ position: 'absolute', left: 0 }}>
                    Back
                </Button>
                {/* Centered title */}
                <Typography variant="h3" sx={{ margin: '0 auto' }}>
                    {schemaId}
                </Typography>
            </Box>
            {/* Render questions */}
            {!schema?.questions ? <p>BOM is not yet complete.</p> :
                schema?.questions?.map((q) => (
                    <Box key={q.name} sx={{ mb: 2 }}>
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
            {/* Submit BOM request */}
            <Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={() => downloadBOM()}>
                Download BOM
            </Button>
        </Box>
    );
}
