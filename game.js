var asteroid = new Image();
asteroid.src = "./img/STAR.png";

var mine = new Image();
mine.src = "./img/MINE.png";

var robotSpaceShip = new Image();
robotSpaceShip.src = "./img/ROB.png";

var userSpaceShip = new Image();
userSpaceShip.src = "./img/SHIP.png";

var userSpaceShip = new Image();
userSpaceShip.src = "./img/actMINE.png";

// Global Variables for Game Initialisation
var gameBoard = null;
var gameLogic = null;
var gameInterface = null;

// Game Initialisation
function gameInit() {
    gameBoard = new GameBoard(10); // Create a 10x10 game board
    gameLogic = new GameLogic(gameBoard); // Initialize game logic with the game board
    gameInterface = new GameInterface(gameLogic); // Create the game interface

    // Set up the board cells with click listeners
    gameBoard.setBoardCell(gameInterface.cellClick.bind(gameInterface));

    // Additional event listeners for game interactions
    window.addEventListener('load', () => {
        document.getElementById("placeButton").addEventListener("click", () => {
            let row = gameInterface.activeCoordinates.row;
            let col = gameInterface.activeCoordinates.col;
            let selectedCharac = document.getElementById("character").value;
            gameLogic.setBoardCell(row, col, selectedCharac);
            gameInterface.refreshImage(row, col);
        });

        document.getElementById("removeButton").addEventListener("click", () => {
            let row = gameInterface.activeCoordinates.row;
            let col = gameInterface.activeCoordinates.col;
            gameBoard.removeObject(row, col);
            gameInterface.refreshImage(row, col);
        });

        document.getElementById("playButton").addEventListener("click", () => {
            gameLogic.finishSetting();
            gameInterface.doUpdate(); // Start the game
        });
    });

    // Additional test setup for initial placement (if needed)
    // gameBoard.placeObject(new GameObject(9, 9, "robotic"), 9, 9);
    // gameBoard.placeObject(new GameObject(1, 1, "mine"), 1, 1);
    // gameBoard.placeObject(new GameObject(2, 2, "mine"), 2, 2);
    // gameBoard.placeObject(new GameObject(3, 3, "asteroid"), 3, 3);
    // gameLogic.userSpaceship = new GameObject(0, 0, "user");
    // gameBoard.placeObject(gameLogic.userSpaceship, 0, 0);
}

class GameObject {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        var types = ["user", "robotic", "asteroid", "mine", "user_mine", "active_mine"];
        if (!types.includes(type)) {
            throw new Error("Invalid object type");
        }
        if (type == "mine") {
            this.isActive = false;
        }
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    getType() {
        return this.type;
    }

    setType(type) {
        this.type = type;
    }
}

class GameBoard {
    constructor(size) {
        this.size = size;
        this.board = new Array(size).fill(null).map(() => new Array(size).fill(null));
    }

    placeObject(object, x, y) {
        if (this.isValidPosition(x, y)) {
            this.board[x][y] = object;
        } else {
            console.log("Invalid position");
        }
    }

    removeObject(x, y) {
        if (this.isValidPosition(x, y)) {
            this.board[x][y] = null;
        } else {
            console.log("Invalid position");
        }
    }

    getObject(x, y) {
        if (this.isValidPosition(x, y)) {
            return this.board[x][y];
        } else {
            console.log("Invalid position");
            return null;
        }
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    isPlaceable(x, y) {
        return this.board[x][y] === null;
    }

    setBoardCell(fuc) {
        const table = document.getElementById("table");
        table.innerHTML = "";
    
        const gridSize = 600;
        table.style.width = `${gridSize}px`;
        table.style.height = `${gridSize}px`;
        table.style.display = "grid";
        table.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        table.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
        table.style.gap = "1px";
        table.style.border = "1px solid black";
        table.style.backgroundColor = "black";

        // Create the cells and attach event listeners
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const cell = document.createElement("div");
                cell.setAttribute("id", `${x}${y}`);
                cell.style.backgroundColor = "white";
                cell.style.border = "1px solid black";
                cell.style.display = "flex";
                cell.style.justifyContent = "center";
                cell.style.alignItems = "center";
    
                cell.addEventListener("click", () => fuc(x, y));
    
                table.appendChild(cell);
            }
        }
    }
    
}

