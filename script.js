let board = ["","","","","","","","",""];
let currentPlayer = "X";
let running = false;

let gameMode = "multi";
let difficulty = "easy";

/* leaderboard stats */

let p1Wins = 0;
let p1Losses = 0;
let p1Draws = 0;

let p2Wins = 0;
let p2Losses = 0;
let p2Draws = 0;

/* overlay tracking */
let activeOverlay = null;
let overlayTimers = [];

const cells = document.querySelectorAll(".cell");
const turnText = document.getElementById("turnText");
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const winLine = document.getElementById("winLine");

const player1Label = document.getElementById("player1Label");
const player2Label = document.getElementById("player2Label");

const rulesBox = document.getElementById("rulesBox");

const modeButtons = document.getElementById("modeButtons");
const difficultyButtons = document.getElementById("difficultyButtons");

const winPatterns = [
[0,1,2],[3,4,5],[6,7,8],
[0,3,6],[1,4,7],[2,5,8],
[0,4,8],[2,4,6]
];

cells.forEach(cell => cell.addEventListener("click", cellClicked));

function selectMode(mode){

gameMode = mode;

if(mode === "single"){

modeButtons.classList.add("hidden");
difficultyButtons.classList.remove("hidden");

rulesBox.innerHTML = `
<h3>Select Difficulty</h3>
<p>Choose how challenging you want the computer opponent to be.</p>
`;

player1Label.textContent = "Player";
player2Label.textContent = "Computer";

}else{

player1Label.textContent = "Player 1";
player2Label.textContent = "Player 2";

startGame();

}

}

function startGameWithDifficulty(level){

difficulty = level;
startGame();

}

function startGame(){

startScreen.classList.add("hidden");
gameScreen.classList.remove("hidden");

running = true;
currentPlayer = "X";

turnText.textContent =
gameMode === "single" ? "Player Turn" : "Player 1 Turn";

}

function cellClicked(){

const index = this.dataset.index;

if(board[index] !== "" || !running) return;

makeMove(index,currentPlayer);

if(gameMode === "single" && running && currentPlayer === "O"){
setTimeout(aiMove,400);
}

}

function makeMove(index,player){

board[index] = player;
cells[index].textContent = player;

checkWinner();

}

/* AI */

function aiMove(){

let move;

if(difficulty === "easy") move = randomMove();

if(difficulty === "medium"){
move = Math.random()<0.5 ? randomMove() : bestMove();
}

if(difficulty === "hard") move = bestMove();

makeMove(move,"O");

}

function randomMove(){

let empty = board
.map((v,i)=> v === "" ? i : null)
.filter(v => v !== null);

return empty[Math.floor(Math.random()*empty.length)];

}

function bestMove(){

let empty = board
.map((v,i)=> v === "" ? i : null)
.filter(v => v !== null);

for(let i of empty){

board[i] = "O";
if(checkTempWin("O")){
board[i] = "";
return i;
}
board[i] = "";

}

for(let i of empty){

board[i] = "X";
if(checkTempWin("X")){
board[i] = "";
return i;
}
board[i] = "";

}

return randomMove();

}

function checkTempWin(player){

for(let p of winPatterns){

if(
board[p[0]]===player &&
board[p[1]]===player &&
board[p[2]]===player
){
return true;
}

}

return false;

}

/* WINNER CHECK */

