import { useEffect, useState } from "react";
import api from "../../api";
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Box, Button, Divider, ListItemText, TextField, Typography } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ItemList from "../../components/ItemList";
import { ProductType } from "./EditProduct";
import BigBox from "../../components/BigBox";

export default function Product() {
    const [products, setProducts] = useState<ProductType[]>([]);

    useEffect(() => {
        getNotes();
    }, []);

    const getNotes = () => {
        api.get<ProductType[]>("/api/product")
            .then((res) => res.data)
            .then((data) => {
                console.log(data);
                setProducts(data);
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

    const [sku, setSKU] = useState("");
    const [description, setDescription] = useState("");
    const [classification, setClassification] = useState("");
    const [gpl, setPrice] = useState("");
    const navigation = useNavigate();

    const handleCreate = () => {
        if (!sku || !description) {
            alert("Please fill out both fields.");
            return;
        }
        api.post("/api/product/create", {
            sku, description, classification, gpl
        }).then((res) => {
            if (res.status === 201) {
                navigation(`/pe/product/${res.data.name}`, { viewTransition: true });
            } else {
                alert("Failed to create product");
            }
        }).catch((err) => alert(err));
    };

    return (
        <BigBox>
            {/* Title */}
            <Typography variant="h4">
                Manage Products
            </Typography>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel3-content"
                    id="panel3-header">
                    <Typography component="span">Create Product</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField required fullWidth label="SKU (name)" variant="standard" value={sku} onChange={e => setSKU(e.target.value)} />
                        <TextField required fullWidth label="Description" variant="standard" value={description} onChange={e => setDescription(e.target.value)} />
                        <TextField required fullWidth label="Classification" variant="standard" value={classification} onChange={e => setClassification(e.target.value)} />
                        <TextField required fullWidth label="GPL (price)" variant="standard" value={gpl} onChange={e => setPrice(e.target.value)} />
                    </Box>
                </AccordionDetails>
                <AccordionActions>
                    <Button variant="contained" onClick={handleCreate}>Create</Button>
                </AccordionActions>
            </Accordion>
            {/* Show schema list */}
            <ItemList
                items={products}
                getItemUrl={(product) => `/pe/product/${product.sku}`}
                getFilterKey={(item) => item.sku}
                renderItem={(product) => (
                    <ListItemText
                        primary={product.sku}
                        secondary={product.description}
                    />
                )}
            />
        </BigBox>
    );
}
