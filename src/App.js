import * as React from "react";
import { Admin, Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider, LoginPage } from './authentication';
import { Dashboard } from './Dashboard';
import { Layout } from "./Layout";

export const App = () => (
  <Admin
    authProvider={authProvider}
    dashboard={Dashboard}
    dataProvider={dataProvider}
    layout={Layout}
    loginPage={LoginPage}
  >
    <Resource name="test" />
  </Admin>
);
