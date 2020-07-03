import * as React from 'react';
import { Create, SimpleForm, TextInput } from 'react-admin';

export function ProductCreate(props) {
    return (
        <Create {...props}>
            <SimpleForm>
                <TextInput source="id" />
                <TextInput source="name" />
            </SimpleForm>
        </Create>
    )
}
