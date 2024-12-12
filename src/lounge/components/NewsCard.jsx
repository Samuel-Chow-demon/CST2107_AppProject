import React, { memo } from 'react'
import {Box, Chip, Link, Paper, Typography} from '@mui/material'
import { blue, green, grey } from '@mui/material/colors';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

const NewsCard = ({newsData, clickReadMore}) => {

    //console.log(newsData);

    const {author, content, description, publishedAt, source, title, url, urlToImage} = newsData;
    const publishedDate = new Date(publishedAt);

    const authorList = author ? author.split(",") : [];
    const sourceName = source.name ? source.name : 'N/A';
    const dateString = `At ${publishedDate.toGMTString()}`;
    const sourceString = `Source : ${sourceName}`;

    if (newsData)
    {
        return (        
            <Paper elevation={8}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 2,
                    padding: '10px',
                    width: 'auto',
                    height: 'auto'
                }}>

                {urlToImage &&
                    <Box
                        component="img"
                        sx={{
                            width: '60%',
                            height: 'auto',
                            margin: '1px',
                            borderRadius: '8px',
                            objectFit: 'cover'
                        }}    
                    src={urlToImage} />
                }

                <Link href={url} target="_blank" variant='h6' sx={{fontSize:'20px' ,marginY: '15px', marginX: '10px', textAlign:'justify', color:blue[900]}}>
                    {title}
                    <Chip icon={<KeyboardDoubleArrowRightIcon/>} label="Read More"
                    sx={{fontSize:'12px', marginLeft:'0.5rem',
                        backgroundColor:grey[200],
                        '&:hover':{
                            backgroundColor:blue[300]
                        }    
                    }}
                    onClick={(e)=>{
                        e.preventDefault();
                        e.stopPropagation();
                        clickReadMore(newsData);
                    }}/>
                </Link>
    
                <Box sx={{display:'inline-flex', justifyContent:'space-between', alignItems:'center'}}>
                    {authorList &&
                        <Box sx={{display:'flex', flexDirection:'row', justifyContent:'space-around', marginRight:'1rem'}}>
                            {
                                authorList.map((author, index)=>{
                                    return(
                                        <Chip key={index} label={author} sx={{margin: '5px', fontSize:'12px', backgroundColor:grey[400]}} />
                                    );
                                })
                            }
                        </Box>
                    }
                    <Box sx={{display:'flex', flexDirection:'row', justifyContent:'space-around', marginTop: '10px'}}>
                        <Typography sx={{textAlign:'left', fontSize:'11px', marginX:'10px'}}>
                            {dateString}
                        </Typography>
                        <Typography sx={{textAlign:'left', fontSize:'11px', marginX:'10px'}}>
                            {sourceString}
                        </Typography>
                    </Box>
                </Box>
    
    
                {/* <Typography variant='body1' sx={{marginTop: '10px', textAlign:'justify'}}>
                    {description}
                </Typography> */}
    
            </Paper>
        )
    }
    else
    {
        return <></>;
    }
}

export default memo(NewsCard)