var util = require('util');
var pieces = require('./pieces.js');
var board = [];
var turn = 'w';
var checkedKing;

function populateBoard(){
  for(let r = 1; r < 9; r++){
    for(let c = 1; c < 9; c++){
      if(!board[r]) board[r] = [];

      if(r == 1){
        setMiddle(r, c, 'w');
      }else if(r == 2){
        //board[r][c] = new pieces.Pawn('w', r, c);
      }else if(r == 7){
        //board[r][c] = new pieces.Pawn('b', r, c);
      }else if(r == 8){
        setMiddle(r, c, 'b');
      }
    }
  }
}

function setMiddle(r, c, color){
  if(c == 1 || c == 8){
    board[r][c] = new pieces.Rook(color, r, c);
  }else if(c == 2 || c == 7){
    board[r][c] = new pieces.Knight(color, r, c);
  }else if(c == 3 || c == 6){
    board[r][c] = new pieces.Bishop(color, r, c);
  }else if(c == 4){
    board[r][c] = new pieces.King(color, r, c);
  }else{
    board[r][c] = new pieces.Queen(color, r, c);
  }
}

var selectedPiece = null;

function selectPiece(x, y){
  selectedPiece = board[x][y];
}

function printBoard(){
  for(let r = 8; r > 0; r--){
    let boardMap = "" + r + " ";
    for(let c = 1; c < 9; c++){
      let spot = board[r][c] ? board[r][c].name : ' ';
      boardMap += '[' + spot + ']';
    }
    console.log(boardMap);
  }
  console.log('   1  2  3  4  5  6  7  8');
}

populateBoard();
//console.log(board)
printBoard();
console.log('Awaiting Input.');

process.stdin.on('data', function (input) {
  let text = input.substring(0, input.length-2);
  if (text === 'quit' || text === 'q') {
    done();
  }else if(text === 'h'){
    console.log('--Options--');
    console.log('1: Print Board.');
    console.log('2: See Valid Moves. ');
    console.log('Select Piece with select [number],[number]');
    console.log('Move with move [number],[number]');
    console.log('To Quit enter q or quit.');
  }else if(text === '1' || text == 1){
    printBoard();
  }else if(text === '2' || text == 2){
    console.log(selectedPiece.validMoves());
  }else if(text === '3' || text == 3){

  }else if(text.indexOf('move')>-1){
    if(!selectedPiece){
      console.log("Select a piece.");
    }else{
      let coordinates = text.match(/\d+/g); // Get a list of all integers
      let result = selectedPiece.move(parseInt(coordinates[0].trim()), parseInt(coordinates[1].trim()));
      if(result){
        turn = (turn == 'w') ? 'b' : 'w';
        if(typeof result == 'array'){
          checkedKing = result;
        }else{
          checkedKing = null;
        }
      }

    }
  }else if(text.indexOf('select')>-1){
    let coordinates = text.match(/\d+/g);
    let piece = board[parseInt(coordinates[0].trim())][parseInt(coordinates[1].trim())];
    if(piece && piece.color == turn){
      if(checkedKing && (checkedKing[0] != coordinates[0] || checkedKing[1] != coordinates[1])){
        console.log(`Your king is in Check and must be moved.`)
      }
      selectedPiece = piece;
      console.log(`Selected ${selectedPiece.name} at ${coordinates[0]}, ${coordinates[1]}`);
    }else{
      console.log(`Select a ${turn} piece`);
    }
  }
});

function done() {
  console.log('Done.');
  process.exit();
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

module.exports.getBoard = function(){
  return board;
}
