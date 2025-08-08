import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import { Box, Card, CardContent, CircularProgress, ListItemButton, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useNavigate } from 'react-router-dom';
import { useLoading } from './LoadingContext';

type ListProps<T> = {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    loading?: boolean;
    getItemUrl?: (item: T) => string;
    getSearchProp: (item: T) => any;
    filter?: (item: T) => boolean;
};

export default function ItemList<T>({ items, renderItem, loading, getItemUrl, getSearchProp, filter }: ListProps<T>) {
    const { loading: globalLoading } = useLoading();
    const loggedIn = !!localStorage.getItem("accessToken");
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const filteredItems = useMemo(() => {
        const lower = search.toLowerCase();
        return items.filter(item =>
            `${getSearchProp(item)}`.toLowerCase().startsWith(lower) && (filter ? filter(item) : true)
        );
    }, [items, search, getSearchProp]);

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
                components={{
                    EmptyPlaceholder: () => {
                        return (loading !== undefined ? loading : globalLoading) ? <Box sx={{ justifySelf: 'center', py: 2 }}><CircularProgress /></Box> : (
                            <Card>
                                <CardContent>
                                    {/* By default it's body1 variant that's also a p tag */}
                                    <Typography textAlign='center'>
                                        No results
                                    </Typography>
                                </CardContent>
                            </Card>
                        );
                    }
                }}
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