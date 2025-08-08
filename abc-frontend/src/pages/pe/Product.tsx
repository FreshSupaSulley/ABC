import { useEffect, useState } from "react";
import { useAPI } from "../../components/APIProvider";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, ListItemText, MenuItem, Select, Snackbar, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ItemList from "../../components/ItemList";
import BigBox from "../../components/BigBox";
import PageTitle from "../../components/PageTitle";
import { ProductType } from "./EditProduct";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { NumericFormat } from "react-number-format";

export default function Home() {
    const api = useAPI();
    const [products, setProducts] = useState<ProductType[]>([]);

    useEffect(() => {
        // Get allowed optionns
        api.get("/api/manufacturer").then((res => setManufacturers(res.data.map((item: { name: any; }) => item.name))))
            .then(() => api.get("/api/classification").then(res => setClassifications(res.data.map((item: { name: any; }) => item.name))))
            .then(() => api.get("/api/device-role").then(res => setDeviceRoles(res.data.map((item: { name: any; }) => item.name))))
            .then(() => api.get<ProductType[]>("/api/product").then((res) => setProducts(res.data)))
            .catch(console.error);
    }, []);

    // Product fields
    const [part, setPart] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    // Select boxes
    const [manufacturers, setManufacturers] = useState<string[]>([]);
    const [classifications, setClassifications] = useState<string[]>([]);
    const [deviceRoles, setDeviceRoles] = useState<string[]>([]);
    // Answers
    const [manufacturer, setManufacturer] = useState<string>('');
    const [classification, setClassification] = useState<string>('');
    const [deviceRole, setDeviceRole] = useState<string | undefined>("None");
    const [listPrice, setListPrice] = useState<number | undefined>(0);
    const [discount, setDiscount] = useState<number | undefined>(0);
    // Etc
    const [missingFields, setMissingFields] = useState<boolean>(false);
    const navigation = useNavigate();
    const [open, setOpen] = useState(false);

    const handleCreate = () => {
        // You MUST fill out these fields. Everything else is optional
        if (!part || !description || !manufacturer || !classification) {
            setMissingFields(true);
            return;
        }
        setMissingFields(false); // safety net
        api.post("/api/product/create", {
            part, description, manufacturer, classification, discount: discount !== undefined ? discount / 100 : undefined,
            // Handle the underscores
            device_role: deviceRole === "None" ? null : deviceRole, // this logic is similar in EditProduct
            list_price: listPrice,
        }).then((res) => {
            navigation(`/pe/product/${res.data.part}`, { viewTransition: true });
        }).catch(console.error);
    };

    return (
        <BigBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <title>Products</title>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Title */}
                <PageTitle icon={<ShoppingCartIcon fontSize="large" />} title="Products" />
                {/* Create product */}
                <Button variant='contained' onClick={() => setOpen(true)}>
                    New Product
                </Button>
                <Dialog fullWidth open={open} onClose={() => setOpen(false)}>
                    <Snackbar open={missingFields} onClose={() => setMissingFields(false)} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert severity="warning" variant="filled">
                            Fill out all required fields
                        </Alert>
                    </Snackbar>
                    <DialogTitle>Create Product</DialogTitle>
                    <DialogContent>
                        <p>Fields marked with * are required.</p>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField required fullWidth variant="standard" label="Manufacturer Part Number" placeholder="C8300-2N2S-4T2X" value={part} onChange={e => setPart(e.target.value)} />
                            <TextField required fullWidth variant="standard" label="Description" placeholder="Cisco Catalyst C8300-2N2S-4T2X Router" value={description} onChange={e => setDescription(e.target.value)} />
                            {/* Product properties */}
                            <SelectProduct required title="manufacturer" link="manufacturer" value={manufacturer} options={manufacturers} onChange={(value) => setManufacturer(value)} />
                            <SelectProduct required title="classification" link="classification" value={classification} options={classifications} onChange={(value) => setClassification(value)} />
                            {/* Device roles are optional */}
                            <SelectProduct title="device role" link="device-role" value={deviceRole} options={deviceRoles} onChange={(value) => setDeviceRole(value)} />
                            {/* Money stuff */}
                            <NumericFormat fullWidth value={listPrice} onValueChange={(e) => setListPrice(Number(e.value))} placeholder="$22,474.82" allowLeadingZeros={false} allowNegative={false} decimalScale={2} prefix="$" customInput={TextField} label="Listing Price" thousandSeparator />
                            <NumericFormat fullWidth value={discount} onValueChange={(e) => setDiscount(Number(e.value))} placeholder="70.00%" allowLeadingZeros={false} allowNegative={false} isAllowed={(val) => Number(val.value) <= 100 && Number(val.value) >= 0} decimalScale={2} suffix="%" customInput={TextField} label="Discount" />
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

            {/* Show product list */}
            <ItemList
                items={products}
                getItemUrl={(product) => `/pe/product/${product.part}`}
                getSearchProp={(item) => item.part}
                renderItem={(product) => (
                    <ListItemText
                        primary={product.part}
                        secondary={product.description}
                    />
                )}
            />
        </BigBox >
    );
}

export interface SelectProductProperty {
    required?: boolean;
    title: string;
    link: string;
    value: any;
    options: string[];
    onChange: (value: string) => any;
}

// Exported because we rely on this in the EditProduct screen too
export const SelectProduct: React.FC<SelectProductProperty> = (props) => {
    const navigation = useNavigate();
    return <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        {/* Disable the box if there's nothing to select */}
        {/* Only set error = true IF it's required and there's no options to pick */}
        <FormControl disabled={!props.options.length} fullWidth required={props.required} error={!props.options.length && props.required}>
            <InputLabel>{(!props.options.length ? `No options for ` : '') + props.title.substring(0, 1).toUpperCase() + props.title.substring(1)}</InputLabel>
            <Select label={props.title.substring(0, 1).toUpperCase() + props.title.substring(1)} fullWidth value={props.value} onChange={(e) => props.onChange(e.target.value)} renderValue={(selected) => {
                return selected === "None" ? <span style={{ fontWeight: 'bold' }}>No value</span> : selected;
            }}>
                {props.options.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                {/* If it's not required, you can set it to null */}
                {!props.required && <MenuItem value="None">None</MenuItem>}
            </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={() => navigation(`/pe/product/${props.link}`)}>
            Create
        </Button>
    </Box>
}
