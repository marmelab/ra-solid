import * as React from 'react';
import { Edit, SimpleForm, TextInput, NumberInput } from 'react-admin';

export function ProductEdit(props) {
    return (
        <Edit {...props}>
            <SimpleForm>
                <TextInput readOnly source="identifier" />
                <TextInput source="name" />
                <NumberInput source="width" />
                <NumberInput source="height" />
            </SimpleForm>
        </Edit>
    )
}
