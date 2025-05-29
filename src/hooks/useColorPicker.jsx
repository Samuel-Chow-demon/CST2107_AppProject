import { useState } from 'react';
// import { SketchPicker } from 'react-color';
import { HexColorPicker } from 'react-colorful';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
// import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';

const useColorPicker = (buttonPlaceHolder="", initColor="") => {

  const [color, setColor] = useState(initColor ? initColor : "A0ffA0");
  // const [draggingColor, setDraggingColor] = useState(color); // Local state for dragging
  // const [isDragging, setIsDragging] = useState(false);

  const ColorPicker = () => {

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = (event, reason) => {
      if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
        setAnchorEl(null);
      }
    };

    const open = Boolean(anchorEl);
    const id = open ? 'color-picker-popover' : undefined;

    // const CustomSketchPicker = ({ color = '#fff', onChange = () => {}, ...props }) => {
    //   return <SketchPicker color={color} onChange={onChange} {...props} />;
    // };

    const handleDragChange = (newColor) => {
      setDraggingColor(newColor); // Only update the local dragging color
    };

    return (
      <div style={{width:'100%'}}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClick}
          sx={{
            backgroundColor: color,
            color: grey[800],
            borderColor: color,
            textTransform: 'none',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
                boxshadow: 6,
                transform: 'scale(1.05)'
            }
          }}
        >
          {buttonPlaceHolder ? buttonPlaceHolder : "Pick a Color"}
        </Button>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: -10, // Moves the popover 10px downward
            horizontal: -15, // Moves the popover 15px to the right
          }}
          disableEnforceFocus // Prevents automatic focus-stealing behavior
          disableAutoFocus   // Ensures the picker board interaction remains seamless
        >
          <HexColorPicker
              color={color}
              //onChange={handleDragChange} // HexColorPicker uses `onChange` instead of `onChangeComplete`
              onChange={(newColor)=>setColor(newColor)} // HexColorPicker uses `onChange` instead of `onChangeComplete`
              onMouseUp={(e) => {
                e.stopPropagation();
                
              }}
              onMouseDown={(e) =>{
                e.stopPropagation();
              }} // Start dragging
            />

          {/* <Box sx={{ p: 1 }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent propagation of click events
            onMouseUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()} // Prevent propagation of click events
            >
            <SketchPicker
                color={color}
                onChangeComplete={(newColor) => setColor(newColor.hex)}
              />

            <HexColorPicker
              color={color}
              //onChange={handleDragChange} // HexColorPicker uses `onChange` instead of `onChangeComplete`
              onChange={(newColor)=>setColor(newColor)} // HexColorPicker uses `onChange` instead of `onChangeComplete`
              onMouseUp={(e) => {
                e.stopPropagation();
                // if (isDragging) {
                //   setIsDragging(false);             // Stop dragging
                // }
              }}
              onMouseDown={(e) =>{
                e.stopPropagation();
                //setIsDragging(true);
              }} // Start dragging
            />

          </Box> */}
        </Popover>
      </div>
    );
  }

  return { color, ColorPicker }
}

export { useColorPicker }
