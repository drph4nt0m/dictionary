import type {GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType, NextPage} from 'next'
import {groupBy, transform, capitalize} from "lodash";
import {Fragment, ReactElement} from "react";
import {Howl} from "howler";
import {NextSeo} from 'next-seo';


// MUI
import {
    createTheme,
    CircularProgress,
    styled,
    Box,
    Card,
    CardContent,
    Grid,
    IconButton,
    Stack,
    Typography
} from "@mui/material";
import Tooltip, {TooltipProps, tooltipClasses} from '@mui/material/Tooltip';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';


const HtmlTooltip = styled(({className, ...props}: TooltipProps) => (
    <Tooltip {...props} classes={{popper: className}}/>
))(({theme}) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#191919',
        color: 'rgba(255, 255, 255, 0.87)',
        maxWidth: 300,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #0A0A0A',
    },
}));

const playHowler = (src: string) => {
    const sound = new Howl({
        src
    })

    sound.play();
}

type WordResponseT = {
    word: string,
    phonetic?: string,
    phonetics: {
        text: string,
        audio: string
    }[],
    origin?: string,
    meanings: {
        partOfSpeech?: string,
        definitions: {
            definition: string,
            example?: string,
            synonyms: string[],
            antonyms: string[]
        }[]
    }[]
}

type FlatDefinitionT = {
    partOfSpeech?: string,
    phonetic?: string,
    phoneticAudio?: string,
    definition: string,
    example?: string,
    synonyms: string[],
    antonyms: string[]
}

type GroupedDefinitionT = {
    partOfSpeech: string,
    definitions: FlatDefinitionT[]
}

const restructureData = (words: WordResponseT[]): GroupedDefinitionT[] => {
    const definitions = [];

    for (const word of words) {
        for (const meaning of word.meanings) {
            for (const definition of meaning.definitions) {
                definitions.push({
                    partOfSpeech: meaning.partOfSpeech,
                    phonetic: word.phonetic,
                    phoneticAudio: word.phonetics?.find((p) => p.text === word.phonetic)?.audio,
                    definition: definition.definition,
                    example: definition.example,
                    synonyms: definition.synonyms || [],
                    antonyms: definition.antonyms || []
                })
            }
        }
    }

    const groupedDefinitions = transform(groupBy(definitions, 'partOfSpeech'), (result: GroupedDefinitionT[], value, key) => {
        result.push({partOfSpeech: key || '', definitions: value});
    }, [])

    return groupedDefinitions;
}

const RenderDefinition = ({phonetic, phoneticAudio, definition, example, synonyms, antonyms}: FlatDefinitionT) => {
    return (
        <Grid container spacing={0} marginY={3}>
            <Grid item xs={2}>
                {phonetic &&
                    <Fragment>
                        {phoneticAudio &&
                            <IconButton
                                aria-label="listen"
                                onClick={() => playHowler(phoneticAudio)}
                            >
                                <VolumeUpIcon/>
                            </IconButton>
                        }
                        <Typography display="inline" color="text.secondary"> {phonetic} </Typography>
                    </Fragment>
                }
            </Grid>
            <Grid item xs={10}>
                <HtmlTooltip
                    title={
                        example || synonyms.length > 0 || antonyms.length > 0 ?
                            <Fragment>
                                {example ? <p><b>Example: </b>{example}</p> : ''}
                                {synonyms.length > 0 ? <p><b>Synonyms: </b>{synonyms.join(', ')}</p> : ''}
                                {antonyms.length > 0 ? <p><b>Antonyms: </b>{antonyms.join(', ')}</p> : ''}
                            </Fragment>
                            : 'No example, synonyms and antonyms'
                    }
                >
                    <Typography display="inline">{definition}</Typography>
                </HtmlTooltip>
            </Grid>
        </Grid>
    )
}

const RenderCard = ({partOfSpeech, definitions}: GroupedDefinitionT) => {
    return (
        <Card sx={{minWidth: 275}}>
            <CardContent>
                <Typography sx={{mb: 1.5}} color="text.secondary">
                    {partOfSpeech}
                </Typography>
                {
                    definitions.map((d, i) =>
                        <RenderDefinition
                            key={i} phonetic={d.phonetic}
                            phoneticAudio={d.phoneticAudio}
                            definition={d.definition}
                            example={d.example}
                            synonyms={d.synonyms}
                            antonyms={d.antonyms}/>
                    )
                }
            </CardContent>
        </Card>
    )
}

const Word: NextPage = ({data, word}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <Fragment>
            <NextSeo
                title={word}
                description="Meaning..."
                openGraph={{
                    url: `https://dict.rahl.me/${word}`,
                    title: word,
                    description: data[0].definitions[0].definition,
                    site_name: 'Dictionary',
                }}
            />
            <Stack spacing={2}>
                {
                    data.map((d: GroupedDefinitionT, i: number) =>
                        <RenderCard
                            key={i}
                            partOfSpeech={d.partOfSpeech}
                            definitions={d.definitions}/>
                    )
                }
            </Stack>
        </Fragment>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const word = context.params?.word || '';
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await res.json();
    if (res.status === 404) {
        return {
            notFound: true,
        }
    }
    const restructuredData = restructureData(data);
    return {
        props: JSON.parse(JSON.stringify({
            data: restructuredData,
            word: capitalize(word.toString())
        }))
    }
}

export default Word
