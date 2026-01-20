import React, { useState, useEffect } from 'react';
import { Users, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

const LudoGame = () => {
  const [page, setPage] = useState('login');
  const [username, setUsername] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('');
  const [gameMode, setGameMode] = useState('');
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [positions, setPositions] = useState({});
  const [winner, setWinner] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);

  // Standard Ludo colors: Red, Blue, Green, Yellow
  const colors = ['#DC2626', '#2563EB', '#16A34A', '#EAB308'];
  const colorNames = ['Red', 'Blue', 'Green', 'Yellow'];
  const colorClasses = {
    '#DC2626': 'bg-red-600',
    '#2563EB': 'bg-blue-600',
    '#16A34A': 'bg-green-600',
    '#EAB308': 'bg-yellow-500'
  };

  // Standard Ludo board configuration
  // Each player has: 51 steps on the main path + 6 steps in home column
  const TOTAL_STEPS = 57; // 51 on path + 6 in home column

  // Starting positions for each player on the main path
  const START_POSITIONS = {
    0: 0,   // Red starts at position 0
    1: 13,  // Blue starts at position 13
    2: 26,  // Green starts at position 26
    3: 39   // Yellow starts at position 39
  };

  const handleLogin = () => {
    if (username.trim()) {
      setLoggedInUser(username.trim());
      setPage('mode-selection');
    }
  };

  const handleModeSelection = (mode) => {
    setGameMode(mode);
    setPage('player-selection');
  };

  const handlePlayerSelection = (num) => {
    // Limit to 4 players for standard Ludo
    const playerCount = Math.min(num, 4);
    setNumPlayers(playerCount);
    const playerList = [];
    for (let i = 0; i < playerCount; i++) {
      if (gameMode === 'friends') {
        playerList.push({ 
          name: i === 0 ? loggedInUser : `Player ${i + 1}`, 
          color: colors[i], 
          isAI: false,
          startPos: START_POSITIONS[i]
        });
      } else {
        playerList.push({ 
          name: i === 0 ? loggedInUser : `Computer ${i}`, 
          color: colors[i], 
          isAI: i !== 0,
          startPos: START_POSITIONS[i]
        });
      }
    }
    setPlayers(playerList);
    
    const initialPos = {};
    playerList.forEach((p, idx) => {
      initialPos[idx] = [-1, -1, -1, -1]; // -1 means in home base
    });
    setPositions(initialPos);
    
    setPage('game');
    setGameStarted(true);
  };

  const rollDice = () => {
    if (isRolling || winner) return;
    
    setIsRolling(true);
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls >= 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);
        setSelectedPiece(null);
      }
    }, 100);
  };

  const canMovePiece = (playerIdx, pieceIdx, diceValue) => {
    const piecePos = positions[playerIdx][pieceIdx];
    
    // Can move out if dice is 6 and piece is in home (-1)
    if (piecePos === -1 && diceValue === 6) {
      return true;
    }
    
    // Can move if piece is on board and not finished
    if (piecePos >= 0 && piecePos < TOTAL_STEPS) {
      const newPos = piecePos + diceValue;
      // Check if move would go beyond finish
      if (newPos <= TOTAL_STEPS) {
        return true;
      }
    }
    
    return false;
  };

  const handlePieceClick = (playerIdx, pieceIdx) => {
    if (playerIdx !== currentPlayer || isRolling || winner) return;
    if (!players[currentPlayer]?.isAI && diceValue > 0 && canMovePiece(playerIdx, pieceIdx, diceValue)) {
      movePiece(playerIdx, pieceIdx, diceValue);
    }
  };

  const movePiece = (playerIdx, pieceIdx, value) => {
    const newPositions = { ...positions };
    const playerPieces = [...newPositions[playerIdx]];
    
    if (playerPieces[pieceIdx] === -1 && value === 6) {
      // Move out of home base
      playerPieces[pieceIdx] = 0;
    } else if (playerPieces[pieceIdx] >= 0 && playerPieces[pieceIdx] < TOTAL_STEPS) {
      // Move on board
      const newPos = playerPieces[pieceIdx] + value;
      playerPieces[pieceIdx] = Math.min(newPos, TOTAL_STEPS);
    }
    
    newPositions[playerIdx] = playerPieces;
    setPositions(newPositions);
    
    // Check win condition
    if (playerPieces.every(pos => pos === TOTAL_STEPS)) {
      setWinner(players[playerIdx].name);
      return;
    }
    
    // Auto move AI or continue turn if 6
    if (value !== 6) {
      setTimeout(() => {
        const nextPlayer = (currentPlayer + 1) % numPlayers;
        setCurrentPlayer(nextPlayer);
        setSelectedPiece(null);
        
        if (players[nextPlayer].isAI) {
          setTimeout(() => rollDice(), 1000);
        }
      }, 1000);
    } else {
      // If rolled 6, allow another roll
      setDiceValue(0);
    }
  };

  // Auto-move AI pieces
  useEffect(() => {
    if (gameStarted && players[currentPlayer]?.isAI && !isRolling && !winner && diceValue > 0) {
      const timer = setTimeout(() => {
        const currentPlayerData = players[currentPlayer];
        const aiPieces = positions[currentPlayer] || [];
        let moved = false;
        
        // Try to move first available piece
        for (let i = 0; i < 4; i++) {
          const piecePos = aiPieces[i];
          if (piecePos === -1 && diceValue === 6) {
            // Can move out
            moved = true;
            movePiece(currentPlayer, i, diceValue);
            break;
          } else if (piecePos >= 0 && piecePos < TOTAL_STEPS) {
            const newPos = piecePos + diceValue;
            if (newPos <= TOTAL_STEPS) {
              moved = true;
              movePiece(currentPlayer, i, diceValue);
              break;
            }
          }
        }
        
        // If can't move, pass turn (only if didn't roll 6)
        if (!moved && diceValue !== 6) {
          setTimeout(() => {
            const nextPlayer = (currentPlayer + 1) % numPlayers;
            setCurrentPlayer(nextPlayer);
            setDiceValue(0);
            if (players[nextPlayer]?.isAI) {
              setTimeout(() => rollDice(), 1000);
            }
          }, 1000);
        } else if (moved && diceValue === 6) {
          // Roll again after moving with a 6
          setDiceValue(0);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diceValue, currentPlayer, gameStarted, isRolling, winner]);

  const DiceIcon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][diceValue - 1] || Dice1;

  // Calculate piece position on board (standard Ludo path)
  const getPiecePosition = (playerIdx, pieceIdx) => {
    const pos = positions[playerIdx]?.[pieceIdx] ?? -1;
    if (pos === -1) return null; // In home base
    if (pos === TOTAL_STEPS) return null; // Finished
    
    const boardSize = 600;
    const cellSize = boardSize / 15;
    
    // Standard Ludo: 51 steps on main path, then 6 steps in home column
    if (pos < 51) {
      // On main circular path - calculate based on player's starting position
      const startOffset = START_POSITIONS[playerIdx] || 0;
      const absolutePos = (pos + startOffset) % 52;
      
      let x = 0, y = 0;
      
      // Path calculation for standard Ludo board layout
      if (absolutePos < 6) {
        // Top horizontal (right to left for red, left to right for others)
        x = (6 + absolutePos) * cellSize;
        y = 0;
      } else if (absolutePos === 6) {
        x = 12 * cellSize;
        y = 0;
      } else if (absolutePos < 13) {
        // Top right vertical
        x = 12 * cellSize;
        y = (absolutePos - 6) * cellSize;
      } else if (absolutePos < 19) {
        // Right horizontal
        x = (18 - absolutePos) * cellSize;
        y = 6 * cellSize;
      } else if (absolutePos === 19) {
        x = 12 * cellSize;
        y = 6 * cellSize;
      } else if (absolutePos < 26) {
        // Bottom right vertical
        x = 12 * cellSize;
        y = (absolutePos - 13) * cellSize;
      } else if (absolutePos < 32) {
        // Bottom horizontal
        x = (26 - absolutePos) * cellSize;
        y = 12 * cellSize;
      } else if (absolutePos === 32) {
        x = 6 * cellSize;
        y = 12 * cellSize;
      } else if (absolutePos < 39) {
        // Bottom left vertical
        x = 6 * cellSize;
        y = (32 - absolutePos) * cellSize;
      } else if (absolutePos < 45) {
        // Left horizontal
        x = (absolutePos - 33) * cellSize;
        y = 6 * cellSize;
      } else {
        // Top left vertical
        x = 0;
        y = (51 - absolutePos) * cellSize;
      }
      
      return { x: x + cellSize * 0.25, y: y + cellSize * 0.25 };
    } else {
      // In home column (positions 51-56)
      const homeSteps = pos - 51;
      let x, y;
      
      // Home column positions - colored paths leading to center
      if (playerIdx === 0) { // Red - bottom left, column goes up (vertical, x=7)
        x = 7 * cellSize + cellSize * 0.25;
        y = (13 - homeSteps) * cellSize + cellSize * 0.25;
      } else if (playerIdx === 1) { // Blue - bottom right, column goes left (horizontal, y=7)
        x = (13 - homeSteps) * cellSize + cellSize * 0.25;
        y = 7 * cellSize + cellSize * 0.25;
      } else if (playerIdx === 2) { // Green - top left, column goes right (horizontal, y=6)
        x = (1 + homeSteps) * cellSize + cellSize * 0.25;
        y = 6 * cellSize + cellSize * 0.25;
      } else { // Yellow - top right, column goes down (vertical, x=8)
        x = 8 * cellSize + cellSize * 0.25;
        y = (1 + homeSteps) * cellSize + cellSize * 0.25;
      }
      
      return { x, y };
    }
  };

  // Render Ludo Board Component
  const LudoBoard = () => {
    const boardSize = 600;
    const cellSize = boardSize / 15;

    return (
      <div className="relative" style={{ width: boardSize, height: boardSize }}>
        <svg width={boardSize} height={boardSize} className="absolute inset-0">
          {/* Background */}
          <rect width={boardSize} height={boardSize} fill="#FEF3C7" />
          
          {/* Home Bases - Top Left (Green) */}
          <g>
            <rect x={0} y={0} width={6 * cellSize} height={6 * cellSize} fill="#86EFAC" stroke="#16A34A" strokeWidth="2" />
            <rect x={cellSize} y={cellSize} width={4 * cellSize} height={4 * cellSize} fill="white" stroke="#16A34A" strokeWidth="2" />
            {/* 4 circles for pieces */}
            <circle cx={2.5 * cellSize} cy={2.5 * cellSize} r={cellSize * 0.3} fill="#16A34A" />
            <circle cx={3.5 * cellSize} cy={2.5 * cellSize} r={cellSize * 0.3} fill="#16A34A" />
            <circle cx={2.5 * cellSize} cy={3.5 * cellSize} r={cellSize * 0.3} fill="#16A34A" />
            <circle cx={3.5 * cellSize} cy={3.5 * cellSize} r={cellSize * 0.3} fill="#16A34A" />
          </g>

          {/* Home Bases - Top Right (Yellow) */}
          <g>
            <rect x={9 * cellSize} y={0} width={6 * cellSize} height={6 * cellSize} fill="#FDE047" stroke="#EAB308" strokeWidth="2" />
            <rect x={10 * cellSize} y={cellSize} width={4 * cellSize} height={4 * cellSize} fill="white" stroke="#EAB308" strokeWidth="2" />
            <circle cx={11.5 * cellSize} cy={2.5 * cellSize} r={cellSize * 0.3} fill="#EAB308" />
            <circle cx={12.5 * cellSize} cy={2.5 * cellSize} r={cellSize * 0.3} fill="#EAB308" />
            <circle cx={11.5 * cellSize} cy={3.5 * cellSize} r={cellSize * 0.3} fill="#EAB308" />
            <circle cx={12.5 * cellSize} cy={3.5 * cellSize} r={cellSize * 0.3} fill="#EAB308" />
          </g>

          {/* Home Bases - Bottom Left (Red) */}
          <g>
            <rect x={0} y={9 * cellSize} width={6 * cellSize} height={6 * cellSize} fill="#FCA5A5" stroke="#DC2626" strokeWidth="2" />
            <rect x={cellSize} y={10 * cellSize} width={4 * cellSize} height={4 * cellSize} fill="white" stroke="#DC2626" strokeWidth="2" />
            <circle cx={2.5 * cellSize} cy={11.5 * cellSize} r={cellSize * 0.3} fill="#DC2626" />
            <circle cx={3.5 * cellSize} cy={11.5 * cellSize} r={cellSize * 0.3} fill="#DC2626" />
            <circle cx={2.5 * cellSize} cy={12.5 * cellSize} r={cellSize * 0.3} fill="#DC2626" />
            <circle cx={3.5 * cellSize} cy={12.5 * cellSize} r={cellSize * 0.3} fill="#DC2626" />
          </g>

          {/* Home Bases - Bottom Right (Blue) */}
          <g>
            <rect x={9 * cellSize} y={9 * cellSize} width={6 * cellSize} height={6 * cellSize} fill="#93C5FD" stroke="#2563EB" strokeWidth="2" />
            <rect x={10 * cellSize} y={10 * cellSize} width={4 * cellSize} height={4 * cellSize} fill="white" stroke="#2563EB" strokeWidth="2" />
            <circle cx={11.5 * cellSize} cy={11.5 * cellSize} r={cellSize * 0.3} fill="#2563EB" />
            <circle cx={12.5 * cellSize} cy={11.5 * cellSize} r={cellSize * 0.3} fill="#2563EB" />
            <circle cx={11.5 * cellSize} cy={12.5 * cellSize} r={cellSize * 0.3} fill="#2563EB" />
            <circle cx={12.5 * cellSize} cy={12.5 * cellSize} r={cellSize * 0.3} fill="#2563EB" />
          </g>

          {/* Central Cross Paths */}
          {/* Horizontal path */}
          <rect x={6 * cellSize} y={6 * cellSize} width={3 * cellSize} height={cellSize} fill="white" stroke="#000" strokeWidth="1" />
          <rect x={6 * cellSize} y={8 * cellSize} width={3 * cellSize} height={cellSize} fill="white" stroke="#000" strokeWidth="1" />
          
          {/* Vertical path */}
          <rect x={6 * cellSize} y={6 * cellSize} width={cellSize} height={3 * cellSize} fill="white" stroke="#000" strokeWidth="1" />
          <rect x={8 * cellSize} y={6 * cellSize} width={cellSize} height={3 * cellSize} fill="white" stroke="#000" strokeWidth="1" />

          {/* Main path squares - Top horizontal */}
          {[6, 7, 8, 9, 10, 11].map(i => (
            <rect key={`top-${i}`} x={i * cellSize} y={0} width={cellSize} height={cellSize} fill="white" stroke="#000" strokeWidth="1" />
          ))}
          
          {/* Top right vertical */}
          {[1, 2, 3, 4, 5, 6].map(i => (
            <rect key={`right-top-${i}`} x={12 * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="white" stroke="#000" strokeWidth="1" />
          ))}

          {/* Right horizontal */}
          {[7, 8, 9, 10, 11, 12].map(i => (
            <rect key={`right-${i}`} x={i * cellSize} y={6 * cellSize} width={cellSize} height={cellSize} fill="white" stroke="#000" strokeWidth="1" />
          ))}

          {/* Bottom right vertical */}
          {[8, 9, 10, 11, 12, 13].map(i => (
            <rect key={`right-bottom-${i}`} x={12 * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="white" stroke="#000" strokeWidth="1" />
          ))}

          {/* Bottom horizontal */}
          {[6, 7, 8, 9, 10, 11].map(i => (
            <rect key={`bottom-${i}`} x={i * cellSize} y={14 * cellSize} width={cellSize} height={cellSize} fill="white" stroke="#000" strokeWidth="1" />
          ))}

          {/* Bottom left vertical */}
          {[8, 9, 10, 11, 12, 13].map(i => (
            <rect key={`left-bottom-${i}`} x={0} y={i * cellSize} width={cellSize} height={cellSize} fill="white" stroke="#000" strokeWidth="1" />
          ))}

          {/* Left horizontal */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <rect key={`left-${i}`} x={i * cellSize} y={8 * cellSize} width={cellSize} height={cellSize} fill="white" stroke="#000" strokeWidth="1" />
          ))}

          {/* Top left vertical */}
          {[1, 2, 3, 4, 5, 6].map(i => (
            <rect key={`left-top-${i}`} x={0} y={i * cellSize} width={cellSize} height={cellSize} fill="white" stroke="#000" strokeWidth="1" />
          ))}

          {/* Safe squares with stars */}
          {/* Green safe squares */}
          <rect x={6 * cellSize} y={1 * cellSize} width={cellSize} height={cellSize} fill="#86EFAC" stroke="#16A34A" strokeWidth="2" />
          <text x={6.5 * cellSize} y={1.7 * cellSize} fontSize={cellSize * 0.6} fill="white" textAnchor="middle" fontWeight="bold">★</text>
          
          <rect x={8 * cellSize} y={6 * cellSize} width={cellSize} height={cellSize} fill="#86EFAC" stroke="#16A34A" strokeWidth="2" />
          <text x={8.5 * cellSize} y={6.7 * cellSize} fontSize={cellSize * 0.6} fill="white" textAnchor="middle" fontWeight="bold">★</text>

          {/* Yellow safe squares */}
          <rect x={13 * cellSize} y={8 * cellSize} width={cellSize} height={cellSize} fill="#FDE047" stroke="#EAB308" strokeWidth="2" />
          <text x={13.5 * cellSize} y={8.7 * cellSize} fontSize={cellSize * 0.6} fill="white" textAnchor="middle" fontWeight="bold">★</text>
          
          <rect x={8 * cellSize} y={13 * cellSize} width={cellSize} height={cellSize} fill="#FDE047" stroke="#EAB308" strokeWidth="2" />
          <text x={8.5 * cellSize} y={13.7 * cellSize} fontSize={cellSize * 0.6} fill="white" textAnchor="middle" fontWeight="bold">★</text>

          {/* Red safe squares */}
          <rect x={7 * cellSize} y={13 * cellSize} width={cellSize} height={cellSize} fill="#FCA5A5" stroke="#DC2626" strokeWidth="2" />
          <text x={7.5 * cellSize} y={13.7 * cellSize} fontSize={cellSize * 0.6} fill="white" textAnchor="middle" fontWeight="bold">★</text>
          
          <rect x={1 * cellSize} y={8 * cellSize} width={cellSize} height={cellSize} fill="#FCA5A5" stroke="#DC2626" strokeWidth="2" />
          <text x={1.5 * cellSize} y={8.7 * cellSize} fontSize={cellSize * 0.6} fill="white" textAnchor="middle" fontWeight="bold">★</text>

          {/* Blue safe squares */}
          <rect x={6 * cellSize} y={7 * cellSize} width={cellSize} height={cellSize} fill="#93C5FD" stroke="#2563EB" strokeWidth="2" />
          <text x={6.5 * cellSize} y={7.7 * cellSize} fontSize={cellSize * 0.6} fill="white" textAnchor="middle" fontWeight="bold">★</text>
          
          <rect x={1 * cellSize} y={6 * cellSize} width={cellSize} height={cellSize} fill="#93C5FD" stroke="#2563EB" strokeWidth="2" />
          <text x={1.5 * cellSize} y={6.7 * cellSize} fontSize={cellSize * 0.6} fill="white" textAnchor="middle" fontWeight="bold">★</text>

          {/* Home columns - colored paths to center */}
          {/* Green home column (top left to center, horizontal) */}
          {[1, 2, 3, 4, 5].map(i => (
            <rect key={`green-col-${i}`} x={i * cellSize} y={6 * cellSize} width={cellSize} height={cellSize} fill="#86EFAC" stroke="#16A34A" strokeWidth="1" />
          ))}

          {/* Yellow home column (top right to center, vertical) */}
          {[1, 2, 3, 4, 5].map(i => (
            <rect key={`yellow-col-${i}`} x={8 * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="#FDE047" stroke="#EAB308" strokeWidth="1" />
          ))}

          {/* Red home column (bottom left to center, vertical) */}
          {[9, 10, 11, 12, 13].map(i => (
            <rect key={`red-col-${i}`} x={7 * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="#FCA5A5" stroke="#DC2626" strokeWidth="1" />
          ))}

          {/* Blue home column (bottom right to center, horizontal) */}
          {[9, 10, 11, 12, 13].map(i => (
            <rect key={`blue-col-${i}`} x={i * cellSize} y={7 * cellSize} width={cellSize} height={cellSize} fill="#93C5FD" stroke="#2563EB" strokeWidth="1" />
          ))}

          {/* Center triangle - divided into 4 colored triangles */}
          <polygon points={`${7 * cellSize},${7 * cellSize} ${7 * cellSize},${8 * cellSize} ${8 * cellSize},${7.5 * cellSize}`} fill="#16A34A" stroke="#000" strokeWidth="2" />
          <polygon points={`${8 * cellSize},${7 * cellSize} ${9 * cellSize},${7 * cellSize} ${8 * cellSize},${7.5 * cellSize}`} fill="#EAB308" stroke="#000" strokeWidth="2" />
          <polygon points={`${7 * cellSize},${8 * cellSize} ${8 * cellSize},${8.5 * cellSize} ${8 * cellSize},${8 * cellSize}`} fill="#DC2626" stroke="#000" strokeWidth="2" />
          <polygon points={`${8 * cellSize},${8 * cellSize} ${8 * cellSize},${8.5 * cellSize} ${9 * cellSize},${8 * cellSize}`} fill="#2563EB" stroke="#000" strokeWidth="2" />
        </svg>

        {/* Render player pieces */}
        {players.map((player, playerIdx) => {
          // Home base positions for each player (4 circles in white square)
          const getHomeBasePositions = (idx) => {
            const cellSize = 600 / 15;
            if (idx === 0) { // Red - bottom left
              return [
                { x: 2.5 * cellSize, y: 11.5 * cellSize },
                { x: 3.5 * cellSize, y: 11.5 * cellSize },
                { x: 2.5 * cellSize, y: 12.5 * cellSize },
                { x: 3.5 * cellSize, y: 12.5 * cellSize }
              ];
            } else if (idx === 1) { // Blue - bottom right
              return [
                { x: 11.5 * cellSize, y: 11.5 * cellSize },
                { x: 12.5 * cellSize, y: 11.5 * cellSize },
                { x: 11.5 * cellSize, y: 12.5 * cellSize },
                { x: 12.5 * cellSize, y: 12.5 * cellSize }
              ];
            } else if (idx === 2) { // Green - top left
              return [
                { x: 2.5 * cellSize, y: 2.5 * cellSize },
                { x: 3.5 * cellSize, y: 2.5 * cellSize },
                { x: 2.5 * cellSize, y: 3.5 * cellSize },
                { x: 3.5 * cellSize, y: 3.5 * cellSize }
              ];
            } else { // Yellow - top right
              return [
                { x: 11.5 * cellSize, y: 2.5 * cellSize },
                { x: 12.5 * cellSize, y: 2.5 * cellSize },
                { x: 11.5 * cellSize, y: 3.5 * cellSize },
                { x: 12.5 * cellSize, y: 3.5 * cellSize }
              ];
            }
          };

          const homeBasePositions = getHomeBasePositions(playerIdx);
          const cellSize = 600 / 15;

          return [0, 1, 2, 3].map((pieceIdx) => {
            const pos = positions[playerIdx]?.[pieceIdx] ?? -1;
            let piecePos;
            
            if (pos === -1) {
              // In home base
              piecePos = homeBasePositions[pieceIdx];
            } else if (pos === TOTAL_STEPS) {
              // Finished - in center triangle (not rendered for now)
              return null;
            } else {
              // On board
              piecePos = getPiecePosition(playerIdx, pieceIdx);
              if (!piecePos) return null;
            }

            const canMove = currentPlayer === playerIdx && !players[currentPlayer].isAI && diceValue > 0 && canMovePiece(playerIdx, pieceIdx, diceValue);

            return (
              <div
                key={`player-${playerIdx}-piece-${pieceIdx}`}
                onClick={() => handlePieceClick(playerIdx, pieceIdx)}
                className={`absolute rounded-full border-4 border-white shadow-lg transition-all duration-300 ${
                  canMove ? 'ring-4 ring-yellow-400 cursor-pointer z-10' : pos === -1 ? 'cursor-default z-5' : 'cursor-pointer z-5'
                }`}
                style={{
                  left: `${piecePos.x}px`,
                  top: `${piecePos.y}px`,
                  width: `${cellSize * 0.5}px`,
                  height: `${cellSize * 0.5}px`,
                  backgroundColor: player.color,
                  transform: canMove ? 'scale(1.15)' : currentPlayer === playerIdx ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {pieceIdx + 1}
                </div>
              </div>
            );
          });
        })}
      </div>
    );
  };

  if (page === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-8 text-purple-600">Ludo Game</h1>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder="Enter your name"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'mode-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600">Choose Game Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleModeSelection('friends')}
              className="bg-green-500 text-white p-8 rounded-lg hover:bg-green-600 transition transform hover:scale-105"
            >
              <Users className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold">Play with Friends</h3>
              <p className="mt-2">Multiplayer mode</p>
            </button>
            <button
              onClick={() => handleModeSelection('computer')}
              className="bg-orange-500 text-white p-8 rounded-lg hover:bg-orange-600 transition transform hover:scale-105"
            >
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold">Play with Computer</h3>
              <p className="mt-2">AI opponents</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'player-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-teal-600">Select Number of Players</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => handlePlayerSelection(num)}
                className="bg-teal-500 text-white p-6 rounded-lg hover:bg-teal-600 transition transform hover:scale-105"
              >
                <div className="text-5xl font-bold">{num}</div>
                <p className="mt-2">Players</p>
              </button>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-4">Standard Ludo supports up to 4 players</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-red-500 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-4">Ludo Game</h1>
        
        {winner && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4 text-center">
            <h2 className="text-3xl font-bold text-green-600">🎉 {winner} Wins! 🎉</h2>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              New Game
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6 flex justify-center items-center">
            <div className="border-8 border-orange-400 rounded-lg p-2 bg-yellow-50">
              <LudoBoard />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Players</h3>
              <div className="space-y-2">
                {players.map((player, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      currentPlayer === idx ? 'ring-4 ring-yellow-400' : ''
                    }`}
                    style={{ backgroundColor: `${player.color}20` }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: player.color }}></div>
                      <span className="font-semibold">{player.name}</span>
                      {player.isAI && <span className="text-xs">🤖</span>}
                    </div>
                    <span className="text-sm font-bold">{positions[idx]?.filter(p => p === TOTAL_STEPS).length || 0}/4</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {players[currentPlayer]?.name}'s Turn
              </h3>
              <button
                onClick={rollDice}
                disabled={isRolling || winner || (diceValue > 0 && diceValue !== 6) || players[currentPlayer]?.isAI}
                className={`w-full py-4 rounded-lg font-bold text-white transition ${
                  isRolling || winner || (diceValue > 0 && diceValue !== 6) || players[currentPlayer]?.isAI
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isRolling ? 'Rolling...' : diceValue > 0 && diceValue !== 6 ? 'Move a piece!' : players[currentPlayer]?.isAI ? 'AI Turn' : 'Roll Dice'}
              </button>
              
              <div className="mt-6 flex justify-center">
                <div className={`${isRolling ? 'animate-bounce' : ''}`}>
                  <DiceIcon className="w-24 h-24 text-red-500" />
                </div>
              </div>
              <div className="text-3xl font-bold mt-4 text-gray-700">{diceValue}</div>
              {diceValue === 6 && !players[currentPlayer]?.isAI && (
                <p className="text-sm text-green-600 mt-2 font-semibold">Roll again after moving!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LudoGame;
