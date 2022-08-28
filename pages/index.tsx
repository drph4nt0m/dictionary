import type {NextPage} from 'next'
import {useRouter} from 'next/router'
import {ChangeEvent, useState} from "react";

// MUI
import {Box, Button, TextField} from "@mui/material";

const Home: NextPage = () => {
    const router = useRouter()

    const [word, setWord] = useState('');
    const handleWordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setWord(event.target.value);
    };

    const searchWord = async (event: any) => {
        event.preventDefault()
        await router.push(`/${event.target.word.value}`)
    }

    return (
        <form onSubmit={searchWord}>
            <Box sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
            <TextField id="word" label="Search for a word" margin="normal" value={word} onChange={handleWordChange} autoFocus={true}/>
            <Button variant="contained" type="submit" >Search</Button>
            </Box>
        </form>
    )
}

export default Home
