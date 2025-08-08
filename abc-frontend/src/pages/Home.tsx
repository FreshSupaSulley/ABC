import { Box, ListItemText, Typography } from "@mui/material";
import ItemList from "../components/ItemList";
import { useState, useEffect } from "react";
import BigBox from "../components/BigBox";
import PageTitle from "../components/PageTitle";
import { useAPI } from "../components/APIProvider";
import { PatternListType } from "./pe/Pattern";
import React from "react";

export default function DrawerAppBar() {
    const api = useAPI();
    const [patterns, setPatterns] = useState<PatternListType[]>([]);

    useEffect(() => {
        getSchemas();
    }, []);

    const getSchemas = () => {
        api.get<PatternListType[]>("/api/pattern").then((res) => res.data).then(setPatterns).catch(console.error);
    };

    return (
        <BigBox>
            <Box sx={{ textAlign: 'center' }}>
                <PageTitle title="Build a BOM" />
                <p>Select the network pattern to generate a BOM for:</p>
            </Box>
            {/* Show pattern list */}
            <ItemList
                items={patterns}
                getItemUrl={(pattern) => `/build/${pattern.id}`}
                getSearchProp={(item) => item.pattern_group.name}
                filter={item => !item.deprecated}
                renderItem={(pattern) => (
                    <>
                        <ListItemText
                            primary={
                                <React.Fragment>
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        sx={{ color: 'text.primary', display: 'inline' }}
                                    >
                                        {pattern.pattern_group.name}{pattern.version != 1 && ` — Version #${pattern.version}`}
                                    </Typography>
                                </React.Fragment>
                            }
                            // Fallback to pattern group description if not overriden by version
                            secondary={pattern.description || pattern.pattern_group.description}
                        />
                    </>
                )}
            />
        </BigBox>
    );
}
