import { useEffect, useState } from "react";
import { useAPI } from "../../components/APIProvider";
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Snackbar, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BigBox from "../../components/BigBox";
import PageTitle from "../../components/PageTitle";
import ShapeLineIcon from '@mui/icons-material/ShapeLine';
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import DeleteIcon from "@mui/icons-material/Delete";
import { Edit, Save } from "@mui/icons-material";
import { useLoading } from "../../components/LoadingContext";
import { PatternType } from "./EditPattern";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export type PatternGroupType = {
    description: string;
    name: string;
};

// Unique to the get request
export type PatternListType = {
    deprecated: boolean;
    description: string;
    id: number;
    pattern_group: PatternGroupType;
    version: number;
}

type GroupedPatterns = {
    [key: string]: PatternListType[];
};

function Home() {
    const api = useAPI();
    const { loading } = useLoading();
    const navigation = useNavigate();

    // Descriptions for all pattern groups
    const [editPatternGroup, setEditPatternGroup] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDescriptionModal, setEditDescriptionModal] = useState(false);
    const [patterns, setPatterns] = useState<GroupedPatterns>({});

    // For creating pattern groups
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [deletePatternId, setDeletePatternId] = useState<string>();
    const [deleteModal, setDeleteModal] = useState(false);
    const [missingFields, setMissingFields] = useState<boolean>(false);

    const [createOpen, setCreateOpen] = useState(false);
    const [versionOpen, setVersionOpen] = useState(false);

    useEffect(() => {
        getPatterns();
    }, []);

    const getPatterns = () => {
        api.get<PatternListType[]>("/api/pattern").then((res) => {
            const patterns: PatternListType[] = res.data;
            // Group the patterns by name
            const grouped: GroupedPatterns = patterns.reduce((acc, pattern) => {
                const name = pattern.pattern_group.name;
                if (!acc[name]) {
                    acc[name] = []; // Initialize the array if it doesn't exist
                }
                acc[name].push(pattern); // Add the pattern to the corresponding name's array
                return acc;
            }, {} as GroupedPatterns);
            return grouped;
        }).then(setPatterns).catch(console.error);
    };

    const handleDelete = () => {
        setDeleteModal(false); // close dialog
        api.delete(`/api/pattern/delete/${deletePatternId}`).then(() => navigation("/pe/pattern")).finally(getPatterns); // finally, because if it fails i still wanna refresh
    };

    const createPattern = (version = false) => {
        if (!version && (!name || !description)) {
            setMissingFields(true);
            return;
        }
        setMissingFields(false); // safety net
        api.post("/api/pattern/create", {
            name, description
        }).then((res) => {
            navigation(`/pe/pattern/${res.data.id}`, { viewTransition: true });
        }).catch(console.error);
    };

    const saveDescription = () => {
        // Don't allow blank
        if (!editDescription) {
            return;
        }
        api.patch<PatternType>(`/api/pattern`, { name: editPatternGroup, description: editDescription }).then(() => {
            setEditDescriptionModal(false);
            // Reset data
            getPatterns();
        }).catch(console.error);
    }

    return (
        <BigBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <title>Patterns</title>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Title */}
                <PageTitle icon={<ShapeLineIcon fontSize="large" />} title="Patterns" />
                <Button variant='contained' onClick={() => {
                    setName("");
                    setCreateOpen(true)
                }}>
                    New Pattern
                </Button>
                {/* New pattern */}
                <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
                    <Snackbar open={missingFields} onClose={() => setMissingFields(false)} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert severity="warning" variant="filled">
                            All fields are required
                        </Alert>
                    </Snackbar>
                    <DialogTitle>Create Pattern</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            You'll be navigated to the edit screen after creation.
                            <br />
                            Name must be in the format <b>lowercase.lowercase...</b>
                        </DialogContentText>
                        <DialogContentText>
                            <br />
                            If you use a pattern name that already exists, it will create a new version of that pattern.
                        </DialogContentText>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 1 }}>
                            {/* Name will be autofilled if they're creating a new version */}
                            <TextField required fullWidth label="Name" placeholder="corporate.sdwan.large" variant="standard" value={name} onChange={e => setName(e.target.value)} />
                            <TextField required={!name} fullWidth label="Description" variant="standard" value={description} onChange={e => setDescription(e.target.value)} />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateOpen(false)} color="inherit">
                            Cancel
                        </Button>
                        <Button onClick={() => createPattern(false)} color="primary">
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* New version */}
                <Dialog open={versionOpen} onClose={() => setVersionOpen(false)}>
                    <DialogTitle>Create New Version for "{name}"</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            You'll be navigated to the edit screen after creation.
                        </DialogContentText>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 1 }}>
                            {/* Name will be autofilled if they're creating a new version */}
                            <TextField fullWidth label="New version description (optional)" variant="standard" value={description} onChange={e => setDescription(e.target.value)} />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setVersionOpen(false)} color="inherit">
                            Cancel
                        </Button>
                        {/* Name and description are already set at this point so its safe to call */}
                        <Button onClick={() => createPattern(true)} color="primary">
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Edit description */}
                <Dialog open={editDescriptionModal} onClose={() => setEditDescriptionModal(false)}>
                    <DialogTitle>"{editPatternGroup}" Description</DialogTitle>
                    <DialogContent>
                        <TextField fullWidth label="Description" variant="standard" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDescriptionModal(false)} color="inherit">
                            Cancel
                        </Button>
                        {/* Name and description are already set at this point so its safe to call */}
                        <Button sx={{ mb: 1 }} variant="contained" startIcon={<Save />} color="primary" disabled={loading || !editDescription} onClick={saveDescription}>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <p>Create, edit, and delete network patterns. You can create new versions of patterns and deprecate old ones.</p>
            {/* <RichTreeView onItemClick={(e, item) => item.startsWith('/') && navigate(item)} items={patterns} slots={{ item: CustomTreeItem }} /> */}
            {!loading && <SimpleTreeView>
                {Object.entries(patterns).length > 0 ? Object.entries(patterns).map((pattern, pIndex) =>
                    <>
                        <TreeItem itemId={`${pIndex}`} label={pattern[0]}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 4, mt: 1, mb: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                                    <Button variant="outlined" onClick={() => {
                                        // Always increment versions by 1
                                        setName(pattern[0]);
                                        setVersionOpen(true);
                                    }}>
                                        New Version
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => {
                                            // Guaranteed to have at least 1 element, so this should work fine
                                            setDeletePatternId(pattern[0]);
                                            setDeleteModal(true);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                                {/* Description showed below */}
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <TextField fullWidth label="Description" variant="outlined" value={pattern[1][0].pattern_group.description} slotProps={{
                                        input: {
                                            readOnly: true,
                                        },
                                    }} />
                                    <Button variant="contained" startIcon={<Edit />} color="primary" onClick={() => {
                                        setEditDescription(pattern[1][0].pattern_group.description);
                                        setEditPatternGroup(pattern[0]);
                                        setEditDescriptionModal(true)
                                    }}>
                                        Edit
                                    </Button>
                                </Box>
                                {/* Now show all versions */}
                                <List sx={{ border: 1, borderRadius: 2, overflow: 'hidden' }} dense subheader={<ListSubheader>Versions</ListSubheader>}>
                                    {pattern[1].map((item, index) =>
                                        <ListItemButton onClick={() => navigation(`/pe/pattern/${item.id}`)}>
                                            {item.deprecated && <>
                                                <ListItemIcon>
                                                    <VisibilityOffIcon />
                                                </ListItemIcon>
                                            </>}
                                            <ListItemText primary={`Version #${item.version}${item.deprecated ? ' — Deprecated' : ''}`} secondary={item.description} />
                                        </ListItemButton>
                                        // <TreeItem onClick={() => navigation(`/pe/pattern/${item.id}`)} itemId={`${pIndex}-${index}-label`} label={`Version #${item.version}`} />
                                    )}
                                </List>

                            </Box>
                        </TreeItem>
                    </>
                ) : (
                    <Card>
                        <CardContent>
                            <Typography textAlign='center'>
                                No patterns. Create one!
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </SimpleTreeView>}
            <Dialog open={deleteModal} onClose={() => setDeleteModal(false)}>
                <DialogTitle>Delete Pattern "{deletePatternId}"?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this pattern?
                    </DialogContentText>
                    <DialogContentText>
                        <b>All versions will be permanetly lost.</b> This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteModal(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </BigBox>
    );
}

export default Home;
