import { Button, ListItemText } from "@mui/material";
import ItemList from "../components/ItemList";
import { useState, useEffect } from "react";
import api from "../api";
import { SchemaType } from "./pe/EditSchema";

export default function DrawerAppBar() {
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

    return (
        <div>
            <h1>Generate a BOM</h1>
            <p>Select the network schema to generate a BOM for:</p>

            {/* Show schema list */}
            <ItemList
                items={schemas}
                getItemUrl={(schema) => `/build/${schema.name}`}
                getFilterKey={(item) => item.name}
                renderItem={(schema) => (
                    <ListItemText
                        primary={schema.name}
                        secondary={schema.description}
                    />
                )}
            />
        </div>
    );
}
