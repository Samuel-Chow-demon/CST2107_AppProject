import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ReplyIcon from '@mui/icons-material/Reply';
import { Avatar, IconButton, Paper, Tooltip, tooltipClasses, Typography } from '@mui/material';
import { blue, grey, red } from '@mui/material/colors';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';
import { Fragment, memo, useRef, useState } from 'react';
import ReactDraggable from 'react-draggable';
import { useCommentDB } from '../context/commentDBContext';
import CommentForm from './commentForm';
import RemoveCommentForm from './RemoveCommentForm';

const ReclusiveCommentsComponent = memo(({ commentDoc, userUID, setEditCommentForm, setIsRemoveComment,
                                      getUserObjByUID,
                                      setOpenCommentDialog }) => {
  
    const handleEdit = () => {
        setEditCommentForm(commentDoc);
        setIsRemoveComment(false);
        setOpenCommentDialog(true);
    };
  
    const handleRemove = () => {
      setEditCommentForm(commentDoc);
      setIsRemoveComment(true);
      setOpenCommentDialog(true);
    };

    const [openReplyBox, setOpenReplyBox] = useState(false);
  
    const commentUserObj = getUserObjByUID(commentDoc.userUID);
    let commentUserColor = commentUserObj?.color ?? 'grey[500]';
    let commentUserNameShort = commentUserObj?.userName ?? '?';
    if (commentUserNameShort != '?')
    {
      commentUserNameShort = (commentUserNameShort.at(0) + commentUserNameShort.at(-1)).toUpperCase();
    }

    const HtmlTooltip = styled(({ className, ...props }) => (
      <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }) => ({
      [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: grey[100], //'#f5f5f9',
        color: 'rgba(0, 0, 0, 0.9)',
        maxWidth: 150,
        fontSize: theme.typography.pxToRem(12),
        border: '0px solid',
      },
    }));
    
    return (
        <div style={{ width: '100%',
                      height: 'auto',
                      display: 'flex',
                      flexDirection:'column',
                      justifyContent:'center',
                      alignItems:'flex-start',
                      gap: '10px' }}>

            <div style={{display:'grid',
                          gridTemplateColumns: (commentDoc.userUID == userUID) ? "1fr 7fr 2fr" : "1fr 9fr",
                         justifyContent:'center', alignItems:'center', width: '100%', gap: '10px'}}>
                <HtmlTooltip
                        title={
                            <Fragment>
                                <Typography sx={{
                                    color: grey[600]
                                }}>{commentUserObj?.userName ?? 'N/A'}</Typography>
                            </Fragment>
                        }
                    >
                  <Avatar sx={{ bgcolor: commentUserColor }}>{commentUserNameShort}</Avatar>
                </HtmlTooltip>

                <Typography sx={{
                        display:'flex',
                        justifyContent:'space-between',
                        alignItems: 'center',
                        paddingX: '3px',
                        paddingLeft: '10px',
                        paddingRight: '15px',
                        border: '1px solid grey',
                        borderRadius: '4px'
                    }}>
                    {commentDoc.comment}
                    <IconButton style={{ width: 10, height: 10, padding: 2,
                                            backgroundColor:grey[200], opacity:0.8}}
                                    sx={{  
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            boxshadow: 6,
                                            transform: 'scale(1.2)',
                                            '& svg':{
                                              color:blue[500]
                                            }
                                        }}}
                            aria-label="delete" size="large"
                            onClick={(e) => {e.stopPropagation();
                                              setOpenReplyBox(true)}}>
                            <ReplyIcon fontSize="inherit" />
                      </IconButton>
                </Typography>

                {
                  (commentDoc.userUID == userUID) &&
                  <div style={{display:'flex', justifyContent:'center', alignItems:'center', width: 'auto', gap:'20px'}}>

                      <IconButton style={{ width: 10, height: 10, padding: 2,
                                            backgroundColor:grey[200], opacity:0.8}}
                                    sx={{  
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            boxshadow: 6,
                                            transform: 'scale(1.2)'
                                        }}}
                            aria-label="delete" size="large"
                            onClick={(e) => {e.stopPropagation();
                                              handleEdit()}}>
                            <EditNoteIcon fontSize="inherit" />
                      </IconButton>

                      <IconButton style={{ width: 10, height: 10, padding: 2,
                                            backgroundColor:grey[200], opacity:0.8}}
                                    sx={{  
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            boxshadow: 6,
                                            transform: 'scale(1.2)',
                                            '& svg':{
                                              color:red[400]
                                            }
                                        }}}
                            aria-label="delete" size="large"
                            onClick={(e) => {e.stopPropagation();
                                              handleRemove()}}>
                            <DeleteOutlineIcon fontSize="inherit" />
                      </IconButton>
                  </div>
                }
            </div>
            {
                  openReplyBox &&
                  <CommentForm taskID={commentDoc.taskID} userUID={userUID}
                                setFormOpen={setOpenReplyBox} parentCommentForm={commentDoc}/>
            }
  
            {/* Render child comments */}
            {
                commentDoc.replies && 
                commentDoc.replies.length > 0 && (
                <div style={{ display:'flex',
                                flexDirection:'column',
                                justifyContent:'center',
                                alignItems:'flex-start',
                                gap: '10px',
                                marginLeft: 55 }}>

                    {
                        commentDoc.replies.map((childComment) => (
                            <ReclusiveCommentsComponent
                                key={childComment.id}
                                commentDoc={childComment}
                                userUID={userUID}
                                getUserObjByUID={getUserObjByUID}
                                setIsRemoveComment={setIsRemoveComment}
                                setEditCommentForm={setEditCommentForm}
                                setOpenCommentDialog={setOpenCommentDialog}
                            />
                        ))
                    }
                </div>
                )
            }
      </div>
    );
  });

