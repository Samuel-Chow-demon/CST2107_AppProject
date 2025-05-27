import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import { useEffect, useState } from 'react';

// Example image imports
import bkgrd1 from '../assets/bg-1.jpg';
import bkgrd2 from '../assets/bg-2.jpg';
import bkgrd3 from '../assets/bg-3.jpg';
import bkgrd4 from '../assets/bg-4.jpg';

const usePicturePicker = (initPicture="") => {
    const [selectedPicture, setSelectedPicture] = useState(initPicture);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const PicturePicker = () => {
        const [anchorEl, setAnchorEl] = useState(null);

        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
            setAnchorEl(null);
        };

        const handlePictureSelect = (picture) => {
            setSelectedPicture(picture);
            handleClose(); // Close the popover after selecting
        };

        const open = Boolean(anchorEl);
        const id = open ? 'picture-picker-popover' : undefined;

        const pictures = [
            { src: bkgrd1, alt: 'Picture 1' },
            { src: bkgrd2, alt: 'Picture 2' },
            { src: bkgrd3, alt: 'Picture 3' },
            { src: bkgrd4, alt: 'Picture 4' },
        ];

        // Preload the image to improve the loading time when use
        const preloadImages = ()=>{
            const loadPromises = pictures.map((picture)=>{
                return new Promise((resolve, reject)=>{
                    const image = new Image();
                    image.src = picture.src;
                    image.onload = resolve;
                    image.error = reject;
                })
            })

            return Promise.all(loadPromises);
        }

        useEffect(()=>{
            const preload = async()=>{
                try
                {
                    await preloadImages();
                    setImagesLoaded(true);
                }
                catch(error)
                {
                    console.log("Preload Image Error", error)
                }
            }
            preload();
        }, []);

        return (
            <div style={{width:'100%'}} aria-hidden='true'>
                <Button
                    variant="outlined"
                    onClick={handleClick}
                    sx={{
                        backgroundImage: selectedPicture ? `url(${selectedPicture})` : 'none',
                        backgroundColor: selectedPicture ? 'transparent' : '#fff', // Fallback for no picture
                        color: '#000',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderColor: '#ccc',
                        width: '150px',
                        height: '150px',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                            boxshadow: 6,
                            transform: 'scale(1.1)'
                        }
                    }}
                >
                    {selectedPicture ? '' : 'Pick a Picture'}
                </Button>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 10, // Moves the popover 10px downward
                        horizontal: 50, // Moves the popover 15px to the right
                    }}
                    disableEnforceFocus
                    disableAutoFocus
                    TransitionProps={{ timeout: 150 }}
                >
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 10rem)',
                        p: 2,
                        width: 'auto',
                        height: 'auto'
                    }}>
                        {imagesLoaded &&
                            pictures.map((picture, index) => (
                            <Box
                                key={index}
                                component="img"
                                src={picture.src}
                                alt={picture.alt}
                                sx={{
                                    width: '150px',
                                    height: '150px',
                                    objectFit: 'cover',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'left',
                                    cursor: 'pointer',
                                    border: selectedPicture === picture.src ? '3px solid blue' : '3px solid transparent',
                                    borderRadius: 1,
                                }}
                                onClick={() => handlePictureSelect(picture.src)}
                            />
                        ))}
                    </Box>
                </Popover>
            </div>
        );
    };

    return { selectedPicture, PicturePicker };
};

export { usePicturePicker };

