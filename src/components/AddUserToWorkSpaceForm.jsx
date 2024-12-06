import { Box, Button, Chip, Popover, TextField, Typography } from '@mui/material';
import { useEffect, memo, useCallback, useState, useRef, forwardRef } from 'react'
import useInputForm from '../hooks/useInputForm';
import { green, grey, red } from '@mui/material/colors';
import { useWorkSpaceDB } from '../context/workspaceDBContext';

const AddUserToWorkSpaceForm = ({ allUserDocs, allUserInWorkSpaceDoc,
                                    workspaceID, setOpenDialog, creatorUID, uid }) => {

    const addUserToWSForm = {
        'userNameOrEmail': "",
    }

    const {
        formData, formInputErrors,
        enterInput, isDisableInput, setDisableInput } = useInputForm(addUserToWSForm);

    const [matchList, setMatchList] = useState([]);
    const [addedUserList, setAddedUserList] = useState([]);

    const { joinWorkSpace} = useWorkSpaceDB();

    const [anchorEl, setAnchorEl] = useState(null); // Popover anchor
    const searchTextFieldRef = useRef(null);
    const open = Boolean(anchorEl);
    const id = open ? "user-popover" : undefined;

    const handleSrchNameChange = useCallback((e) => {

        const value = e.target.value;
        enterInput('userNameOrEmail', value)();

        if (value.trim() != "") {
            const keyword = value.toLowerCase();
            const matches = allUserDocs.filter(user => (user.uid !== creatorUID) &&
                                                        (user.uid != uid) &&
                                                        (!allUserInWorkSpaceDoc.some(wsUser=>wsUser.uid === user.uid)) &&
                                                        (!addedUserList.some(addedUser=>addedUser.uid === user.uid)) &&
                                                        (user.userName.toLowerCase().includes(keyword) ||
                                                        user.email.toLowerCase().includes(keyword)));

            setMatchList(matches);
            setAnchorEl(searchTextFieldRef.current);
        }
        else {
            setMatchList([]);
            setAnchorEl(null);
        }

    }, [enterInput]);

    const proceedAddUserToWorkSpace = async () => {

        setDisableInput(true)

        const promises = addedUserList.map(async (user) => {
            await joinWorkSpace({ workspaceID: workspaceID, userUID: user.uid });
        })

        // Wait all user id added to the workspace
        await Promise.all(promises);

        setDisableInput(false)
        setOpenDialog(false)
    }

    const MemoizedTextField = memo(forwardRef(({ value, onChange, error, helperText, disabled }, ref) => {
        return (
            <TextField
                fullWidth
                autoFocus
                required
                ref={ref}
                disabled={disabled}
                sx={{
                    opacity: disabled ? 0.5 : 1,
                }}
                error={error}
                helperText={helperText}
                label="Enter User Name Or Email To Search"
                value={value}
                placeholder={"UserName Or Email"}
                size='Normal'
                onChange={onChange}
            />
        );
    }));

    const handleDeleteAddedUser = (index)=>{
        setAddedUserList((prev)=>prev.filter((user, idx)=>idx !== index));
    }

    const handleAddMatchedUser = (newUser)=>{

        if (addedUserList.every(user=>user.email !== newUser.email))
        {
            setAddedUserList((prev)=>[...prev, newUser])
        }
        setAnchorEl(null);
    }

    const DisplayAddedUserComponent = ()=>{
        return (
            <Box sx={{ display: 'flex',
                       justifyContent: 'space-around', alignItems: 'left', border: 'none', gap: 2 }}>

            {
                addedUserList.length > 0 &&
                addedUserList.map((user, index)=>(

                    <Chip key={index} label={user.email} variant="outlined" onDelete={()=>handleDeleteAddedUser(index)} />
                ))
            }
            </Box>
        );
    }

    const AddUserFormComponents = memo(() => (
        <>
            {/* <Typography sx={{
                color: grey[800],
                fontSize: '24px',
                textAlign: 'center',
                whiteSpace: 'pre-line'
            }}>Add Users</Typography> */}
            {/* <MemoizedTextField
                fullWidth
                required
                ref={searchTextFieldRef}
                disabled={isDisableInput}
                error={formInputErrors['userNameOrEmail'].isError}
                helperText={formInputErrors['userNameOrEmail'].message}
                value={formData['userNameOrEmail']}
                onChange={handleSrchNameChange}
            /> */}
            <DisplayAddedUserComponent />
        </>
    ));

    const AddUserActionComponent = memo(() => (

        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', border: 'none', gap: 2 }}>
            <Button sx={{
                '&:hover': {
                    color: grey[100],
                    backgroundColor: green[300]
                }
            }}
                onClick={proceedAddUserToWorkSpace}>Add</Button>
            <Button sx={{
                '&:hover': {
                    color: grey[100],
                    backgroundColor: grey[600]
                }
            }}
                onClick={() => setOpenDialog(false)}>
                Cancel
            </Button>
        </Box>
    ));

    const MatchUserListComponent = memo(() => {
        return (
            <Popover
                id={id}
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
                    {matchList.length > 0 ? (
                        matchList.map((user, index) => (
                            <Box
                                key={index}
                                onClick={() => handleAddMatchedUser(user)}
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
                        <Typography>No matches found</Typography>
                    )}
                </Box>
            </Popover>
        )
    });

    return (<div aria-hidden="true" style={{width:'100%', display:'flex', flexDirection: 'column', gap:'16px'}}>

                <TextField
                    fullWidth
                    autoFocus
                    required
                    ref={searchTextFieldRef}
                    disabled={isDisableInput}
                    sx={{
                        opacity: isDisableInput ? 0.5 : 1,
                    }}
                    //error={error}
                    //helperText={helperText}
                    label="Enter User Name Or Email To Search"
                    value={formData['userNameOrEmail']}
                    placeholder={"UserName Or Email"}
                    size='Normal'
                    onChange={handleSrchNameChange}
                />
                <AddUserFormComponents />
                <MatchUserListComponent />
                <AddUserActionComponent />
             </div>);
}

export default memo(AddUserToWorkSpaceForm)