const DisplayComments = ({currentAllCommentsInTask, allUserInProjectDoc, taskID, userUID}) => {

  // currentAllCommentsInTask
  // [{
  //     id:comment_id, ...docData, replies : [ {id:comment_id, ...docData, replies : []}, {id:comment_id_2, docData, replies : []} .... ]
  // }
  // ....
  // {
  //     id:comment_id, ...docData, replies : [ {id:comment_id, ...docData, replies : []}, {id:comment_id_2, docData, replies : []} .... ]
  // }]

    const [openCommentDialog, setOpenCommentDialog] = useState(false);
    const [editCommentForm, setEditCommentForm] = useState({});
    const [isRemoveComment, setIsRemoveComment] = useState(false);
 
    const {
      removeComment
    } = useCommentDB();

    const getUserObjByUID = (uid)=>{
      const userObjList = allUserInProjectDoc.filter((userObj)=>userObj.uid === uid);
      return userObjList.length > 0 ? userObjList[0] : null;
    }

    const PaperComponent = memo(({ nodeRef, ...props }) => {
        return (
          <ReactDraggable nodeRef={nodeRef}
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
          >
            <Paper ref={nodeRef} sx={{ borderRadius: '8px' }} {...props} />
          </ReactDraggable>
        );
      });

    const CommentDialog = memo(() => {

        const dialogNodeRef = useRef(null);
    
        return (
          <Fragment>
            <Dialog
              open={openCommentDialog}
              onClose={() => setOpenCommentDialog(false)}
              PaperComponent={(props) => (
                <PaperComponent {...props} nodeRef={dialogNodeRef} />
              )}
              aria-labelledby="draggable-dialog-title"
            >
              <DialogTitle style={{ cursor: 'move', textAlign: 'center' }} id="draggable-dialog-title">
                {isRemoveComment ? 'Remove Comment': 'Edit Comment'}
              </DialogTitle>
              <DialogContent>
                <Paper style={{
                  height: '100%',
                  width: '500px',
                  display: 'flex',
                  marginTop: '10px',
                  flexDirection: 'column', gap: '20px',
                  justifyContent: 'center', alignItems: 'center'
                }}
                  elevation={0}>

                  {
                    isRemoveComment ?
                    <RemoveCommentForm removeFromDB={()=>{removeComment({commentID:editCommentForm.id, taskID:taskID})}}
                                        commentStr={editCommentForm.comment} 
                                        setOpenDialog={setOpenCommentDialog}/> 
                    :
                    <CommentForm taskID={taskID}
                                  userUID={userUID}
                                  setFormOpen={setOpenCommentDialog}
                                  currentCommentForm={editCommentForm}/>
                  }
    
                </Paper>
              </DialogContent>
            </Dialog>
          </Fragment >
        );
      });

  return (
    <>
        {
            currentAllCommentsInTask?.length > 0 &&
            <>
                <CommentDialog />
                {
                    currentAllCommentsInTask.map((commentDoc)=>(
                        <ReclusiveCommentsComponent key={commentDoc.id}
                                                    userUID={userUID}
                                                    commentDoc={commentDoc}
                                                    getUserObjByUID={getUserObjByUID}
                                                    setEditCommentForm={setEditCommentForm}
                                                    setIsRemoveComment={setIsRemoveComment}
                                                    setOpenCommentDialog={setOpenCommentDialog} />
                    ))
                }
            </>
            
        }
    </>
  )
}

export default memo(DisplayComments)