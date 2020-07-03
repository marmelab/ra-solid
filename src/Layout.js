import * as React from 'react';
import { Layout as DefaultLayout } from 'react-admin';

import { AppBar } from './AppBar';

export function Layout(props) {
    return <DefaultLayout {...props} appBar={AppBar} />;
};
