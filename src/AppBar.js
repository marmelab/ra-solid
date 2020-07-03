import * as React from 'react'
import { AppBar as DefaultAppBar } from 'react-admin';

import { UserMenu } from './UserMenu';

export function AppBar(props) {
    return <DefaultAppBar {...props} userMenu={<UserMenu /> } />;
}