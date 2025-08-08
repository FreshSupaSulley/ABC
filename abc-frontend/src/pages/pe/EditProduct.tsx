import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLoading } from "../../components/LoadingContext";
import { useAPI } from "../../components/APIProvider";
import { Save } from "@mui/icons-material";
import PageTitle from "../../components/PageTitle";
import { NumericFormat } from "react-number-format";
import { SelectProduct } from "./Product";

export interface ProductType {
    part: string; // pk
    description: string;
    manufacturer: string; // fk
    classification: string; // fk
    device_role?: string; // fk
    list_price?: number;
    discount?: number;
}

function ProductPage() {
    const { setLoading } = useLoading();
    const api = useAPI();
    const { productId } = useParams();
    const [product, setProduct] = useState<ProductType>();

    // Select boxes
    const [manufacturers, setManufacturers] = useState<string[]>([]);
    const [classifications, setClassifications] = useState<string[]>([]);
    const [deviceRoles, setDeviceRoles] = useState<string[]>([]);

    useEffect(() => {
        setLoading(true);
        api.get("/api/manufacturer").then((res => setManufacturers(res.data.map((item: { name: any; }) => item.name))))
            .then(() => api.get("/api/classification").then(res => setClassifications(res.data.map((item: { name: any; }) => item.name))))
            // Device roles are optional!
            .then(() => api.get("/api/device-role").then(res => setDeviceRoles(res.data.map((item: { name: any; }) => item.name))))
            .then(() => api.get<ProductType>(`/api/product/${productId}`).then((res) => setProduct(res.data)))
            .catch(console.error);
    }, [productId]);

    return product ? <InnerContent product={product} productId={productId} manufacturers={manufacturers} classifications={classifications} deviceRoles={deviceRoles} /> : <Box sx={{ my: 4 }}><CircularProgress /></Box>
}

interface ContentType {
    product: ProductType;
    productId: string | undefined;
    manufacturers: string[];
    classifications: string[];
    deviceRoles: string[];
}

// To ensure schema is defined
const InnerContent: React.FC<ContentType> = ({ product: initProduct, productId, manufacturers, classifications, deviceRoles }) => {
    const api = useAPI();
    const { setLoading } = useLoading();
    const navigation = useNavigate();
    const [product, setProduct] = useState<ProductType>(initProduct);
    // Product fields
    const [part, setPart] = useState<string>(product.part);
    const [description, setDescription] = useState<string>(product.description);
    const [manufacturer, setManufacturer] = useState<string>(product.manufacturer);
    const [classification, setClassification] = useState<string>(product.classification);
    const [deviceRole, setDeviceRole] = useState<string | undefined>(product.device_role == null ? "None" : product.device_role); // we translate null -> "None" in the frontend, and back for API calls
    const [listPrice, setListPrice] = useState<number | undefined>(product.list_price);
    const [discount, setDiscount] = useState<number | undefined>(product.discount != undefined ? product.discount * 100 : undefined);
    // Deletion modal
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const handleDelete = () => {
        // Close dialog
        setOpenDeleteModal(false);
        api.delete(`/api/product/delete/${productId}`).then((res) => navigation("/pe/product")).catch(console.error);
    };

    const saveProduct = () => {
        setLoading(true);
        api.patch<ProductType>(`/api/product/${product.part}`, {
            // Rounding to keep it at max 4 decimal places
            part, description, manufacturer, classification, discount: discount != undefined ? Math.round(discount * 10000) / 1000000 : undefined,
            // Handle the underscores
            device_role: deviceRole == "None" ? null : deviceRole,
            list_price: listPrice,
        }).then((res) => {
            setProduct(res.data);
        }).catch(console.error).finally(() => setLoading(false));
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, my: 5, alignItems: 'center' }}>
            <title>Edit Product</title>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigation("/pe/product", { viewTransition: true })}>
                    Back
                </Button>
                {/* Title */}
                <PageTitle title={product.part} />
                <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => setOpenDeleteModal(true)}>
                    Delete
                </Button>
            </Box>
            {/* Main content */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', my: 2 }}>
                <TextField required fullWidth variant="standard" label="Manufacturer Part Number" placeholder="C8300-2N2S-4T2X" value={part} onChange={e => setPart(e.target.value)} />
                <TextField required fullWidth variant="standard" label="Description" placeholder="Cisco Catalyst C8300-2N2S-4T2X Router" value={description} onChange={e => setDescription(e.target.value)} />
                {/* Product properties */}
                <SelectProduct required title="manufacturer" link="manufacturer" value={manufacturer} options={manufacturers} onChange={(value) => setManufacturer(value)} />
                <SelectProduct required title="classification" link="classification" value={classification} options={classifications} onChange={(value) => setClassification(value)} />
                {/* Device roles are optional */}
                <SelectProduct title="device role" link="device-role" value={deviceRole} options={deviceRoles} onChange={(value) => setDeviceRole(value)} />
                {/* Money stuff */}
                <NumericFormat fullWidth value={listPrice} onValueChange={(e) => setListPrice(e.floatValue)} placeholder="$22,474.82" allowLeadingZeros={false} allowNegative={false} decimalScale={2} prefix="$" customInput={TextField} label="Listing Price" thousandSeparator />
                <NumericFormat fullWidth value={discount} onValueChange={(e) => setDiscount(e.floatValue)} placeholder="70.00%" allowLeadingZeros={false} allowNegative={false} isAllowed={(val) => val.floatValue! <= 100 && val.floatValue! >= 0} decimalScale={2} suffix="%" customInput={TextField} label="Discount" />
                {/* End props */}
                <Button fullWidth variant="contained" startIcon={<Save />} color="primary" disabled={product.part == part && product.description == description && product.classification == classification && product.device_role == deviceRole && product.manufacturer == manufacturer && product.list_price == listPrice && product.discount == discount} onClick={saveProduct}>
                    Save
                </Button>
            </Box>
            <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
                <DialogTitle>Delete Product?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this product? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteModal(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ProductPage;
