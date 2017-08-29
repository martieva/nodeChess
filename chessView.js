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
