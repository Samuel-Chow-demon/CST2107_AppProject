import React, { useContext, useEffect, useState } from 'react'
import { useNewsData } from '../context/newsContext.jsx'
import { Box, CircularProgress } from '@mui/material';
import { getNewsData } from '../api_services/api.js';
import NewsCard from '../lounge/components/NewsCard.jsx';
import NewsCardDetail from '../lounge/components/NewsCardDetail.jsx';
import { indigo } from '@mui/material/colors';
import NewsNavBar from '../lounge/components/NewsNavBar.jsx';

const NewsPage = () => {

    const [detailNewsData, setDetailNewsData] = useState({});

    const {
        newsData, setNewsData,
        curCategory, setCurCategory, isLoading, setIsLoading
      } = useNewsData();

    useEffect(()=>{

        const getGeneralNews = async() =>{

            await getNewsData(setNewsData, setCurCategory, 'general');
            setIsLoading(false);
        }

        getGeneralNews();

    }, [])

    const clickReadNewsDetail = (selectedNewsData)=>{
        setDetailNewsData(selectedNewsData);
    };

    const clickBack = ()=>{

        setIsLoading(false)
        const getPreviousNews = async() =>{

            await getNewsData(setNewsData, setCurCategory, curCategory);
            setIsLoading(false);
        }

        setIsLoading(true);
        setDetailNewsData({});
        getPreviousNews();
    }

  return (
    <>
        <NewsNavBar />
        {
            isLoading ?
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: indigo[200],
                width: '100%',
                height: '100%',
                padding: '20px'
            }}>
                <CircularProgress sx={{ size: 50 }} />
            </Box>
            :
            <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', padding:'10px',
                    width:'100%', height:'100%',
                    backgroundColor: indigo[200]}}>

                {
                    Object.keys(detailNewsData).length !== 0 ?
                    <NewsCardDetail newsData={detailNewsData} clickBack={clickBack}/>
                    :
                    <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap:'10px', rowGap:'20px', width: '100%'}}>

                        {
                            newsData.length > 0 && 
                            newsData.map((news, index)=>{
                                return (
                                    <NewsCard key={index} newsData={news} clickReadMore={clickReadNewsDetail}/>
                                )
                            })
                        }
                    </Box>
                }
            </Box>
        }
    </>
  )
}

export default NewsPage