class GameLogic {
    constructor(gameBoard) {
        this.gameBoard = gameBoard;
        this.isStart = false;
        this.isEnd = false;
        this.roundNumber = 1;
        this.userSpaceshipCount = 0;
        this.inactiveMineCount = 0;
        this.roboticSpaceshipCount = 0;
        this.roboticArray = [];
        this.mineArray = [];
        this.asteroidArray = [];
        this.userSpaceship = null;
        this.currentTurn = "User";
    }
    
    isSurround(x1, y1, x2, y2) {
        return  Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1
    }

    checkEnd() {
        if( this.userSpaceship==null ||  this.roboticSpaceshipCount == 0 ||  this.inactiveMineCount == 0){
            console.log("userSpaceship " + " roboticSpaceshipCount = " +  this.roboticSpaceshipCount + " inactiveMineCount = " +  this.inactiveMineCount)
            this.isEnd = true
        }
        if (!this.checkMoveable()) {
            console.log("there is no moveable object")
            this.isEnd = true
        }
        return this.isEnd
    }

    checkMoveable() {
        for (var x = 0; x < this.gameBoard.size; x++) {
            for (var y = 0; y < this.gameBoard.size; y++) {
                var object = this.gameBoard.getObject(x, y);
                if (object != null && object.getType() == "robotic") {
                    if (this.checkRoboticCanMove(x, y)) {
                        return true;
                    }
                }
            }
        }
        if(this.userSpaceship != null && this.checkUserCanMove()){
            return true;
        }
        return false
    }

    checkUserCanMove() {
        const directions = [
            [-1, 0], // UP
            [0, -1], // LEFT
            [0, 1],  // RIGHT
            [1, 0]   // DOWN
        ];
    
        for (const [dx, dy] of directions) {
            const newX = this.userSpaceship.getX() + dx;
            const newY = this.userSpaceship.getY() + dy;
            if (!this.gameBoard.isValidPosition(newX, newY)) {
                continue;
            }
           var object = this.gameBoard.getObject(newX, newY)
            if (object == null || (object.getType() !== "active_mine")) {
                return [newX, newY];
            }
        }
    
        return false;
    }

    updateMineDestroy() {
        for (var x = 0; x < this.gameBoard.size; x++) {
            for (var y = 0; y < this.gameBoard.size; y++) {
                var object = this.gameBoard.getObject(x, y);
                if (object!= null && object.getType() == "active_mine") {
                    this.activeMineDestroySurround(x, y);
                }
            }
        }
    }

