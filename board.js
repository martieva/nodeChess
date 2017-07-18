
class Square{
  constructor(number, color, Piece){
    this.number = number
    this.color = color
    this.piece = Piece
  }
  fill(Piece){
    if(!isEmpty()){
      console.log("Square is not empty.");
      return;
    }
    this.piece = Piece
  }
  clear(){
    this.piece = null;
  }
  isEmpty(){
    return !this.piece;
  }
}
