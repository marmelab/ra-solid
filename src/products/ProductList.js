import * as React from 'react';
import { List, Datagrid, TextField } from 'react-admin';

export function ProductList(props) {
    return (
        <List {...props}>
            <Datagrid>
                <TextField source="id" />
                <TextField source="name" />
            </Datagrid>
        </List>
    )
}

