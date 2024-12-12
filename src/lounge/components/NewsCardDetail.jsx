import React, { memo } from 'react'
import {Box, Chip, Link, Paper, Typography} from '@mui/material'
import { blue } from '@mui/material/colors';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

const NewsCardDetail = ({newsData, clickBack}) => {

    console.log(newsData);

    const {author, content, description, publishedAt, source, title, url, urlToImage} = newsData;
    const publishedDate = new Date(publishedAt);

    const authorString = author ? `By ${author}` : '';
    const sourceName = source.name ? source.name : 'N/A';
    const dateString = `At ${publishedDate.toGMTString()}`;
    const sourceString = `Source : ${sourceName}`;

    if (newsData)
    {
        return (        
            <Paper elevation={1}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 2,
                    padding: '10px',
                    width: '80%',
                    height: 'auto',
                    position: 'relative'
                }}>

                <Chip icon={<KeyboardDoubleArrowLeftIcon/>} label="Back" color="primary" 
                    sx={{fontSize:'20px', position:'absolute', top:'20px', left:'20px'}}
                    onClick={clickBack}/>

                {urlToImage &&
                    <Box
                        component="img"
                        sx={{
                            width: '50%',
                            height: '50%',
                            margin: '1px',
                            borderRadius: '8px',
                            objectFit: 'cover'
                        }}    
                    src={urlToImage} />
                }
    
                <Link href={url} target="_blank" variant='h4' sx={{marginY: '15px', marginX: '10px', textAlign:'justify', color:blue[900]}}>
                    {title}
                </Link>
    
                {authorString &&
                    <Typography sx={{textAlign:'left', fontSize:'22px', marginX:'10px'}}>
                        {authorString}
                    </Typography>
                }
    
                <Box sx={{display:'flex', flexDirection:'row', justifyContent:'space-around', marginTop: '10px'}}>
                    <Typography sx={{textAlign:'left', fontSize:'20px', marginX:'10px'}}>
                        {dateString}
                    </Typography>
                    <Typography sx={{textAlign:'left', fontSize:'20px', marginX:'10px'}}>
                        {sourceString}
                    </Typography>
                </Box>
    
                <Typography variant='h6' sx={{marginTop: '30px', textAlign:'justify'}}>
                    {description}
                </Typography>

                {
                    content &&
                        <Typography variant='h6' 
                            sx={{marginTop: '20px',
                                textAlign:'justify',
                                whiteSpace: 'normal',       // Allow text to wrap onto multiple lines
                                overflow: 'visible',        // Ensure no overflow clipping
                                textOverflow: 'unset'}}    // Remove ellipses if any}}
                        >
                            {content}
                        </Typography>
                }
    
            </Paper>
        )
    }
    else
    {
        return <></>;
    }
}

export default memo(NewsCardDetail)