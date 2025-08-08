import { useEffect, useState } from "react";
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Snackbar, TextField } from "@mui/material";
import { useAPI } from "./APIProvider";
import BigBox from "./BigBox";
import PageTitle from "./PageTitle";
import { useNavigate } from "react-router-dom";
import { PropaneTankSharp } from "@mui/icons-material";
import ItemList from "./ItemList";
import DeleteIcon from '@mui/icons-material/Delete';

export interface ProductProperty {
    title: string;
    description: string;
    example: string;
    path: string;
    icon?: React.ReactNode
}

const Product: React.FC<ProductProperty> = (props) => {
    const navigate = useNavigate();
    const api = useAPI();
    const [items, setItems] = useState<string[]>([]);

    useEffect(() => {
        getSchemas();
    }, [navigate]);

    const [name, setName] = useState("");
    const [missingFields, setMissingFields] = useState(false);
    const [createModal, setCreateModal] = useState(false);

    // Delete
    const [deleteItem, setDeleteItem] = useState("");
    const [deleteModal, setDeleteModal] = useState(false);

    const getSchemas = () => {
        setName(''); // reset this, because it persists between inheritors
        api.get<any>(`/api/${props.path}`)
            .then((res) => res.data)
            .then((items) => setItems(items.map((item: { name: any; }) => item.name)))
            .catch(console.error);
    };

    const handleCreate = () => {
        if (!name) {
            setMissingFields(true);
            return;
        }
        setMissingFields(false); // safety net
        setCreateModal(false); // close modal
        api.post(`/api/${props.path}`, { name }).catch(console.error).finally(getSchemas);
    };

    const handleDelete = () => {
        setDeleteModal(false); // close modal
        api.delete(`/api/${props.path}/${deleteItem}`).catch(console.error).finally(getSchemas);
    }

    return (
        <BigBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Title */}
                <PageTitle icon={props.icon} title={`${props.title}s`} />
                {/* Create */}
                <Button variant='contained' onClick={() => setCreateModal(true)}>
                    New {props.title}
                </Button>
                <Dialog open={createModal} onClose={() => setCreateModal(false)}>
                    <Snackbar open={missingFields} onClose={() => setMissingFields(false)} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert severity="warning" variant="filled">
                            Fill out the field
                        </Alert>
                    </Snackbar>
                    <DialogTitle>New {props.title}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 1 }}>
                            <TextField required placeholder={props.example} fullWidth label="Name" variant="standard" value={name} onChange={e => setName(e.target.value)} />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateModal(false)} color="inherit">
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} color="primary">
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <p>{props.description}</p>
            <Dialog open={deleteModal} onClose={() => setDeleteModal(false)}>
                <DialogTitle>Delete {props.title.toLowerCase()} <b>{deleteItem}</b>?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this {props.title.toLowerCase()}? This action cannot be undone.
                        <br />
                        <br />
                        This will fail if any product is using this property.
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

            {/* Show schema list */}
            {/* MAKE GETITEMURL OPTIONAL */}
            <ItemList items={items} getSearchProp={(item) => item} renderItem={(schema) => (
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p>{schema}</p>
                    <IconButton sx={{ height: 'fit-content' }} onClick={() => {
                        setDeleteItem(schema);
                        setDeleteModal(true);
                    }}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )} />
        </BigBox>
    );
};

export default Product;