    activeMineDestroySurround(x, y) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1], // UP
            [0, -1],           [0, 1],  // LEFT and RIGHT
            [1, -1],  [1, 0],  [1, 1]   // DOWN
        ];

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (!this.gameBoard.isValidPosition(newX, newY)) {
                continue;
            }
            var object = this.gameBoard.getObject(newX, newY)
            if (object != null  && object.getType() === "robotic") {
                this.gameBoard.removeObject(newX, newY);
                this.roboticSpaceshipCount--;
            }
            if (object != null  && object.getType() === "asteroid") {
                this.gameBoard.removeObject(newX, newY);
            }
        }
        return false;
    }

    finishSetting() {
        if (this.userSpaceship == null) {
            return "You need to place user spaceship on the board! input 'u' on the cell"; 
        }
        this.isStart = true;
        this.checkEnd();
        if (!this.isEnd) {
            this.currentTurn = "User"
        }
        return null;
    }

    
    setBoardCell(x, y, input) {
        var gameObject = null;
        switch (input) {
            case "u":
                if (this.userSpaceship != null) {
                    return "the user spaceship is already placed on the board";
                }
                gameObject = new GameObject(x, y, "user");
                this.userSpaceship = gameObject;
                break;
            case "r":
                this.roboticSpaceshipCount++;
                gameObject = new GameObject(x, y, "robotic");
                break;
            case "a":
                gameObject = new GameObject(x, y, "asteroid");
                break;
            case "m":
                this.inactiveMineCount++;
                gameObject = new GameObject(x, y, "mine");
                break;
        }
        this.gameBoard.placeObject(gameObject, x, y);
        return null;
    }

    userMove(input) {
        if (!this.checkUserCanMove()) {
            return "User is not able to move!";
        }
        var userRow = this.userSpaceship.getX();
        var userColumn = this.userSpaceship.getY();
        let newRow = userRow;
        let newColumn = userColumn;
        
        switch (input) {
            case "w":
                newRow = userRow - 1
                break;
            case "a":
                newColumn = userColumn - 1
                break;
            case "s":
                newRow = userRow + 1
                break;
            case "d":
                newColumn = userColumn + 1
                break;
            default:
                return "Please enter a valid input (w, a, s, d)";
        }
        
        if (newRow < 0 || newRow > 9 || newColumn < 0 || newColumn > 9) {
            return "The move is out of the board, move fails";
        }
        var newObject = this.gameBoard.getObject(newRow, newColumn);
        if ( newObject!= null && newObject.getType() == "asteroid") {
            return "User spaceship cannot move to the asteroid, move fails";
        }
        this.updateUserPosition(newRow, newColumn);
            
        this.updateMineDestroy()
        this.checkEnd()
        if (!this.isEnd) {
            this.currentTurn = "Computer"
        }
        return null;
    }

    
    //Computer Turn Operation.
    computerTurn() {
        for (var x = 0; x < this.gameBoard.size; x++) {
            for (var y = 0; y < this.gameBoard.size; y++) {
                var object = this.gameBoard.getObject(x, y);
                if (object!= null && object.getType() == "robotic") {
                    this.roboticMove(x, y);
                    this.updateMineDestroy();
                }
            }
        }
        
        this.roundNumber++
        this.checkEnd()
        if (!this.isEnd) {
            this.currentTurn = "User"
        }
        return null;
    }
    
    // Update user position on the board.
    updateUserPosition(newRow, newColumn) {
        var oldRow = this.userSpaceship.getX();
        var oldColumn = this.userSpaceship.getY();
        console.log("updateUserPosition oldRow = " + oldRow + " oldColumn = " + oldColumn + " newRow = " + newRow + " newColumn = " + newColumn);
        var oldObject = this.gameBoard.getObject(oldRow, oldColumn);
        if (oldObject.getType() == "user") {
            this.gameBoard.removeObject(oldRow, oldColumn);
        } else if (oldObject.getType() == "user_mine") {
            this.gameBoard.placeObject(new GameObject(oldRow, oldColumn, "active_mine"), oldRow, oldColumn);
        }

        var newObject = this.gameBoard.getObject(newRow, newColumn);
        
        if (newObject == null) {
            this.userSpaceship = new GameObject(newRow, newColumn, "user");
            this.gameBoard.placeObject( this.userSpaceship, newRow, newColumn);
        }else{
            if (newObject.getType() == "mine") {
                this.inactiveMineCount--;
                this.userSpaceship = new GameObject(newRow, newColumn, "user_mine");
                this.gameBoard.placeObject( this.userSpaceship, newRow, newColumn);
            } else if (newObject.getType() == "active_mine") {
                this.userSpaceship = new GameObject(newRow, newColumn, "user_mine");
                this.gameBoard.placeObject( this.userSpaceship, newRow, newColumn);
            } else if (newObject.getType() == "robotic") {
                this.userSpaceship = null; // Remove user spaceship, user lose
            }
        }

    }
    
    roboticMove(oldRow, oldColumn) {
        var defaultMove = this.checkRoboticCanMove(oldRow, oldColumn)
        
        // If the robotic spaceship cannot move, return
        if (!defaultMove) { 
            return
        }
    
        // Check if user spaceship is in the surrounding area. If so, move to the user spaceship.
        if (this.checkUserSpaceshipSurround(oldRow, oldColumn)) {
            this.updateRoboticPosition(oldRow, oldColumn, this.userSpaceship.getX(), this.userSpaceship.getY());
            return;
        }
    
        // Check if there are inactive mine surround. If so, move to the inactive mine.
        var inactiveMineMove = this.checkInactiveMineSurround(oldRow, oldColumn)
        if (inactiveMineMove) {
            this.updateRoboticPosition(oldRow, oldColumn,  inactiveMineMove[0], inactiveMineMove[1]);
            return;
        } 
    
        var closeMove = this.checkCloseMove(oldRow, oldColumn)
        if (closeMove) {
            this.updateRoboticPosition(oldRow, oldColumn, closeMove[0], closeMove[1]);
            return;
        }
    
        // move to the default move
        this.updateRoboticPosition(oldRow, oldColumn, defaultMove[0], defaultMove[1]);
    }

    checkRoboticCanMove(x, y) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1], // UP
            [0, -1],           [0, 1],  // LEFT and RIGHT
            [1, -1],  [1, 0],  [1, 1]   // DOWN
        ];

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (!this.gameBoard.isValidPosition(newX, newY)) {
                continue;
            }
            var  object = this.gameBoard.getObject(newX, newY)
            if (object == null || (object.getType() != "asteroid" && object.getType() != "robotic")) {
                return [newX, newY];
            }
        }
        return false;
    }

    
    checkUserSpaceshipSurround(x, y) {
        if (this.isSurround(x, y, this.userSpaceship.getX(), this.userSpaceship.getY())) {
            return true;
        }
        return false;
    } 

    checkInactiveMineSurround(x, y) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1], // UP
            [0, -1],           [0, 1],  // LEFT and RIGHT
            [1, -1],  [1, 0],  [1, 1]   // DOWN
        ];

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (!this.gameBoard.isValidPosition(newX, newY)) {
                continue;
            }
            var object = this.gameBoard.getObject(newX, newY)
            if (object != null  && object.getType() == "mine") {
                return [newX, newY];
            }
        }
        return false;
    }

    checkObjectSurround(x, y, objectType) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1], // UP
            [0, -1],           [0, 1],  // LEFT and RIGHT
            [1, -1],  [1, 0],  [1, 1]   // DOWN
        ];

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (!this.gameBoard.isValidPosition(newX, newY)) {
                continue;
            }
            var object = this.gameBoard.getObject(newX, newY)
            if (object != null  && object.getType() === objectType) {
                return [newX, newY];
            }
        }
        return false;
    }
    
    // move to the user spaceship more closely
    checkCloseMove(x, y) {
        var userRow = this.userSpaceship.getX();
        var userColumn = this.userSpaceship.getY();
        const move = [];
        const dx = Math.sign(userRow - x); // Determine the direction of movement on the x-axis
        const dy = Math.sign(userColumn - y); // Determine the direction of movement on the y-axis

        // If the user is in the same row or column, move towards the user
        move[0] = x === userRow ? x : x + dx;
        move[1] = y === userColumn ? y : y + dy;

        var object = this.gameBoard.getObject(move[0], move[1]);
        if (object == null || (object.getType() != "active_mine" && object.getType() != "robotic")) {
            return move
        }

        return false;
    }
    
    updateRoboticPosition(oldRow, oldColumn, newRow, newColumn) {
        console.log("updateRoboticPosition oldRow = " + oldRow + " oldColumn = " + oldColumn + " newRow = " + newRow + " newColumn = " + newColumn);
        var oldObject = this.gameBoard.getObject(oldRow, oldColumn);
        if (oldObject!=null && oldObject.getType() == "robotic") {
            this.gameBoard.removeObject(oldRow, oldColumn);
        }

        var newObject = this.gameBoard.getObject(newRow, newColumn);
        if (newObject != null) {
            if (newObject.getType() == "user") {
                this.userSpaceship = null; // Remove user spaceship, user lose
            } else if (newObject.getType() == "mine") {
                this.inactiveMineCount--; // mine is destroyed
            }
        }
        this.gameBoard.placeObject(new GameObject(newRow, newColumn, "robotic"), newRow, newColumn);
    }

}

