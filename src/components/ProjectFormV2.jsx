import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import userContext from "../context/userContext";
import useInputForm from "../hooks/useInputForm";
import DateRangePickerTool from "./DateRangePicker";
import { Box, Button, Chip, Popover, TextField, Typography } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useColorPicker } from "../hooks/useColorPicker";
import { useProjectDB } from "../context/projectDBContext";
import dayjs from "dayjs";

const ProjectFormV2 = ({allUserInWorkSpaceDoc, setOpenDialog, currentProjectForm = {}}) => {

  const {_currentUser, setCurrentUser} = useContext(userContext);

  const {
    createProject, editProject, setProjIsLoading
  } = useProjectDB();

  const isEditMode = Object.keys(currentProjectForm).length > 0;

  const [dateRange, setDateRange] = useState([currentProjectForm?.startDateISO ? dayjs(currentProjectForm.startDateISO) : null,
                                              currentProjectForm?.endDateISO ? dayjs(currentProjectForm.endDateISO) : null]);

  const [anchorEl, setAnchorEl] = useState(null); // Popover anchor
  const addedUserRef = useRef(null);
  const open = Boolean(anchorEl);
  const idPopOver = open ? "user-popover" : undefined;

  const {color, ColorPicker} = useColorPicker("Project Color", isEditMode ? currentProjectForm.projectColor : "");

  const createProjectForm = {
    name : "",
    description : "",
    startDateISO : "",
    endDateISO : "",
    memberUIDs : [_currentUser.uid],
    creatorUID : _currentUser.uid,
    projectColor: ""
}

  const {
    formData, setFormData,
    enterInput, isDisableInput, setDisableInput,
    formInputErrors,
    setOtherRegisterFieldErrChk,
    validateInput } = useInputForm(isEditMode ? currentProjectForm : createProjectForm);

  useEffect(()=>{

      setOtherRegisterFieldErrChk([
          {'field' : 'name', 'condition' : (inputFormData)=>inputFormData.name.length > 0, 'errMsg' : 'Project Name Cannot Empty'}
      ])

    }, [])

  useEffect(()=>{

    enterInput('startDateISO', dateRange[0] ? dateRange[0].toISOString() : "")()
    enterInput('endDateISO', dateRange[1] ? dateRange[1].toISOString() : "")()

  }, [dateRange])

  useEffect(()=>{

    enterInput('projectColor', color)()

  }, [color])

  const handleInputChange = useCallback((field)=>(e) => enterInput(field)(e), [enterInput]);

  const proceedActionProject = async()=>{

    if (validateInput({byPassPasswordCheck:true, byPassPasswordConfirm :true}))
    {
        setDisableInput(true)
        //setProjIsLoading(true)
        setOpenDialog(false)

        isEditMode ? 
        await editProject({formData:formData, projectID:currentProjectForm.id}) : await createProject({formData:formData});

        setDisableInput(false)
        setProjIsLoading(false)
    }
}

  // const MemoizedTextField = memo(({value, label, placeholder,
  //                                   onChange, error, helperText,
  //                                   disabled,
  //                                   required = true, multiLineRows = 1 }) => {
  //   return (
  //       <TextField
  //           fullWidth
  //           autoFocus
  //           required={required}
  //           multiline={multiLineRows > 1}
  //           rows={multiLineRows}
  //           disabled={disabled}
  //           sx={{
  //               opacity: disabled ? 0.5 : 1,
  //           }}
  //           error={error}
  //           helperText={helperText}
  //           label={label}
  //           value={value}
  //           placeholder={placeholder}
  //           size='Normal'
  //           onChange={onChange}
  //       />
  //     );
  // });

  const DisplayAddedUserComponent = ()=>{
    return (
       <Box sx={{display: 'grid', gridTemplateColumns: '5fr 1fr', alignItems:'center', gap: 2, width:'100%'}}>
        
          <Box sx={{ display: 'flex',
                     flexWrap: 'wrap',
                    justifyContent: 'space-around',
                    padding: 2,
                    alignItems: 'left', border: allUserInWorkSpaceDoc.length > 0 ? '1px solid' : 'none',
                    borderColor:grey[500], gap: 2,
                    borderRadius:'4px' }}>

          {
              allUserInWorkSpaceDoc.length > 0 ?
              allUserInWorkSpaceDoc
                .filter((user)=>formData['memberUIDs'].includes(user.uid))
                .map((user, index)=>(

                  <Chip key={index} label={user.email} variant="outlined" 
                        onDelete={(user.uid != _currentUser.uid && user.uid != formData['creatorUID']) ? ()=>handleDeleteAddedUser(user.uid) : undefined} />
              ))
              :
              <Typography
                  variant="body1" 
                  sx={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',
                        color: blue[700], fontWeight: 'bold' }}
              >
                  Add User
              </Typography>
          }
          </Box>

          <AddCircleIcon className="icon" sx={{
                        fontSize: 40,
                        color: blue[700],
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                            transform: 'scale(1.2)',
                            color: blue[300]
                        }
                    }} 
                    onClick={()=>setAnchorEl(addedUserRef.current)}
                    />
        </Box>
    );
}

