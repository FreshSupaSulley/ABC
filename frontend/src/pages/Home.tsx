import { Box, Button, ListItemText, Typography } from "@mui/material";
import ItemList from "../components/ItemList";
import { useState, useEffect } from "react";
import api from "../api";
import { SchemaType } from "./pe/EditSchema";
import BigBox from "../components/BigBox";
import PageTitle from "../components/PageTitle";

export default function DrawerAppBar() {
    const [schemas, setSchemas] = useState<SchemaType[]>([]);

    useEffect(() => {
        getSchemas();
    }, []);

    const getSchemas = () => {
        api.get<SchemaType[]>("/api/schema/")
            .then((res) => res.data)
            .then((data) => {
                console.log(data);
                setSchemas(data);
            }).catch((err) => alert(err));
    };

    return (
        <BigBox>
            <PageTitle title="Generate a BOM" />
            <p>Select the network schema to generate a BOM for below:</p>

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
        </BigBox>
    );
}
