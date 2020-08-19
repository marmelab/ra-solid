import * as React from 'react';
import { Create, SimpleForm, TextInput, NumberInput } from 'react-admin';

export function ProductCreate(props) {
    return (
        <Create {...props}>
            <SimpleForm>
                <TextInput source="name" />
                <NumberInput source="width" />
                <NumberInput source="height" />
            </SimpleForm>
        </Create>
    )
}
