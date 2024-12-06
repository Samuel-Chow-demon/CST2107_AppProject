// BoardPage.jsx
import React, { useContext, useEffect, useState } from 'react';
import BoardNavbar from '../components/BoardNavbar';
import './BoardPage.css';
import { Box, CircularProgress } from '@mui/material';
import { getCollectionDocByRefAndID } from '../components/DBUtility';
import { projectCollectionRef, workSpaceCollectionRef } from '../fireStore/database';
import { useNavigate, useParams } from 'react-router-dom';
import userContext from '../context/userContext';
import { CONST_PATH } from '../components/front_end_constant';
import ProjectBoard from './ProjectBoard';
import { ProjectDBProvider } from '../context/projectDBContext';
import { StateDBProvider } from '../context/stateDBContext';
import { TaskDBProvider } from '../context/taskDBContext.jsx';
import { purple } from '@mui/material/colors';
import StateBoard from './StateBoard';

const BoardPage = () => {

  const { id, projectID } = useParams(); // the WorkSpace id

  const navigate = useNavigate();

  const {_currentUser, setCurrentUser} = useContext(userContext);

  const [isGridLayout, setIsGridLayout] = useState(false);

  const [workSpaceDataWithID, setWorkSpaceDataWithID] = useState({});
  const [isLoadingWSData, SetLoadingWSData] = useState(true);

  const [projectDataWithID, setProjectDataWithID] = useState({});
  const [isLoadingProjectData, SetLoadingProjectData] = useState(true);

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
        setWorkSpaceDataWithID({
          ...docData,
          id:id
        });
        SetLoadingWSData(false);
      }
  }

  const retrieveProjectData = async()=>{

    if (projectID)
    {
      const {docData} = await getCollectionDocByRefAndID(projectCollectionRef, projectID);
  
      // If the path direction is wrong, the user do not belong to the project
      if (!docData.memberUIDs.includes(_currentUser.uid))
      {
        // back to home
        navigate(CONST_PATH.home);
      }
      else
      {
        setProjectDataWithID({
          ...docData,
          id:projectID
        });
        SetLoadingProjectData(false);
      }

    }
}

  useEffect(()=>{
    retrieveWorkSpaceData();
  }, [id])

  useEffect(()=>{
    retrieveProjectData();
  }, [projectID])

  return (
    // <div className="board-page">
    //   <AppNavbar />
    //   <BoardNavbar toggleLayout={toggleLayout} isGridLayout={isGridLayout} />
    //   <div className="board-content">
    //     <Board isGridLayout={isGridLayout} />
    //   </div>
    // </div>

    <ProjectDBProvider workingWorkSpaceID={id}>
      <StateDBProvider workingProjectID={projectID}>
        <TaskDBProvider>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}>

            {isLoadingWSData || (projectID && isLoadingProjectData) ?
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
                  workSpaceDataWithID={workSpaceDataWithID}
                  projectDataWithID={projectDataWithID ? projectDataWithID : {}} />

                {
                  projectID ? <StateBoard isGridLayout={isGridLayout} workSpaceDataWithID={workSpaceDataWithID} /> :
                              <ProjectBoard isGridLayout={isGridLayout} workSpaceID={workSpaceDataWithID.id} />
                }
              </>
            }
          </Box>
        </TaskDBProvider>
      </StateDBProvider>
    </ProjectDBProvider>
  );
};

export default BoardPage;
