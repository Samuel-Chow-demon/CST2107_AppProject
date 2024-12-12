import { Box, Card, CardContent, Typography } from '@mui/material';
import { indigo, purple } from '@mui/material/colors';
import {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import newsbkgrd from '../assets/breaking_news.avif';
import { CONST_PATH } from '../components/front_end_constant';
import { NewsDataProvider } from '../context/newsContext';

const LoungeBoard = () => {

    const navigate = useNavigate();

    const navigateAction = (path)=>{
        navigate(path);
    }

    const LoungeCardComponent = ({ name, path, bkgrd="" }) => {

        return (
            <>
                <Card sx={{
                    position: 'relative',
                    width: '15rem',
                    height: '15rem',
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                        boxshadow: 6,
                        transform: 'scale(1.1)'
                    }
                    }}
                    onClick={() => navigateAction(path)}
                    >

                    <Box
                        sx={{
                            height: '70%',
                            backgroundColor: purple[300],
                            backgroundImage: bkgrd ? `url(${bkgrd})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                    <CardContent>
                        {/* <Typography gutterBottom variant="h5" component="div">
                            Project
                        </Typography> */}
                        <Typography gutterBottom variant="h5" sx={{ color: 'text.secondary', textAlign:'center' }}>
                            {name}
                        </Typography>
                    </CardContent>
                </Card>
            </>);
    }

  return (
    // <NewsDataProvider>
        <div style={{display:'flex', width:'100%', height:'100%', gap:'5rem', padding:'2rem', backgroundColor:indigo[200]}}>
            
            {/* "/home/lounge/news" */}
            <LoungeCardComponent name={"News Headlines"} path={CONST_PATH.home + CONST_PATH.loungeNews}
                                bkgrd={newsbkgrd}/>
        </div>
    // </NewsDataProvider>
  )
}

export default LoungeBoard