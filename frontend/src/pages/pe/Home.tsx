import StyledLink from "../../components/StyledLink";
import { useEffect, useState } from "react";
import api from "../../api";
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Box, Button, TextField, Typography } from "@mui/material";
import { Add, ExpandMore } from "@mui/icons-material";
import { Navigate, useNavigate } from "react-router-dom";
import SchemaList from "../../components/SchemaList";
import { SchemaType } from "./EditSchema";

function Home() {
    const [schemas, setNotes] = useState<SchemaType[]>([]);

    useEffect(() => {
        getNotes();
    }, []);

    const getNotes = () => {
        api.get<SchemaType[]>("/api/schema/")
            .then((res) => res.data)
            .then((data) => {
                console.log(data);
                setNotes(data);
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
    const navigation = useNavigate();

    const handleCreate = () => {
        if (!name || !description) {
            alert("Please fill out both fields.");
            return;
        }
        api.post("/api/schema/create", {
            name, description,
        }).then((res) => {
            if (res.status === 201) {
                navigation(`/pe/schema/${res.data.name}`);
            } else {
                alert("Failed to create schema");
            }
        }).catch((err) => alert(err));
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, my: 5 }}>
            {/* Title */}
            <Typography variant="h3">
                Admin Panel
            </Typography>

            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel3-content"
                    id="panel3-header">
                    <Typography component="span">Create Schema</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField required fullWidth label="Name" variant="standard" value={name} onChange={e => setName(e.target.value)} />
                        <TextField required fullWidth label="Description" variant="standard" value={description} onChange={e => setDescription(e.target.value)} />
                    </Box>
                </AccordionDetails>
                <AccordionActions>
                    <Button variant="contained" onClick={handleCreate}>Create</Button>
                </AccordionActions>
            </Accordion>

            {/* Show schema list */}
            <SchemaList schemas={schemas}></SchemaList>
        </Box>
    );
}

export default Home;
