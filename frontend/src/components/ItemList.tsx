import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Box, List, ListItemButton, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useNavigate } from 'react-router-dom';
import { SchemaType } from '../pages/pe/EditSchema';
import { ACCESS_TOKEN } from '../constants';

type ListProps<T> = {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    getItemUrl?: (item: T) => string;
    getFilterKey: (item: T) => string;
};

export default function ItemList<T>({ items, renderItem, getItemUrl, getFilterKey }: ListProps<T>) {
    const loggedIn = !!localStorage.getItem("accessToken");
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const filteredItems = useMemo(() => {
        const lower = search.toLowerCase();
        return items.filter(item =>
            getFilterKey(item).toLowerCase().includes(lower)
        );
    }, [items, search, getFilterKey]);

    return (
        <Box>
            <TextField
                fullWidth
                label="Filter"
                variant="outlined"
                size="small"
                margin="normal"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <Virtuoso
                style={{ height: 400, width: "100%" }}
                data={filteredItems}
                itemContent={(index, item) => {
                    const content = renderItem(item, index);
                    const url = getItemUrl ? getItemUrl(item) : undefined;

                    return (
                        <ListItem key={index} disablePadding>
                            {url ? (
                                <ListItemButton onClick={() => navigate(`${loggedIn ? '/pe' : ''}${url}`, { viewTransition: true })}>
                                    {content}
                                </ListItemButton>
                            ) : (content)}
                        </ListItem>
                    );
                }}
            />
        </Box>
    );
}