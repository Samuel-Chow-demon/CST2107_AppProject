// BoardPage.jsx
import React, { useEffect, useState } from 'react';
import BoardNavbar from '../components/BoardNavbar';
import Board from '../components/Board';
import './BoardPage.css';
import { Box } from '@mui/material';
import { getCollectionDocByRefAndID } from '../components/DBUtility';
import { workSpaceCollectionRef } from '../fireStore/database';
import { useParams } from 'react-router-dom';

const BoardPage = () => {

  const { id } = useParams(); // the WorkSpace id

  const [isGridLayout, setIsGridLayout] = useState(false);
  const [workSpaceData, setWorkSpaceData] = useState({});
  const [isLoadingWSData, SetLoadingWSData] = useState(false);

  const toggleLayout = () => {
    setIsGridLayout((prevLayout) => !prevLayout);
  };

  const retrieveWorkSpaceData = async()=>{

      const {docData} = await getCollectionDocByRefAndID(workSpaceCollectionRef, id);
      setWorkSpaceData(docData);
      SetLoadingWSData(false);
  }

  useEffect(()=>{
    retrieveWorkSpaceData();
  }, [id])

  return (
    // <div className="board-page">
    //   <AppNavbar />
    //   <BoardNavbar toggleLayout={toggleLayout} isGridLayout={isGridLayout} />
    //   <div className="board-content">
    //     <Board isGridLayout={isGridLayout} />
    //   </div>
    // </div>

    <Box sx={{
        display:'flex',
        flexDirection:'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
      }}>
        <BoardNavbar toggleLayout={toggleLayout} 
                     isGridLayout={isGridLayout} 
                     boardName={workSpaceData.name}/>
        {
          isLoadingWSData ?
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: purple[50],
              width: '100%',
              height: '100%',
              padding: '20px'
          }}>
              <CircularProgress sx={{ size: 50 }} />
          </Box>
          :
          <Board isGridLayout={isGridLayout} 
                 bgImage={workSpaceData.img} 
                 bkgrdColor={workSpaceData.bkgrdColor} />
        }
    </Box>
  );
};

export default BoardPage;