const handleDeleteAddedUser = (userUid)=>{

  setFormData((prev)=>({
    ...prev,
    memberUIDs : prev.memberUIDs.filter((uid, idx)=>uid !== userUid)
  }));
}

const handleAddUserToList = (newUserUID)=>{

  if (formData['memberUIDs'].every(user=>user.uid !== newUserUID))
  {
    setFormData((prev)=>({
      ...prev,
      memberUIDs : [...prev.memberUIDs, newUserUID]
    }));
  }
  setAnchorEl(null);
}

const DisplayUserListComponent = memo(() => {
  return (
      <Popover
          id={idPopOver}
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
          }}
          transformOrigin={{
              vertical: "top",
              horizontal: "left",
          }}
          disableAutoFocus // Prevent the Popover from stealing focus from TextField
          disableEnforceFocus // Prevent Popover from enforcing focus when open
      >
          <Box sx={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',  gap: 2, margin:'1.5rem', width: '25rem' }}>
              {allUserInWorkSpaceDoc.length > 0 ? (
                  allUserInWorkSpaceDoc
                  .filter((user)=>!formData['memberUIDs'].includes(user.uid))
                    .map((user, index) => (
                      <Box
                          key={index}
                          onClick={() => handleAddUserToList(user.uid)}
                          sx={{
                              width: '100%',
                              borderRadius: '4px',
                              padding: '0.5rem',
                              backgroundColor: grey[700],
                              color: grey[300],
                              cursor: "pointer",
                              whiteSpace: 'pre-wrap',
                              transition: 'transform 0.3s box-shadow 0.3s',
                              "&:hover": {
                                  backgroundColor: grey[400], 
                                  color: grey[800],
                                  boxshadow: 6,
                                  transform: 'scale(1.05)'},
                              m: 1
                          }}
                      >
                          {`${user.userName},    ${user.email}`}
                      </Box>
                  ))
              ) : (
                  <Typography>No Available User</Typography>
              )}
          </Box>
      </Popover>
  )
});

  const ProjectActionComponent = memo(()=>(

    <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', border:'none', padding:'2px', gap:2}}>
        <Button sx={{
                '&:hover':{
                    color:grey[100],
                    backgroundColor:blue[300]
                }
            }} 
            onClick={proceedActionProject}>{isEditMode ? 'Edit' : 'Create'}</Button>
        <Button sx={{
                '&:hover':{
                    color:grey[100],
                    backgroundColor:grey[600]
                }
            }}
            onClick={()=>setOpenDialog(false)}>
            Cancel
        </Button>
    </Box>
));

  return (
    <div style={{width:'100%', display:'flex', flexDirection: 'column', gap:'16px'}}>
      
      <TextField
            fullWidth
            autoFocus
            required
            disabled={isDisableInput}
            sx={{
                opacity: isDisableInput ? 0.5 : 1,
            }}
            error={formInputErrors['name'].isError}
            label={"Project Title"}
            placeholder={"Enter Project Title Or Name"}
            size='Normal'
            helperText={formInputErrors['name'].message}
            value={formData['name']}
            onChange={handleInputChange('name')}
        />

      <TextField
            fullWidth
            autoFocus
            required={false}
            multiline={true}
            rows={4}
            disabled={isDisableInput}
            sx={{
                opacity: isDisableInput ? 0.5 : 1,
            }}
            error={formInputErrors['description'].isError}
            label={"Description"}
            placeholder={"Enter Project Description"}
            size='Normal'
            helperText={formInputErrors['description'].message}
            value={formData['description']}
            onChange={handleInputChange('description')}
        />

      <DateRangePickerTool dateRange={dateRange} setDateRange={setDateRange} />
      <DisplayAddedUserComponent />
      <Box ref={addedUserRef} sx={{width:'100%', height:'100%'}}>
        <DisplayUserListComponent />
      </Box>
      <ColorPicker />

      <ProjectActionComponent />
    </div>
  );
};

export default memo(ProjectFormV2);