class GameInterface {
    constructor(gameLogic) {
        this.gameLogic = gameLogic;
        this.gameBoard = gameLogic.gameBoard;
        this.userInput = document.getElementById("userInput");
        this.userButton = document.getElementById("userButton");
        this.computerButton = document.getElementById("computerButton");
        this.settingButton = document.getElementById("settingButton");
        this.notice = document.getElementById("notice");
        this.turnMessage = document.getElementById("turnMessage");
        this.gameMessage = document.getElementById("gameMessage");

        // Initial stage message
        this.turnMessage.innerHTML = "Setting Stage";

        // Add event listeners to UI elements
        this.settingButton.addEventListener("click", this.finishSetting.bind(this));
        this.userButton.addEventListener("click", this.userMove.bind(this));
        this.computerButton.addEventListener("click", this.computerTurn.bind(this));

        // Images for the various game objects
        this.imageBank = {
            user: userSpaceShip.src,
            user_mine: userSpaceShip.src,
            robotic: robotSpaceShip.src,
            mine: mine.src,
            active_mine: mine.src,
            asteroid: asteroid.src,
        };
    }

    // Main update function to refresh the board and game state
    doUpdate() {
        this.updateGameMessage();
        this.updateStage(this.gameLogic.currentTurn);

        // Refresh every cell on the game board
        for (var x = 0; x < this.gameBoard.size; x++) {
            for (var y = 0; y < this.gameBoard.size; y++) {
                this.refreshImage(x, y);
            }
        }

        // If the game has ended, handle it
        if (this.gameLogic.isEnd) {
            this.endGame();
        }
    }

