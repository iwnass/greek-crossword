import { useState, useEffect, useRef } from 'react';

export default function GreekCrossword() {
  const words = [
    {
      word: "ΘΕΡΜΟΚΡΑΣΙΑ",
      clue: "Πόσο ζεστό ή κρύο είναι κάτι. Χρησιμοποιούμε θερμόμετρα για να τη μετρήσουμε.",
      direction: "across",
      row: 0,
      col: 0
    },
    {
      word: "ΘΕΡΜΟΚΗΠΙΟ",
      clue: "Ένας ειδικός χώρος όπου αναπτύσσονται φυτά, ειδικά το χειμώνα.",
      direction: "across",
      row: 2,
      col: 0
    },
    {
      word: "ΑΝΘΡΑΚΑΣ",
      clue: "Μια μαύρη, εύθρυπτη ουσία που βρίσκεται βαθιά στο έδαφος. Τη χρησιμοποιούμε για να παράγουμε ενέργεια.",
      direction: "across",
      row: 4,
      col: 0
    },
    {
      word: "ΑΝΑΚΥΚΛΩΣΗ",
      clue: "Η διαδικασία μετατροπής παλιών αντικειμένων σε καινούργια ώστε να μπορούμε να τα επαναχρησιμοποιήσουμε.",
      direction: "across",
      row: 6,
      col: 0
    },
    {
      word: "ΑΤΜΟΣΦΑΙΡΑ",
      clue: "Το στρώμα αέρα γύρω από τη Γη. Μας βοηθά να αναπνέουμε!",
      direction: "across", 
      row: 8,
      col: 0
    },
    {
      word: "ΕΝΕΡΓΕΙΑ",
      clue: "Αυτό που δίνει ισχύ στα φώτα, τα αυτοκίνητα και τις μηχανές μας. Χωρίς αυτή, τίποτα δε λειτουργεί!",
      direction: "across",
      row: 10,
      col: 0
    },
    {
      word: "ΘΕΡΜΟΤΗΤΑ",
      clue: "Αυτό που νιώθεις όταν στέκεσαι πολύ κοντά σε ένα θερμαντικό σώμα ή στον ήλιο.",
      direction: "across",
      row: 12,
      col: 0
    },
    {
      word: "ΦΑΙΝΟΜΕΝΟ",
      clue: "Ένα γεγονός ή πράγμα που μπορούμε να δούμε, όπως ένα ουράνιο τόξο ή έναν έναστρο ουρανό.",
      direction: "across",
      row: 14,
      col: 0
    },
    {
      word: "ΜΗΧΑΝΙΣΜΟΣ",
      clue: "Ένα σύστημα ή μηχανή που λειτουργεί για να κάνει κάτι, όπως τα γρανάζια μέσα σε ένα ρολόι.",
      direction: "across",
      row: 16,
      col: 0
    },
    {
      word: "ΗΛΙΟΣ",
      clue: "Το μεγάλο, λαμπερό αστέρι που μας δίνει φως και ζεστασιά κάθε μέρα.",
      direction: "across",
      row: 18,
      col: 0
    },
    {
      word: "ΕΝΙΣΧΥΣΗ",
      clue: "Το να κάνεις κάτι πιο δυνατό ή καλύτερο.",
      direction: "across",
      row: 20,
      col: 0
    },
    {
      word: "ΚΡΙΣΗ",
      clue: "Μια δύσκολη περίοδος όπου προβλήματα πρέπει να λυθούν, όπως μια μεγάλη απόφαση.",
      direction: "across",
      row: 22,
      col: 0
    }
  ]

  // Debugging original word placements
  const debugOriginalPlacement = () => {
    const debugGrid = Array(15).fill().map(() => Array(15).fill('.'));
    
    words.forEach(word => {
      const { row, col, direction, word: wordText } = word;
      
      for (let i = 0; i < wordText.length; i++) {
        const r = direction === "across" ? row : row + i;
        const c = direction === "across" ? col + i : col;
        
        if (r < 15 && c < 15) {
          // Mark conflicts (if a cell already has a different letter)
          if (debugGrid[r][c] !== '.' && debugGrid[r][c] !== wordText[i]) {
            console.log(`Conflict at (${r},${c}): trying to place '${wordText[i]}' but cell already has '${debugGrid[r][c]}'`);
          }
          debugGrid[r][c] = wordText[i];
        }
      }
    });
    
    console.log('Word placement debug:');
    debugGrid.forEach(row => console.log(row.join(' ')));
  };

  // Calculate grid size based on words
  const calculateGridSize = () => {
    return { rows: 24, cols: 15 }; 
  };

  const { rows, cols } = calculateGridSize();

  // Create empty grid
  const generateEmptyGrid = () => {
    const grid = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push({
          value: "",
          isActive: false,
          number: null,
          correctValue: null,
          wordDirections: [] // Store which directions this cell belongs to
        });
      }
      grid.push(row);
    }
    return grid;
  };

  // States
  const [grid, setGrid] = useState(generateEmptyGrid());
  const [activeCell, setActiveCell] = useState(null);
  const [activeDirection, setActiveDirection] = useState("across");
  const [activeWord, setActiveWord] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [checkMode, setCheckMode] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  
  // Ref for grid cells
  const cellRefs = useRef({});

  // Create word positions and numbers on the grid
  useEffect(() => {
    const newGrid = generateEmptyGrid();
    let wordCounter = 1;
    const foundConflicts = [];
    const wordMap = {};

    // First pass: create mapping of position to expected letter
    const letterMap = {};
    
    words.forEach(word => {
      const { row, col, direction, word: wordText } = word;
      
      for (let i = 0; i < wordText.length; i++) {
        const r = direction === "across" ? row : row + i;
        const c = direction === "across" ? col + i : col;
        const cellKey = `${r}-${c}`;
        
        if (r < rows && c < cols) {
          if (!letterMap[cellKey]) {
            letterMap[cellKey] = wordText[i];
          } else if (letterMap[cellKey] !== wordText[i]) {
            // Found a conflict
            foundConflicts.push({
              position: cellKey,
              expected: [letterMap[cellKey], wordText[i]]
            });
          }
        }
      }
    });
    
    // Second pass: mark cells as active and set correct values
    words.forEach(word => {
      const { row, col, direction, word: wordText } = word;
      
      // Mark initial cell with number if needed
      if (!newGrid[row][col].number) {
        newGrid[row][col].number = wordCounter++;
      }

      // Set correct values for each cell and track directions
      for (let i = 0; i < wordText.length; i++) {
        const r = direction === "across" ? row : row + i;
        const c = direction === "across" ? col + i : col;
        
        if (r < rows && c < cols) {
          newGrid[r][c].isActive = true;
          
          // Use the letter map to ensure consistency at intersection points
          const cellKey = `${r}-${c}`;
          newGrid[r][c].correctValue = letterMap[cellKey];
          
          // Track which directions this cell belongs to
          if (!newGrid[r][c].wordDirections.includes(direction)) {
            newGrid[r][c].wordDirections.push(direction);
          }
          
          // Map cell positions to word identifiers for easier lookup
          if (!wordMap[cellKey]) {
            wordMap[cellKey] = [];
          }
          wordMap[cellKey].push(wordText);
        }
      }
    });
    
    if (foundConflicts.length > 0) {
      console.warn("Word conflicts detected:", foundConflicts);
      setConflicts(foundConflicts);
    }
    
    setGrid(newGrid);
    
    // Call debug function
    debugOriginalPlacement();
  }, []);

  // Function to detect which words the cell belongs to
  const getWordsForCell = (row, col) => {
    return words.filter(word => {
      if (word.direction === "across") {
        return row === word.row && col >= word.col && col < word.col + word.word.length;
      } else {
        return col === word.col && row >= word.row && row < word.row + word.word.length;
      }
    });
  };

  // Toggle direction when clicking on a cell with both directions
  const toggleDirection = (cellDirections) => {
    if (cellDirections.includes("across") && cellDirections.includes("down")) {
      return activeDirection === "across" ? "down" : "across";
    }
    return cellDirections[0] || activeDirection;
  };

  // Handle cell input
  const handleCellInput = (row, col, e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 1) {
      const newGrid = [...grid];
      newGrid[row][col].value = value;
      setGrid(newGrid);
      
      // Move to next cell if character was entered
      if (value && activeDirection) {
        moveToNextCell(row, col);
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (row, col, e) => {
    const key = e.key;
    
    // Prevent default behavior for arrow keys to avoid unexpected scrolling
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Backspace", "Delete", "Tab"].includes(key)) {
      e.preventDefault();
    }
    
    // Check if current cell belongs to a word in each direction
    const cellWords = getWordsForCell(row, col);
    const hasAcross = cellWords.some(w => w.direction === "across");
    const hasDown = cellWords.some(w => w.direction === "down");
    
    // Handle navigation based on current direction and key pressed
    switch(key) {
      case "ArrowUp":
        navigateTo(row - 1, col);
        break;
      case "ArrowDown":
        navigateTo(row + 1, col);
        break;
      case "ArrowLeft":
        navigateTo(row, col - 1);
        break;
      case "ArrowRight":
        navigateTo(row, col + 1);
        break;
      case "Backspace":
      case "Delete":
        // If current cell is empty, go to previous cell and clear it
        if (grid[row][col].value === "") {
          const prevCell = getPreviousCell(row, col);
          if (prevCell) {
            const newGrid = [...grid];
            newGrid[prevCell.row][prevCell.col].value = "";
            setGrid(newGrid);
            navigateTo(prevCell.row, prevCell.col);
          }
        } else {
          // Clear current cell
          const newGrid = [...grid];
          newGrid[row][col].value = "";
          setGrid(newGrid);
        }
        break;
      case "Tab":
        // Toggle between across/down if possible, otherwise move to next word
        if (hasAcross && hasDown) {
          setActiveDirection(activeDirection === "across" ? "down" : "across");
        } else if (activeWord) {
          const currentWordIndex = words.findIndex(w => w.word === activeWord);
          const nextWordIndex = (currentWordIndex + 1) % words.length;
          const nextWord = words[nextWordIndex];
          
          navigateTo(nextWord.row, nextWord.col);
          setActiveDirection(nextWord.direction);
        }
        break;
      default:
        // For letter keys, let the input handler manage it
        break;
    }
  };

  // Navigate to a specific cell if it exists and is active
  const navigateTo = (row, col) => {
    if (row >= 0 && row < rows && col >= 0 && col < cols && grid[row][col].isActive) {
      setActiveCell({ row, col });
      focusCell(row, col);
    }
  };

  // Get the previous cell in the current direction
  const getPreviousCell = (row, col) => {
    if (activeDirection === "across") {
      // Move left
      if (col > 0 && grid[row][col-1].isActive) {
        return { row, col: col - 1 };
      }
    } else {
      // Move up
      if (row > 0 && grid[row-1][col].isActive) {
        return { row: row - 1, col };
      }
    }
    return null;
  };

  // Move to next cell after input
  const moveToNextCell = (row, col) => {
    const direction = activeDirection;
    
    if (direction === "across") {
      // Move right
      if (col + 1 < cols && grid[row][col + 1].isActive) {
        navigateTo(row, col + 1);
      }
    } else {
      // Move down
      if (row + 1 < rows && grid[row + 1][col].isActive) {
        navigateTo(row + 1, col);
      }
    }
  };

  // Focus a specific cell
  const focusCell = (row, col) => {
    const cellId = `cell-${row}-${col}`;
    if (cellRefs.current[cellId]) {
      cellRefs.current[cellId].focus();
    }
  };

  // Handle cell focus
  const handleCellFocus = (row, col) => {
    setActiveCell({ row, col });
    
    // Get cell's directions
    const cellDirections = grid[row][col].wordDirections;
    
    // If the cell has only one direction, use that
    // If it has multiple, toggle between them when clicking the same cell twice
    if (cellDirections.length > 0) {
      if (activeCell?.row === row && activeCell?.col === col) {
        setActiveDirection(toggleDirection(cellDirections));
      } else if (!cellDirections.includes(activeDirection)) {
        setActiveDirection(cellDirections[0]);
      }
    }
    
    // Determine which word is focused
    const focusedWords = getWordsForCell(row, col);
    const directionWord = focusedWords.find(word => word.direction === activeDirection);
    
    if (directionWord) {
      setActiveWord(directionWord.word);
    } else if (focusedWords.length > 0) {
      // If no word in current direction, use any available direction
      setActiveDirection(focusedWords[0].direction);
      setActiveWord(focusedWords[0].word);
    }
  };

  // Check answers
  const checkAnswers = () => {
    setCheckMode(true);
    
    // Check if all answers are correct
    let allCorrect = true;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j].isActive) {
          if (grid[i][j].value !== grid[i][j].correctValue) {
            allCorrect = false;
          }
        }
      }
    }
    
    if (allCorrect) {
      setGameCompleted(true);
      showConfetti();
    }
  };

  // Reset puzzle
  const resetPuzzle = () => {
    const newGrid = [...grid];
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (newGrid[i][j].isActive) {
          newGrid[i][j].value = "";
        }
      }
    }
    
    setGrid(newGrid);
    setCheckMode(false);
    setGameCompleted(false);
    setConfetti(false);
    setShowHint(false);
  };

  // Show a hint (reveal one letter)
  const giveHint = () => {
    if (!activeCell) return;
    
    const { row, col } = activeCell;
    const newGrid = [...grid];
    
    if (newGrid[row][col].isActive) {
      newGrid[row][col].value = newGrid[row][col].correctValue;
      setGrid(newGrid);
      setShowHint(true);
      
      // Hide hint message after 3 seconds
      setTimeout(() => {
        setShowHint(false);
      }, 3000);
    }
  };

  // Show confetti for completion
  const showConfetti = () => {
    setConfetti(true);
  };

  // Get cell background color based on check mode and value
  const getCellBackground = (cell) => {
    if (!checkMode) {
      // Default mode colors
      if (cell.isActive && cell.value) {
        return "bg-blue-100"; // Filled cells get a light blue
      }
      return "bg-white";
    }
    
    // Check mode colors
    if (cell.isActive && cell.value) {
      return cell.value === cell.correctValue ? "bg-green-200" : "bg-red-200";
    }
    
    return "bg-white";
  };

  // Get the active clue
  const getActiveClue = () => {
    if (!activeWord) return null;
    const wordData = words.find(w => w.word === activeWord);
    return wordData ? wordData.clue : "";
  };

  // Get words that start with each number
  const getCluesForNumber = (number) => {
    return words.filter(word => {
      const cellWithNumber = grid[word.row][word.col];
      return cellWithNumber.number === number;
    });
  };

  // Create list of all clue numbers in order
  const getClueNumbers = () => {
    const numbers = new Set();
    words.forEach(word => {
      const cellWithNumber = grid[word.row][word.col];
      if (cellWithNumber && cellWithNumber.number) {
        numbers.add(cellWithNumber.number);
      }
    });
    return Array.from(numbers).sort((a, b) => a - b);
  };

  // Highlight cells of active word
  const isInActiveWord = (row, col) => {
    if (!activeWord) return false;
    
    const wordData = words.find(w => w.word === activeWord);
    if (!wordData) return false;
    
    if (wordData.direction === "across") {
      return row === wordData.row && 
             col >= wordData.col && 
             col < wordData.col + wordData.word.length;
    } else {
      return col === wordData.col && 
             row >= wordData.row && 
             row < wordData.row + wordData.word.length;
    }
  };

  // Auto-fill all conflict cells
  const autoFixConflicts = () => {
    const newGrid = [...grid];
    
    conflicts.forEach(conflict => {
      const [row, col] = conflict.position.split("-").map(Number);
      if (newGrid[row][col].isActive) {
        newGrid[row][col].value = newGrid[row][col].correctValue;
      }
    });
    
    setGrid(newGrid);
    setShowHint(true);
    
    // Hide hint message after 3 seconds
    setTimeout(() => {
      setShowHint(false);
    }, 3000);
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 max-w-6xl mx-auto font-sans">
      {/* Crossword Grid Section */}
      <div className="md:w-1/2">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Σταυρόλεξο για Παιδιά!</h1>
        
        {gameCompleted && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-4 text-center">
            <p className="text-xl font-bold text-green-600">
              🎉 Συγχαρητήρια! Λύσατε το σταυρόλεξο! 🎉
            </p>
            <p className="text-lg text-green-600">Είσαι πραγματικά ιδιοφυής!</p>
          </div>
        )}
        
        {showHint && (
          <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-3 mb-4 text-center">
            <p className="font-medium">💡 Βοήθεια! Ένα γράμμα αποκαλύφθηκε!</p>
          </div>
        )}
        
        {activeWord && (
          <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <p className="font-medium">Τρέχον Στοιχείο 
                <span className="ml-2 px-2 py-1 bg-blue-200 rounded-md text-blue-800">
                  {activeDirection === "across" ? "Οριζόντια" : "Κάθετα"}
                </span>
              </p>
            </div>
            <p className="italic mt-2">{getActiveClue()}</p>
          </div>
        )}
        
        {conflicts.length > 0 && (
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-3 mb-4">
            <p className="font-medium text-red-700">Προσοχή: Υπάρχουν {conflicts.length} σημεία που δεν ταιριάζουν στο σταυρόλεξο!</p>
            <button 
              onClick={autoFixConflicts} 
              className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg"
            >
              Αυτόματη Διόρθωση
            </button>
          </div>
        )}
        
        {/* Crossword Grid */}
        <div className="mb-8 overflow-auto">
          <div className="inline-block border-4 border-blue-600 rounded-lg p-1 bg-white">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => (
                  <div 
                    key={colIndex} 
                    className={`relative w-10 h-10 border ${cell.isActive ? 'border-gray-400' : 'border-transparent bg-gray-100'}`}
                  >
                    {cell.isActive && (
                      <>
                        {cell.number && (
                          <div className="absolute top-0 left-0 text-xs font-semibold text-gray-700 leading-none p-0.5">
                            {cell.number}
                          </div>
                        )}
                        <input
                          id={`cell-${rowIndex}-${colIndex}`}
                          ref={el => cellRefs.current[`cell-${rowIndex}-${colIndex}`] = el}
                          type="text"
                          maxLength="1"
                          value={cell.value}
                          onChange={(e) => handleCellInput(rowIndex, colIndex, e)}
                          onKeyDown={(e) => handleKeyDown(rowIndex, colIndex, e)}
                          onFocus={() => handleCellFocus(rowIndex, colIndex)}
                          className={`w-full h-full text-center font-bold text-lg uppercase outline-none rounded-md 
                            ${getCellBackground(cell)} 
                            ${activeCell?.row === rowIndex && activeCell?.col === colIndex ? 'ring-2 ring-blue-500' : ''}
                            ${isInActiveWord(rowIndex, colIndex) && !(activeCell?.row === rowIndex && activeCell?.col === colIndex) ? 'bg-blue-50' : ''}
                            ${conflicts.some(c => c.position === `${rowIndex}-${colIndex}`) ? 'border-2 border-red-400' : ''}
                          `}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
      
        
        {/* Control Buttons */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={checkAnswers} 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex-1"
          >
            Έλεγχος ✓
          </button>
          <button 
            onClick={giveHint} 
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex-1"
          >
            Βοήθεια 💡
          </button>
          <button 
            onClick={resetPuzzle} 
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex-1"
          >
            Επαναφορά 🔄
          </button>
        </div>
        
        {/* Kid-friendly instructions */}
        <div className="bg-yellow-100 p-3 rounded-lg mb-6">
          <h3 className="font-bold text-lg">Πώς να παίξεις:</h3>
          <ul className="list-disc ml-5 mt-2">
            <li>Κάνε κλικ σε ένα κελί για να ξεκινήσεις.</li>
            <li>Χρησιμοποίησε τα πλήκτρα βέλους ⬅️➡️ για πλοήγηση.</li>
            <li>Χρησιμοποίησε BACKSPACE για διαγραφή.</li>
            <li>Το κουμπί Βοήθεια 💡 σου δείχνει ένα γράμμα!</li>
          </ul>
        </div>
      </div>
      
      {/* Clues Section */}
      <div className="md:w-1/2">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Στοιχεία</h2>
          
          <div className="space-y-6">
            {getClueNumbers().map(number => (
              <div key={number} className="space-y-2">
                <h3 className="font-bold text-lg text-blue-800 bg-blue-100 inline-block px-3 py-1 rounded-full">{number}</h3>
                
                {getCluesForNumber(number).map((word, idx) => {
                  const isActive = activeWord === word.word;
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${isActive ? 'bg-yellow-100 border-2 border-yellow-300' : 'hover:bg-blue-100'}`}
                      onClick={() => {
                        navigateTo(word.row, word.col);
                        setActiveDirection(word.direction);
                      }}
                    >
                      <p>
                        <span className={`font-medium ${isActive ? 'text-yellow-700' : 'text-blue-700'}`}>
                          {word.direction === "across" ? "Οριζόντια ➡️" : "Κάθετα ⬇️"}: 
                        </span>
                        <span className={isActive ? 'font-medium' : ''}> {word.clue}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Confetti effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute w-4 h-4 bg-yellow-500 rounded-full animate-fall-1" style={{left: '10%', top: '-20px'}}></div>
          <div className="absolute w-3 h-3 bg-blue-500 rounded-full animate-fall-2" style={{left: '20%', top: '-20px'}}></div>
          <div className="absolute w-5 h-5 bg-green-500 rounded-full animate-fall-3" style={{left: '30%', top: '-20px'}}></div>
          <div className="absolute w-4 h-4 bg-red-500 rounded-full animate-fall-1" style={{left: '40%', top: '-20px'}}></div>
          <div className="absolute w-6 h-6 bg-purple-500 rounded-full animate-fall-2" style={{left: '50%', top: '-20px'}}></div>
          <div className="absolute w-3 h-3 bg-pink-500 rounded-full animate-fall-3" style={{left: '60%', top: '-20px'}}></div>
          <div className="absolute w-5 h-5 bg-yellow-500 rounded-full animate-fall-1" style={{left: '70%', top: '-20px'}}></div>
          <div className="absolute w-4 h-4 bg-blue-500 rounded-full animate-fall-2" style={{left: '80%', top: '-20px'}}></div>
          <div className="absolute w-6 h-6 bg-green-500 rounded-full animate-fall-3" style={{left: '90%', top: '-20px'}}></div>
          
          <style jsx>{`
            @keyframes fall-1 {
              0% { transform: translateY(0) rotate(0deg); }
              100% { transform: translateY(100vh) rotate(360deg); }
            }
            @keyframes fall-2 {
              0% { transform: translateY(0) rotate(0deg); }
              100% { transform: translateY(100vh) rotate(-360deg); }
            }
            @keyframes fall-3 {
              0% { transform: translateY(0) rotate(0deg); }
              100% { transform: translateY(100vh) rotate(720deg); }
            }
            .animate-fall-1 {
              animation: fall-1 4s linear infinite;
            }
            .animate-fall-2 {
              animation: fall-2 3.5s linear infinite;
            }
            .animate-fall-3 {
              animation: fall-3 4.5s linear infinite;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}