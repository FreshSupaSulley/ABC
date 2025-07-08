import StyledLink from "../../components/StyledLink";
import { useEffect, useState } from "react";
import api from "../../api";
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, ListItemText, Snackbar, TextField, Typography } from "@mui/material";
import { Add, ExpandMore } from "@mui/icons-material";
import { Navigate, useNavigate } from "react-router-dom";
import { SchemaType } from "./EditSchema";
import ItemList from "../../components/ItemList";
import BigBox from "../../components/BigBox";
import PageTitle from "../../components/PageTitle";

function Home() {
    const [schemas, setSchemas] = useState<SchemaType[]>([]);

    useEffect(() => {
        getSchemas();
    }, []);

    const getSchemas = () => {
        api.get<SchemaType[]>("/api/schema")
            .then((res) => res.data)
            .then((data) => {
                console.log(data);
                setSchemas(data);
            }).catch((err) => alert(err));
    };

    // const createNote = () => {
    //     api
    //         .post("/api/schema/create", { content, title })
    //         .then((res) => {
    //             if (res.status === 201) alert("Note created!");
    //             else alert("Failed to make note.");
    //             getNotes();
    //         })
    //         .catch((err) => alert(err));
    // };

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [missingFields, setMissingFields] = useState<boolean>(false);
    const navigation = useNavigate();
    const [open, setOpen] = useState(false);

    const handleCreate = () => {
        if (!name || !description) {
            setMissingFields(true);
            return;
        }
        setMissingFields(false); // safety net
        api.post("/api/schema/create", {
            name, description,
        }).then((res) => {
            if (res.status === 201) {
                navigation(`/pe/schema/${res.data.name}`, { viewTransition: true });
            } else {
                alert("Failed to create schema");
            }
        }).catch((err) => alert(err));
    };

    return (
        <BigBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Title */}
                <PageTitle title="Manage Schemas" />
                {/* Create schema */}
                <Button variant='contained' onClick={() => setOpen(true)}>
                    New Schema
                </Button>
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <Snackbar open={missingFields} onClose={() => setMissingFields(false)} autoHideDuration={3000} message="Fill out both fields" anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert severity="warning" variant="filled">
                            Both fields are required
                        </Alert>
                    </Snackbar>
                    <DialogTitle>Create Schema</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            You'll be navigated to the edit screen after creation.
                        </DialogContentText>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 1 }}>
                            <TextField required fullWidth label="Name" variant="standard" value={name} onChange={e => setName(e.target.value)} />
                            <TextField required fullWidth label="Description" variant="standard" value={description} onChange={e => setDescription(e.target.value)} />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)} color="inherit">
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} color="primary">
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>

            {/* Show schema list */}
            <ItemList
                items={schemas}
                getItemUrl={(schema) => `/pe/schema/${schema.name}`}
                getFilterKey={(item) => item.name}
                renderItem={(schema) => (
                    <ListItemText
                        primary={schema.name}
                        secondary={schema.description}
                    />
                )}
            />
        </BigBox>
    );
}

export default Home;