    // Complete setup and begin the game
    finishSetting() {
        const message = this.gameLogic.finishSetting();
        if (message) {
            alert(message);
            return;
        }

        // Change setting button to end game button
        this.settingButton.innerHTML = "<button type='button'>Finish Playing<span class='pus'></span></button>";
        this.settingButton.addEventListener("click", this.endGame.bind(this));

        // Unhide user and computer buttons
        this.userInput.removeAttribute("hidden");
        this.computerButton.removeAttribute("hidden");

        this.doUpdate();
    }

    // Handles cell click during setup
    cellClick(x, y, event) {
        if (this.gameLogic.isStart) {
            return; 
        }

        if (!this.gameBoard.isPlaceable(x, y)) {
            alert(`Grid position [${x},${y}] is already taken`);
            return;
        }

        const input = prompt("Please enter the object in this cell:");
        if (!input || !["a", "m", "r", "u"].includes(input)) {
            if (input !== null) {
                alert("Invalid object type");
            }
            return;
        }

        const message = this.gameLogic.setBoardCell(x, y, input);
        if (message) {
            alert(message);
            return;
        }

        this.refreshImage(x, y); // Update the cell with the new object
    }

    // Move the user spaceship based on input
    userMove() {
        const input = document.getElementById("inputValue").value;
        const message = this.gameLogic.userMove(input);

        if (message) {
            this.updateNotice(message);
            return;
        }

        this.doUpdate(); // Refresh the game state
    }

    // Execute the computer's turn
    computerTurn() {
        this.gameLogic.computerTurn();
        this.doUpdate();
    }

    // Ends the game and displays the final result
    endGame() {
        this.updateGameResult();
        this.userInput.setAttribute("hidden", "hidden");
        this.computerButton.setAttribute("hidden", "hidden");
        this.settingButton.setAttribute("hidden", "hidden");
    }

    // Display the result of the game when it ends
    updateGameResult() {
        var result = "Game End<br>";
        if (this.gameLogic.roboticSpaceshipCount === 0) {
            result += "User Wins!";
        } else if (this.gameLogic.userSpaceship === null) {
            result += "Computer Wins!";
        } else {
            result += "Draw!";
        }

        this.updateNotice(result);
    }

    // Update game information like round number and spaceship counts
    updateGameMessage() {
        var message = `<b>Round: ${this.gameLogic.roundNumber}</b><br>`;
        message += `<b>Inactive Mines: ${this.gameLogic.inactiveMineCount}</b><br>`;
        message += `<b>Robotic Spaceships: ${this.gameLogic.roboticSpaceshipCount}</b><br>`;
        this.gameMessage.innerHTML = message;
    }

    // Switch between user and computer turn
    updateStage(stage) {
        switch (stage) {
            case "User":
                this.computerButton.setAttribute("disabled", "disabled");
                this.userButton.removeAttribute("disabled");
                this.turnMessage.innerHTML = "User Turn";
                break;

            case "Computer":
                this.userButton.setAttribute("disabled", "disabled");
                this.computerButton.removeAttribute("disabled");
                this.turnMessage.innerHTML = "Computer Turn";
                break;
        }
    }

    // Display a message in the notice area
    updateNotice(message) {
        this.notice.innerHTML = message;
    }

    // Update the image in a specific cell based on the game object type
    refreshImage(x, y) {
        const id = `${x}${y}`;
        const cell = document.getElementById(id);

        const typeToImageMap = {
            user: "img/SHIP.png",
            user_mine: "img/SHIP.png",
            robotic: "img/ROB.png",
            mine: "img/MINE.png",
            active_mine: "img/actMine.png",
            asteroid: "img/STAR.png",
        };

        const object = this.gameBoard.getObject(x, y);
        let image = "";

        if (object != null && typeToImageMap[object.getType()]) {
            image = `<img src='${typeToImageMap[object.getType()]}' />`;
        }

        if (cell) {
            cell.innerHTML = image;
        }
    }
}
