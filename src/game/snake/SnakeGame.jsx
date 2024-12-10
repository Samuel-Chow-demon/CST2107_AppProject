import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Paper, Typography } from '@mui/material';
import { brown, grey, orange } from '@mui/material/colors';
import { Fragment, memo, useContext, useEffect, useRef, useState } from 'react';
import { useGameDB } from '../../context/gameDBContext';
import userContext from '../../context/userContext';
import ReactDraggable from 'react-draggable';
import GameScoreDialog from '../../components/GameScoreDialog';

const SnakeGame = () => {
  const canvasRef = useRef(null);

  const [startGame, setStartGame] = useState(false);

  const {_currentUser, setCurrentUser} = useContext(userContext);

  const {alertGame, setAlertGame, setCurrentGame,
        isLoadingData, allGameUserScoreList, currentUserGameScoreDoc,
        createScoreRecord, removeUserScoreDoc, editScoreRecord} = useGameDB();

  const [openFinishDialog, setOpenFinishDialog] = useState(false);
  const [finishMsg, setFinishMsg] = useState("");

  const frameDelay = 60;

  const [currentBoardSize, setCurrentBoardSize]=useState({
    width: 512,
    height: 512
  })

  const CELL_GAP = 16;
  const INITIAL_LENGTH = 4;
  const INITIAL_SHIFTED_OFFSET = 3;

  const scoreRef = useRef(0);
  const [score, setScore] = useState(scoreRef.current); // Sync state with ref

  const getRandomXYInTheBoard = (shift = 0)=>{

    let randomX = Math.floor((Math.random() * currentBoardSize.width) / CELL_GAP) * CELL_GAP;
    let randomY = Math.floor((Math.random() * currentBoardSize.height) / CELL_GAP) * CELL_GAP;

    if (randomX == 0)
    {
        randomX += (shift * CELL_GAP);
    }
    else if (randomX === currentBoardSize.width)
    {
        randomX -= (shift * CELL_GAP);
    }

    if (randomY == 0)
    {
        randomY += (shift * CELL_GAP);
    }
    else if (randomY === currentBoardSize.height)
    {
        randomY -= (shift * CELL_GAP);
    }

    return [randomX, randomY];
  }

  const snakeRef = useRef({
    x: 256, //getRandomXYInTheBoard(INITIAL_SHIFTED_OFFSET)[0],
    y: 256, //getRandomXYInTheBoard(INITIAL_SHIFTED_OFFSET)[1],
    dx: CELL_GAP,
    dy: 0,
    cells: [],
    length: INITIAL_LENGTH,
  });

  const appleRef = useRef({
    x: getRandomXYInTheBoard()[0],
    y: getRandomXYInTheBoard()[1],
  });

  

  useEffect(()=>{
    setCurrentGame('snake');
  }, [])

  const  finishGame = (score)=>{
      setStartGame(false);
      updateScore(score);
      resetSnake();
      setOpenFinishDialog(true);
  }

  const updateScore = async(currentScore)=>{

    let scoreMessage = `Your Score : ${currentScore}`;
    setFinishMsg(scoreMessage);
    //{uid:id, userName:xxx, scores:{snake:xxxx, otherGame:xxxxx}}
    if (Object.keys(currentUserGameScoreDoc).length > 0)
    {
      if (currentScore > currentUserGameScoreDoc?.scores?.snake)
      {
        scoreMessage = `Congratulations! You beat your highest score. \n Your New Score : ${currentScore}`;
        setFinishMsg(scoreMessage);
        await editScoreRecord({game:'snake', score:currentScore});
      }
    }
    else
    {
      await createScoreRecord({uid:_currentUser.uid, userName:_currentUser.userName, game:'snake', score:score});
    }
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

const FinishDialog = memo(() => {

    const dialogNodeRef = useRef(null);

    return (
      <Fragment>
        <Dialog
          open={openFinishDialog}
          onClose={() => setOpenFinishDialog(false)}
          PaperComponent={(props) => (
            <PaperComponent {...props} nodeRef={dialogNodeRef} />
          )}
          aria-labelledby="draggable-dialog-title"
        >
          <DialogTitle style={{ cursor: 'move', textAlign: 'center' }} id="draggable-dialog-title">
            Game Over
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

              <GameScoreDialog message={finishMsg} setOpenDialog={setOpenFinishDialog}/>

            </Paper>
          </DialogContent>
        </Dialog>
      </Fragment >
    );
  });

  const resetSnake = () => {

      const newSnake = {
          x: 256, //getRandomXYInTheBoard(INITIAL_SHIFTED_OFFSET)[0],
          y: 256, //getRandomXYInTheBoard(INITIAL_SHIFTED_OFFSET)[1],
          dx: CELL_GAP,
          dy: 0,
          cells: [],
          length: INITIAL_LENGTH,
      };
      snakeRef.current = newSnake;
      scoreRef.current = 0;
      setScore(scoreRef.current);
  };

    const loop = (timeStamp) => {

        const canvas = canvasRef.current;

        if (!canvas || !startGame)
        {
            return;
        }

        const context = canvas.getContext('2d');

        // Track when the last frame was updated
        if (!snakeRef.current.lastUpdate) {
            snakeRef.current.lastUpdate = timeStamp; // Initialize on first frame
        }

        const delta = timeStamp - snakeRef.current.lastUpdate;

        // Only update the game state if enough time has passed
        if (delta >= frameDelay) 
        {
            snakeRef.current.lastUpdate = timeStamp;

            // Clear canvas
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            const snake = snakeRef.current;
            const apple = appleRef.current;

            // Move snake
            snake.x += snake.dx;
            snake.y += snake.dy;

            //Ensure snake off-screen to die
              if (
                snake.x < 0 ||
                snake.x > canvas.width ||
                snake.y < 0 ||
                snake.y > canvas.height
              ) 
              {
                //alert('Oops! Game Over');
                // setStartGame(false);
                // updateScore(scoreRef.current);
                // resetSnake();
                finishGame(scoreRef.current);
                return;
              }

            // if (snake.x < 0) {
            //     // Update snake.x to be on the right, when further to the left, appear to show at the right
            //     snake.x = canvas.width - CELL_GAP;
            // } else if (snake.x >= canvas.width) {
            //     // Update snake.x to be on the left
            //     snake.x -= canvas.width;
            // }

            // if (snake.y < 0) {
            //     //  Update snake.y to be at the bottom
            //     snake.y = canvas.height - CELL_GAP;
            // } else if (newSnake.y >= canvas.height) {
            //     // Update snake.y to be at the top
            //     snake.y -= canvas.height;
            // }

            // Update snake head
            snake.cells.unshift({ x: snake.x, y: snake.y });

            // Remove snake tail
            if (snake.cells.length > snake.length) {
                snake.cells.pop();
            }

            // Draw apple
            context.fillStyle = 'red';
            context.fillRect(apple.x, apple.y, CELL_GAP - 1, CELL_GAP - 1);

            // Draw snake
            context.fillStyle = 'black';
            snake.cells.forEach((cell, index) => {

                context.fillRect(cell.x, cell.y, CELL_GAP - 1, CELL_GAP - 1);

                // Check if snake collides with itself
                snake.cells.forEach((otherCell, otherIndex) => {
                    if (
                        index !== otherIndex &&
                        cell.x === otherCell.x &&
                        cell.y === otherCell.y
                    ) {
                        //alert('Oops! Game Over');
                        // setStartGame(false);
                        // updateScore(scoreRef.current);
                        // resetSnake();
                        finishGame(scoreRef.current);
                        return;
                    }
                });
            });

            // Check if snake eats the apple
            if (snake.x === apple.x && snake.y === apple.y) {
                snake.length++;

                apple.x = getRandomXYInTheBoard()[0];
                apple.y = getRandomXYInTheBoard()[1];

                scoreRef.current += 1;
                setScore(scoreRef.current);
            }
        }

        requestAnimationFrame(loop);
    }

    const handleKeyDown = (e) => {
        const snake = snakeRef.current;
  
        if (e.key === 'ArrowLeft' && snake.dx === 0) {
          snake.dx = -CELL_GAP;
          snake.dy = 0;
        }
        if (e.key === 'ArrowUp' && snake.dy === 0) {
          snake.dx = 0;
          snake.dy = -CELL_GAP;
        }
        if (e.key === 'ArrowRight' && snake.dx === 0) {
          snake.dx = CELL_GAP;
          snake.dy = 0;
        }
        if (e.key === 'ArrowDown' && snake.dy === 0) {
          snake.dx = 0;
          snake.dy = CELL_GAP;
        }
    };

  useEffect(() => {

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(()=>{

    const canvas = canvasRef.current;

    if (startGame)
    {
      if (canvas) {
        canvas.width = currentBoardSize.width;
        canvas.height = currentBoardSize.height;
      }

      // Start the game loop
      requestAnimationFrame(loop);
    }
  }, [startGame]);

  const ScoreTable = () => 
  {
    return (
              <table style={{ width: "300px", borderCollapse: "collapse", margin: "20px 0", textAlign:'center', borderRadius:'0px', backgroundColor:grey[500] }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Name</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Highest Score</th>
                  </tr>
                </thead>
                <tbody>
                  {allGameUserScoreList &&
                   allGameUserScoreList.map((userScoreDoc, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{userScoreDoc.userName}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{userScoreDoc.scores.snake}</td>
                    </tr>
                  ))}
                </tbody>
              </table>    
    );
  };

  return (
    <div style={{display: 'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100%', width:'100%', overflow:'hidden',
                backgroundColor:brown[400]
    }}>
      {isLoadingData ?
          <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor:brown[400],
              width: '100%',
              height: '100%',
              padding: '20px'
          }}>
              <CircularProgress sx={{ size: 30 }} />
          </Box>
        :
        <>
          <FinishDialog />
          <Box sx={{display:'grid', gridTemplateColumns:'1fr 1fr', height: '100%', width:'100%', gap:'10px',
                   justifyContent:'center', alignItems:'center', padding:'5rem'}}>

            <Box sx={{display: 'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:'10px', height: '100%', width:'100%'}}>
              <Typography style={{ fontSize:'36px', marginTop:'0px'}}>Snake Game</Typography>
              <Typography style={{ fontSize:'24px'}}>Score: {score}</Typography>
              {
                startGame ?
                <canvas ref={canvasRef} style={{
                  backgroundColor:'white'
                }}></canvas>
                :
                <Button sx={{fontSize: '36px',
                              width: '10rem',
                              height: '5rem',
                              color: 'black',
                              borderRadius: '4px',
                            backgroundColor: orange[700],
                            '&:hover':{
                              backgroundColor: orange[300]
                            }
                }}
                onClick={()=>setStartGame(true)}
                >Start</Button>
              }
            </Box>
            <Box sx={{display:'flex', flexDirection:'column', justifyContent:'flex-start', marginTop: '1rem'}}>
              <ScoreTable />
            </Box>   
          </Box>
        </>
      }
    </div>
  );
};

export default SnakeGame;