function checkWinner(){

for(let pattern of winPatterns){

let a = board[pattern[0]];
let b = board[pattern[1]];
let c = board[pattern[2]];

if(a && a===b && b===c){

running=false;

/* DRAW WIN LINE */
drawWinLine(pattern);

/* UPDATE STATS */

if(a==="X"){

p1Wins++;
p2Losses++;

document.getElementById("p1Wins").textContent=p1Wins;
document.getElementById("p2Loss").textContent=p2Losses;

}else{

p2Wins++;
p1Losses++;

document.getElementById("p2Wins").textContent=p2Wins;
document.getElementById("p1Loss").textContent=p1Losses;

}

/* MESSAGE */

let message =
gameMode==="single"
? (a==="X" ? "Player Wins!" : "Computer Wins!")
: (a==="X" ? "Player 1 Wins!" : "Player 2 Wins!");

turnText.textContent = message;

/* SHOW OVERLAY */
showGameResult(message);

return;

}

}

/* DRAW CHECK */

if(!board.includes("")){

running=false;

p1Draws++;
p2Draws++;

document.getElementById("p1Draw").textContent = p1Draws;
document.getElementById("p2Draw").textContent = p2Draws;

turnText.textContent="Match Drawn!";

showGameResult("Match Drawn!");

return;

}

currentPlayer = currentPlayer==="X" ? "O" : "X";

turnText.textContent =
gameMode==="single"
? (currentPlayer==="X" ? "Player Turn" : "Computer Turn")
: (currentPlayer==="X" ? "Player 1 Turn" : "Player 2 Turn");

}

/* WIN LINE */

function drawWinLine(pattern){

const boardElement = document.querySelector(".board");

const firstCell = cells[pattern[0]];
const lastCell = cells[pattern[2]];

const boardRect = boardElement.getBoundingClientRect();
const firstRect = firstCell.getBoundingClientRect();
const lastRect = lastCell.getBoundingClientRect();

const x1 = firstRect.left + firstRect.width/2 - boardRect.left;
const y1 = firstRect.top + firstRect.height/2 - boardRect.top;

const x2 = lastRect.left + lastRect.width/2 - boardRect.left;
const y2 = lastRect.top + lastRect.height/2 - boardRect.top;

const length = Math.hypot(x2-x1,y2-y1);
const angle = Math.atan2(y2-y1,x2-x1)*180/Math.PI;

winLine.style.width = length+"px";
winLine.style.top = y1+"px";
winLine.style.left = x1+"px";
winLine.style.transformOrigin="left center";
winLine.style.transform=`rotate(${angle}deg)`;

}

/* RESULT OVERLAY */

function clearOverlay(){

/* cancel any pending timers */
overlayTimers.forEach(t => clearTimeout(t));
overlayTimers = [];

/* remove overlay from DOM immediately */
if(activeOverlay){
activeOverlay.remove();
activeOverlay = null;
}

}

function showGameResult(message){

/* remove any previous overlay first */
clearOverlay();

const boardElement = document.querySelector(".board");

const overlay = document.createElement("div");

overlay.textContent = message;

overlay.style.position = "absolute";
overlay.style.top = "50%";
overlay.style.left = "50%";
overlay.style.transform = "translate(-50%, -50%)";

overlay.style.background = "#ffffff";
overlay.style.border = "1px solid #e4e4e7";
overlay.style.borderRadius = "14px";
overlay.style.padding = "18px 30px";

overlay.style.fontSize = "22px";
overlay.style.fontWeight = "600";

overlay.style.boxShadow = "0 10px 25px rgba(0,0,0,0.12)";
overlay.style.zIndex = "9999";

overlay.style.color = "#0f172a";

overlay.style.opacity = "0";
overlay.style.transition = "opacity 0.3s ease";
overlay.style.whiteSpace = "nowrap";

boardElement.style.position = "relative";
boardElement.appendChild(overlay);

/* track the active overlay */
activeOverlay = overlay;

const t1 = setTimeout(()=>{ overlay.style.opacity="1"; }, 10);

const t2 = setTimeout(()=>{
overlay.style.opacity="0";
const t3 = setTimeout(()=>{
if(activeOverlay === overlay){
overlay.remove();
activeOverlay = null;
}
},300);
overlayTimers.push(t3);
},5000);

overlayTimers.push(t1, t2);

}

/* RESTART */

function restartGame(){

/* clear overlay and timers on restart */
clearOverlay();

board=["","","","","","","","",""];

cells.forEach(c=>c.textContent="");

winLine.style.width="0";

running=true;
currentPlayer="X";

turnText.textContent =
gameMode==="single" ? "Player Turn" : "Player 1 Turn";

}