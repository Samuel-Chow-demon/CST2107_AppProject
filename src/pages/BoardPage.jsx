// BoardPage.jsx
import React, { useContext, useEffect, useState } from 'react';
import BoardNavbar from '../components/BoardNavbar';
import './BoardPage.css';
import { Box } from '@mui/material';
import { getCollectionDocByRefAndID } from '../components/DBUtility';
import { workSpaceCollectionRef } from '../fireStore/database';
import { useNavigate, useParams } from 'react-router-dom';
import userContext from '../context/userContext';
import { CONST_PATH } from '../components/front_end_constant';
import ProjectBoard from './ProjectBoard';
import { ProjectDBProvider } from '../context/projectDBContext';

const BoardPage = () => {

  const { id } = useParams(); // the WorkSpace id

  const navigate = useNavigate();

  const {_currentUser, setCurrentUser} = useContext(userContext);

  const [isGridLayout, setIsGridLayout] = useState(false);
  const [workSpaceData, setWorkSpaceData] = useState({});
  const [isLoadingWSData, SetLoadingWSData] = useState(false);

  const toggleLayout = () => {
    setIsGridLayout((prevLayout) => !prevLayout);
  };

  const retrieveWorkSpaceData = async()=>{

      const {docData} = await getCollectionDocByRefAndID(workSpaceCollectionRef, id);

      // If the path direction is wrong, the user do not belong to the workspace
      if (!docData.userUIDs.includes(_currentUser.uid))
      {
        // back to home
        navigate(CONST_PATH.home);
      }
      else
      {
        setWorkSpaceData(docData);
        SetLoadingWSData(false);
      }
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

    <ProjectDBProvider workingWorkSpaceID={id}>
      <Box sx={{
          display:'flex',
          flexDirection:'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>

          {  isLoadingWSData ?
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
            <>
              <BoardNavbar toggleLayout={toggleLayout} 
                            isGridLayout={isGridLayout}
                            workSpaceData={workSpaceData}
                            workspaceID={id}/>
              <ProjectBoard isGridLayout={isGridLayout} />
            </>
          }
      </Box>
    </ProjectDBProvider>
  );
};

export default BoardPage;
