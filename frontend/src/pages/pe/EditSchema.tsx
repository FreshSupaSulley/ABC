import { useEffect, useState } from "react";
import api from "../../api";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import YamlEditor from "../../components/YamlEditor";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export interface SchemaType {
    name: string;
    description: string;
    yaml: string;
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
        fetch(`/api/schema/delete/${schemaId}`, {
            method: "DELETE",
        }).then((res) => {
            if (res.status === 204) {
                alert("Schema deleted");
                navigation("/pe");
            } else {
                alert("Failed to delete schema.");
            }
        });
    };

    useEffect(() => {
        api.get<SchemaType>(`/api/schema/${schemaId}`)
            .then((res) => res.data)
            .then((data) => {
                console.log(data);
                setSchema(data);
            }).catch((err) => alert(err));
    }, []);

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, my: 5, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigation("/pe/schema", { viewTransition: true })}>
                    Back
                </Button>
                {/* Title */}
                <Typography variant="h3" sx={{ textAlign: 'center' }}>
                    {schemaId}
                </Typography>
                <Button variant="contained" color="error" startIcon={<DeleteIcon />}>
                    Delete
                </Button>
            </Box>
            {/* Delete */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', my: 2 }}>
                <TextField label="Description" variant="standard" fullWidth />
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
            <YamlEditor />
        </Box>
    );
}

export default EditSchema;
