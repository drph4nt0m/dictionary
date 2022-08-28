import '../styles/globals.css'
import type {AppProps} from 'next/app'
import {Container, createTheme, ThemeProvider} from "@mui/material";
import { DefaultSeo } from 'next-seo';

import SEO from '../next-seo.config';


function MyApp({Component, pageProps}: AppProps) {
    const theme = createTheme({
        palette: {
            mode: 'dark',
        },
    })

    return (
        <Container>
            <DefaultSeo {...SEO} />
            <ThemeProvider theme={theme}>
                <Container maxWidth="md" sx={{marginY: 5}}>
                    <Component {...pageProps} />
                </Container>
            </ThemeProvider>
        </Container>
    )
}

export default MyApp
