import * as React from 'react';
import { Avatar, Button, Card, CardContent } from '@material-ui/core';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import LockIcon from '@material-ui/icons/Lock';
import auth from 'solid-auth-client';
import { useHistory } from 'react-router-dom';
import { defaultTheme, Notification } from 'react-admin';

const popupUri = `${process.env.PUBLIC_URL}/popup.html`;

const theme = createMuiTheme(defaultTheme);

export function LoginPage() {
    return (
        <ThemeProvider theme={theme}>
            <LoginContent />
        </ThemeProvider>
    );
}

function LoginContent(props) {
    const history = useHistory();
    const classes = useStyles(props);
    
    const handleLogin = () => {
        auth.popupLogin({ popupUri })
            .then(() => {
                history.push('/');
            })
            .catch(() => {
    
            });
    };

    return (
        <div className={classes.root}>
            <Card className={classes.card}>
                <CardContent className={classes.content}>
                    <Avatar className={classes.icon}>
                        <LockIcon />
                    </Avatar>
                </CardContent>
                <CardContent className={classes.content}>
                    <Button
                        onClick={handleLogin}
                        size="large"
                        color="primary"
                        variant="contained"
                    >
                        Sign in
                    </Button>
                </CardContent>
            </Card>
          <Notification />
        </div>
    );
}

const useStyles = makeStyles(
    theme => ({
        root: {
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            height: '1px',
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundImage:
                'radial-gradient(circle at 50% 14em, #313264 0%, #00023b 60%, #00023b 100%)',
        },
        card: {
            minWidth: 300,
            marginTop: '6em',
        },
        content: {
            margin: '1em',
            display: 'flex',
            justifyContent: 'center',
        },
        icon: {
            backgroundColor: theme.palette.secondary[500],
        },
    })
);