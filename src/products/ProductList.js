import * as React from 'react';
import { List, Datagrid, TextField, Filter, SearchInput, TextInput, NumberField, NumberInput, EditButton } from 'react-admin';

const ProductFilter = props => (
    <Filter {...props}>
        <SearchInput source="q" alwaysOn />
        <TextInput source="name" alwaysOn />
        <NumberInput source="width" alwaysOn />
    </Filter>
)

export function ProductList(props) {
    return (
        <List {...props} filters={<ProductFilter />}>
            <Datagrid>
                <TextField source="identifier" label="Id" />
                <TextField source="name" />
                <NumberField source="width" />
                <NumberField source="height" />
                <EditButton />
            </Datagrid>
        </List>
    )
}

