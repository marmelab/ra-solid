import * as React from "react";
import { UserMenu as DefaultUserMenu } from 'react-admin';
import { useLDflexValue } from "@solid/react";
import { Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

export function UserMenu(props) {
    const classes = useStyles();
    const user = useLDflexValue('user.name');
    const photo = useLDflexValue('user.vcard_hasPhoto');

    return (
        <DefaultUserMenu
            {...props}
            label={`${user}`}
            icon={
                <Avatar
                    className={classes.avatar}
                    src={`${photo}`}
                />
            }
        />
    );
}

const useStyles = makeStyles(theme => ({
    avatar: {
        width: theme.typography.pxToRem(24),
        height: theme.typography.pxToRem(24),
    }
}))
