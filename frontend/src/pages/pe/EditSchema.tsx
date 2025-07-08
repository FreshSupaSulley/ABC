import { useEffect, useState } from "react";
import api from "../../api";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import YamlEditor from "../../components/YamlEditor";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BigBox from "../../components/BigBox";
import PageTitle from "../../components/PageTitle";
import { Build, Hardware } from "@mui/icons-material";

export type QuestionType = 'integer' | 'boolean' | 'enum';

export interface ProcessedQuestion {
    name: string;
    type: QuestionType;
    prompt: string;
    default: number | boolean | string;
    choices?: (string | number)[];
}

export interface SchemaType {
    name: string;
    description: string;
    yaml: string;
    questions: ProcessedQuestion[];
}

function EditSchema() {
    const navigation = useNavigate();
    const { schemaId } = useParams();
    const [schema, setSchema] = useState<SchemaType | null>(null);

    // Deletion modal
    const [open, setOpen] = useState(false);
    const handleDelete = () => {
        // Close dialog
        setOpen(false);
        api.delete(`/api/schema/delete/${schemaId}`).then((res) => {
            if (res.status === 204) {
                navigation("/pe/schema");
            } else {
                alert("Failed to delete schema.");
            }
        });
    };

    const saveScript = (script: string) => {
        // Close dialog
        setOpen(false);
        api.patch(`/api/schema/${schemaId}`, { yaml: script }).then((res) => {
            alert("saved");
        }).catch(e => {
            alert("Failed to save schema");
            console.error(e);
        });
    };

    useEffect(() => {
        api.get<SchemaType>(`/api/schema/${schemaId}`)
            .then((res) => res.data)
            .then((data) => {
                console.log(data);
                setSchema(data);
            }).catch((err) => alert(err));
    }, [schemaId]);

    return (
        <BigBox>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigation("/pe/schema", { viewTransition: true })}>
                    Back
                </Button>
                {/* Title */}
                <PageTitle title={schemaId + ""} />
                <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => setOpen(true)}>
                    Delete
                </Button>
            </Box>
            {/* Main content */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', my: 2 }}>
                <TextField label="Description" variant="standard" fullWidth />
                <Button variant="outlined" startIcon={<Hardware />} onClick={() => navigation(`/build/${schemaId}`, { viewTransition: true })}>
                    Generate BOM
                </Button>
            </Box>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Delete Schema?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this schema? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Meat of ABC */}
            {!schema?.yaml ? <p>Loading...</p> : <YamlEditor script={schema.yaml} onSave={(script) => saveScript(script)} />}
        </BigBox>
    );
}

export default EditSchema;
