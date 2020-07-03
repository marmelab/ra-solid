import * as React from 'react'
import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Divider,
    List,
    ListItem,
    ListItemText,
    Typography,
} from '@material-ui/core';
import { useLDflexValue, useLDflexList } from '@solid/react';
import { ValueFromLDflexObject } from './solid/ValueFromLDflexObject';


export function Dashboard() {
    const userName = useLDflexValue('user.name');
    const photo = useLDflexValue('user.vcard_hasPhoto');
    const email = useLDflexValue('user.vcard_hasEmail');
    const trustedApps = useLDflexList('user.acl_trustedApp');

    return (
        <>
            <Card>
                <CardHeader
                    avatar={<Avatar src={photo ? photo.toString() : ''} />}
                    title={`${userName}`}
                    subheader={email ? email.toString() : ''}
                />
                <Divider />
                <CardContent>
                    <Typography variant="h3">Your Trusted Applications</Typography>
                    <List>
                        {!!trustedApps && trustedApps.map(trustedApp => (
                            <ListItem key={trustedApp.toString()}>
                                <ListItemText
                                    primary={<ValueFromLDflexObject object={trustedApp} path="origin" />}
                                    secondary={<ValueFromLDflexObject object={trustedApp} path="mode" />}
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </>
    )
}
