import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Box, List, ListItemButton, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useNavigate } from 'react-router-dom';
import { SchemaType } from '../pages/pe/EditSchema';

type SchemaListProps = {
    schemas: SchemaType[];
};

const SchemaList: React.FC<SchemaListProps> = ({ schemas }) => {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    // Filter schemas by search input
    const filteredSchemas = useMemo(() => {
        const lower = search.toLowerCase();
        return schemas.filter(schema => schema.name.toLowerCase().includes(lower));
    }, [schemas, search]);

    return (
        <Box>
            <TextField
                fullWidth
                label="Search schemas"
                variant="outlined"
                size="small"
                margin="normal"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <Virtuoso
                style={{ height: 400, width: '100%' }}
                data={filteredSchemas}
                itemContent={(index, schema) => (
                    <ListItem key={index} disablePadding>
                        <ListItemButton onClick={() => navigate(`/admin/schema/${schema.name}`, { viewTransition: true })}>
                            <ListItemText
                                primary={schema.name}
                                secondary={schema.description}
                            />
                        </ListItemButton>
                    </ListItem>
                )}
            />
        </Box>
    );
};

export default SchemaList;
