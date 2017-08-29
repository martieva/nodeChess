//TODO: Replace var with const/let. Maybe turn pieces into a factory.
var pieces = new Pieces();
var model = new ChessModel();
var controller = new ChessController();
var view = new ChessView();

var turn = 'w';
var checkedKing;
var selectedPiece = null;

view.printBoard();
console.log('Awaiting Input.');

process.stdin.on('data', function(input){controller.inputHandler(input)});

process.stdin.resume();
process.stdin.setEncoding('utf8');

module.exports.getBoard = function(){
  return model.board;
}


function ChessView(){
  this.printBoard = function(){
    for(let r = 8; r > 0; r--){
      let boardMap = "" + r + " ";
      for(let c = 1; c < 9; c++){
        let spot = model.board[r][c] ? model.board[r][c].name : ' ';
        boardMap += '[' + spot + ']';
      }
      console.log(boardMap);
    }
    console.log('   1  2  3  4  5  6  7  8');
  }
}

function ChessController(){
  function quit(){
    console.log('Done.');
    process.exit();
  }
  function help(){
    console.log('--Options--');
    console.log('print: Print Board.');
    console.log('moves: See Valid Moves. ');
    console.log('select: Select Piece with select [number],[number]');
    console.log('move: Move with move [number],[number]');
    console.log('quit: To Quit.');
  }
  function print(){
    view.printBoard();
  }
  function moves(){
    console.log(selectedPiece.validMoves());
  }
  function move(){
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
  }
  function select(){
    let coordinates = text.match(/\d+/g);
    let piece = model.board[parseInt(coordinates[0].trim())][parseInt(coordinates[1].trim())];
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
  const options = {quit, help, print, moves, move, select}
  this.inputHandler = function(input){
    let text = input.substring(0, input.length-2);
    options[text]();
  }
}

function ChessModel(){
  this.board = [];
  this.populateBoard = function(){
    for(let r = 1; r < 9; r++){
      for(let c = 1; c < 9; c++){
        if(!this.board[r]) this.board[r] = [];

        if(r == 1){
          this.setMiddle(r, c, 'w');
        }else if(r == 2){
          this.board[r][c] = new pieces.Pawn('w', r, c);
        }else if(r == 7){
          this.board[r][c] = new pieces.Pawn('b', r, c);
        }else if(r == 8){
          this.setMiddle(r, c, 'b');
        }
      }
    }
  }
  this.setMiddle = function(r, c, color){
    if(c == 1 || c == 8){
      this.board[r][c] = new pieces.Rook(color, r, c);
    }else if(c == 2 || c == 7){
      this.board[r][c] = new pieces.Knight(color, r, c);
    }else if(c == 3 || c == 6){
      this.board[r][c] = new pieces.Bishop(color, r, c);
    }else if(c == 4){
      this.board[r][c] = new pieces.King(color, r, c);
    }else{
      this.board[r][c] = new pieces.Queen(color, r, c);
    }
  }
  this.populateBoard();
}

function Pieces(){
  var kingMap = new Map();
  kingMap.set('b', []);
  kingMap.set('b1', []);
  kingMap.set('w', []);
  kingMap.set('w1', []);

  //In a larger application I might prefer factories, but this lends itself to class inheritence.
  class Piece {
    constructor(color, _x,_y){
      this.color = color;
      this.opColor = this.color == 'w' ? 'b' : 'w';
      this.y = _y;
      this.x = _x;
      this.hasMoved = false;
      this.adjust = createMover(color);
      this.validSpace = createSpaceChecker(color);
    }
    move(_x, _y){
      board = init.getBoard();
      if(!this.validateMove1(_y, _x)){
        console.log("Invalid Move.");
        return;
      }
      if(this.name == 'C' && board[_x][_y].name == 'K' && this.color == board[_x][_y].color){
        //Rook-ing
        let king = board[_x][_y];
        // let castle = this;
        board[this.x][thix.y] = king;
        king.x = this.x; king.y = this.y;
        board[_x][_y] = this;
      }else{
        board[_x][_y] = this;
        board[this.x][this.y] = null;
      }
      this.x = _x; this.y = _y;
      this.hasMoved = true;
      let checked = this.move2();
      return checked ? checked : true;
    }
    validateMove1(_y, _x){
      if(_y > 8 || _y < 1 || _x > 8 || _x < 1){
        console.log("Not on Board.")
        return false;
      }
      // if(board[_x][_y] && board[_x][_y].color == this.color){
      //   console.log(`Friendly Fire.${_x} , ${_y} ,  ${board[_x][_y].name}`);
      //   return false;
      // }
      return this.validateMove2(_x, _y);
    }
    validateMove2(_x, _y){
      return validateMove3(this.validMoves(), _x, _y);
    }
    move2(){
      return checkKingArea(this.opColor, this.validMoves);
    }
  }

  function createMover(color){
    if(color == 'w'){
      return function(x, n){
        return x + n;
      }
    }else{
      return function(x, n){
        return x - n;
      }
    }
  }
  function createSpaceChecker(color){
    return function(x, y){
      if(x<0||x>9||y<0||y>9){
        return false
      }
      let space = board[x][y];
      //console.log("Typeof: " + typeof space + ", " + space.name +", space color: " + space.color + ", " + color);
      if(!space || !space.name || (space.color != color && space.name == 'K')){
        return true;
      }else if(space.color != color){
        return 1;//Another truthy value that can be used to differentiate if needed.
      }else{
        return false;
      }
    }
  }
  function checkKingArea(color, movesFunc){
    let area = kingMap.get(color);
    let kingSpace = kingMap.get(color + '1');
    let moves = movesFunc();
    let result;
    let returnValue;
    let checked = false;
    let surrounded = true;
    for(let i = 0; i < moves.length; i++){
      let m = moves[i];
      if(m[0] == kingSpace[0] && m[1] == kingSpace[1]){
        checked = true;
      }
      for(let k = 0; k < area.length; k++){
        if(area[k] && m[0] == area[k][0] && m[1] == area[k][1]){
          area[2] = true;
        }else{
          surrounded = false;
        }
      }
      if(checked){
        if(surrounded){
          console.log(`Check Mate. ${color == 'w' ? 'b' : 'w'} wins.`);
        }
        return kingSpace;
      }
    }
  }
  function validateMove3(moves, x, y){
    for(let move of moves){
      if(move[0] == x && move[1] == y){
        return true;
      }
    }
    return false;
  }
  class Pawn extends Piece{
    constructor(color, _x, _y){
      super(color, _x, _y);
      this.name = 'p';
    }
    validMoves(){
      board = init.getBoard();
      let moves = new ChessArray();
      if(this.validSpace(this.adjust(this.x,1), this.y)){
        moves.push([this.adjust(this.x,1), this.y]);
        if(!this.hasMoved && this.validSpace(this.adjust(this.x,2), this.y)){
          moves.push([this.adjust(this.x,2), this.y]);
        }
        if(this.validSpace(this.adjust(this.x,1), this.y+1)===1){
          moves.push([this.adjust(this.x,1), this.y+1]);
        }
        if(this.validSpace(this.adjust(this.x,1), this.y-1)===1){
          moves.push([this.adjust(this.x,1), this.y-1]);
        }
      }
      return moves.getArray();
    }
  }
  class Rook extends Piece{
    constructor(color, _x, _y){
      super(color, _x, _y);
      this.name = 'R';
    }
    validMoves(){
      board = init.getBoard();
      let moves = perpendicularMoves(this.x, this.y, this.validSpace);
      if(!this.hasMoved){
        let k = kingMap.get(this.color+'1');
        let king = board[k[0]][k[1]];
        if(!king.hasMoved && king.validSpace(this.x, this.y)){
          //Need to check if Rook-ing would move the King into check.
          if(this.y < k[1]){
            if(this.validSpace(this.x, this.y+1)
            && this.validSpace(this.x, this.y+2)){
              moves.push([this.x, k[1]])
            }
          }else{
            if(this.validSpace(this.x, this.y-1)
            && this.validSpace(this.x, this.y-2)
            && this.validSpace(this.x, this.y-3)){
              moves.push([this.x, k[1]])
            }
          }
        }
      }
      return moves;
    }
  }
  function checkForKing(x, y, color, adjust){
    let safeX = false;
    let safeY = false;
    let safeKnight = false;
    let yAdjust = y == 1 ? add : subtract;
    for(let i = 1; i < 8; i++){
      let a_x = adjust(x, i);
      let xPiece = board[a_x][y];
      if(!safeX && xPiece){
        if(xPiece.color == color){
          safeX = true;
        }else{
          if(xPiece.name == 'R' || xPiece.name == 'Q' || xPiece.name == 'K'){
            return false;
          }
        }
      }
      let xyPiece = board[a_x][yAdjust(y,i)];
      if(!safeY && xyPiece){
        if(xyPiece.color == color){
          safeXY = true;
        }else{
          if(xyPiece.name == 'B' || xyPiece.name == 'Q' || xyPiece.name == 'K' || (i === 1 && xyPiece.name == 'p')){
            return false;
          }
        }
      }

    }
  }
  function perpendicularMoves(x, y, validSpace){
    let moves = new ChessArray();
    let _x = 1;
    let _y = 1;
    let result;
    while((x+_x < 9) && (result=validSpace(x+_x, y))){
      moves.push([x+_x, y]);
      _x++;
      if(result === 1){
        break;
      }
    }
    while((y+_y < 9) && (result=validSpace(x, y+_y))){
      moves.push([x, y + _y]);
      _y++;
      if(result === 1){
        break;
      }
    }
    _x = 1;
    while((x-_x > 0) && (result=validSpace(x-_x, y))){
      moves.push([x-_x, y]);
      _x++;
      if(result === 1){
        break;
      }
    }
    _y = 1;
    while((y-_y > 0) && (result=validSpace(x, y-_y))){
      moves.push([x, y - _y]);
      _y++;
      if(result === 1){
        break;
      }
    }
    return moves.getArray();
  }
  class Knight extends Piece{
    constructor(color, _x, _y){
      super(color, _x, _y);
      this.name = 'N';
    }
    validMoves(){
      board = init.getBoard();
      let moves = new ChessArray();
      let spaces = [];
      spaces[0] = [this.x + 2, this.y +1];
      spaces[1] = [this.x + 2, this.y -1];
      spaces[2] = [this.x - 2, this.y +1];
      spaces[3] = [this.x - 2, this.y -1];
      spaces[4] = [this.x + 1, this.y +2];
      spaces[5] = [this.x + 1, this.y -2];
      spaces[6] = [this.x - 1, this.y +2];
      spaces[7] = [this.x - 1, this.y -2];
      for(let i = 0; i < 8; i++){
        let space1 = spaces[i][0];
        let space2 = spaces[i][1];
        if(validSpace(space1, space2)){
          moves.push(spaces[i]);
        }
      }
      return moves.getArray();
    }
  }
  class Bishop extends Piece{
    constructor(color, _x, _y){
      super(color, _x, _y);
      this.name = 'B';
    }
    validMoves(){
      board = init.getBoard();
      return diagonalMoves(this.x, this.y, this.validSpace);
    }
  }
  function diagonalMoves(x, y, validSpace){
    let moves = new ChessArray();
    moves.concat(findMoves(x,y,add,add));
    moves.concat(findMoves(x,y,add,subtract));
    moves.concat(findMoves(x,y,subtract,add));
    moves.concat(findMoves(x,y,subtract,subtract));
    return moves.getArray();

    function findMoves(x, y, xMod, yMod){
      let _moves = [];
      for(let k = 1; k < 8; k++){
        let _x = xMod(x,k);
        let _y = yMod(y,k);
          if(validSpace(_x, _y)){
          _moves.push([_x,_y]);
          }else{
            break;
          }
      }
      return _moves;
    }
  }
  class Queen extends Piece{
    constructor(color, _x, _y){
      super(color, _x, _y);
      this.name = 'Q';
    }
    validMoves(){
      board = init.getBoard();
      let moves = new ChessArray();
      moves.concat(diagonalMoves(this.x, this.y, this.validSpace));
      moves.concat(perpendicularMoves(this.x, this.y, this.validSpace));
      return moves.getArray();
    }
  }
  class King extends Piece{
    constructor(color, _x, _y){
      super(color, _x, _y);
      this.name = 'K';
    }
    getSquare(){
      let moves = new ChessArray();
        moves.push([this.x + 1, this.y]);
        moves.push([this.x - 1, this.y]);
        moves.push([this.x + 1, this.y + 1]);
        moves.push([this.x + 1, this.y - 1]);
        moves.push([this.x - 1, this.y + 1]);
        moves.push([this.x - 1, this.y - 1]);
        moves.push([this.x, this.y + 1]);
        moves.push([this.x, this.y - 1]);
        return moves.getArray();
    }
    validMoves(){
      board = init.getBoard();
      return this.getSquare().filter(el => this.validSpace(el[0], el[1]));
    }
    validateMove2(_x, _y){
      let yMove = Math.abs(_y - this.y);
      let xMove = Math.abs(_x - this.x);
      let area = kingMap.get(this.color);
      area.forEach(function(el){
        if(el[0] == _x && el[1] == _y && el[2]){
          console.log('Selected space would move you into Check.');
          return false;
        }
      });
      if(yMove<2 && xMove <2){
        return true;
      }
    }
    move2(){
      checkKingArea(this.opColor, this.validMoves());
      kingMap.set(this.color, this.getSquare());
      kingMap.set(this.color + '1', [this.x, this.y]);
    }
  }
  class ChessArray{
    constructor(){
      this.array = [];
    }
    getArray(){
      return this.array;
    }
    push(element){
      if(Array.isArray(element)){
        if(element[0] > 0 && element[0] < 9 && element[1] > 0 && element[1] < 9){
          this.array.push(element);
        }
      }
    }
    concat(_array){
      this.array = this.array.concat(_array);
    }
  }
  function add(a,b){
    return a+b;
  }
  function subtract(a,b){
    return a-b;
  }
}
