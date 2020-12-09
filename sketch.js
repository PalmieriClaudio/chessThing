var pieces = [];
var picArray = [];
var legalMoves = [];
var totalLegalMoves = [];
var auxArray = [];
function preload() {
  P = loadImage("pieces/bp.png");
  p = loadImage("pieces/wp.png");
  R = loadImage("pieces/br.png");
  r = loadImage("pieces/wr.png");
  Q = loadImage("pieces/bq.png");
  q = loadImage("pieces/wq.png");
  N = loadImage("pieces/bn.png");
  n = loadImage("pieces/wn.png");
  K = loadImage("pieces/bk.png");
  k = loadImage("pieces/wk.png");
  B = loadImage("pieces/bb.png");
  b = loadImage("pieces/wb.png");
  picArray.push(["P", P]);
  picArray.push(["p", p]);
  picArray.push(["R", R]);
  picArray.push(["r", r]);
  picArray.push(["Q", Q]);
  picArray.push(["q", q]);
  picArray.push(["N", N]);
  picArray.push(["n", n]);
  picArray.push(["K", K]);
  picArray.push(["k", k]);
  picArray.push(["B", B]);
  picArray.push(["b", b]);
}
function setup() {
  createCanvas(480, 480);
  board = new Board();
  badSetup();
  div = createDiv("");
}

function draw() {
  background(220);
  board.draw();
  for (piece of pieces) {
    piece.draw(mouseX, mouseY);
  }
  for (move of legalMoves) {
    fill(0, 255, 0);
    ellipse((move[0] * 60) - 30, (move[1] * 60) - 30, 10, 10);
  }
}

class Board {
  constructor() {
    this.side = 60;
    this.lightColor = 255;
    this.darkColor = { r: 47, g: 53, b: 145 };
    this.whiteToMove = true;
  }

  draw() {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if ((x % 2) == (y % 2)) {
          fill(color(this.lightColor));
          rect(x * this.side, y * this.side, this.side, this.side);
        } else {
          fill(color(this.darkColor.r, this.darkColor.g, this.darkColor.b));
          rect(x * this.side, y * this.side, this.side, this.side);
        }
      }
    }
  }
}

class Piece {
  constructor(x, y, type, col, drag, drop, moved, en) {
    this.xPos = x;
    this.yPos = map(y, 1, 8, 8, 1);
    this.x = ((x - 1) * 60) + 15;
    this.y = (map(y, 1, 8, 8, 1) * 60) - 15;
    this.type = type;
    this.col = col;
    this.dragging = drag;
    this.dropping = drop;
    this.prevXPos = this.xPos;
    this.prevYPos = this.yPos;
    this.hasMoved = moved;
    this.empassant = en;
  }

  draw(px, py) {
    if (this.dragging) {
      image(getPic(this.type), px - 30, py - 30);
      this.x = px - 15;
      this.y = py + 15;
      this.xPos = Math.ceil(mouseX / 60);
      this.yPos = Math.ceil(mouseY / 60);
    } else {
      if (this.dropping) {
        this.x = ((this.xPos - 1) * 60) + 15;
        this.y = (this.yPos * 60) - 15;
        image(getPic(this.type), this.x - 30, this.y - 30);
        this.dropping = false;
      } else {
        image(getPic(this.type), this.x - 15, this.y - 45);
        this.dropping = false;
      }
    }
  }

  drop() {
    if (canDrop(this)) {
      //check if the piece is a king castling
      //if it is, check the direction and procede to castle
      if (this.type == "k" && !this.hasMoved) {
        if (this.xPos == this.prevXPos - 2) {
          for (pc of pieces) {
            if (pc.type == "r" && pc.xPos == 1) {
              rookCastling(pc, false);
            }
          }
        } else if (this.xPos == this.prevXPos + 2) {
          for (pc of pieces) {
            if (pc.type == "r" && pc.xPos == 8) {
              rookCastling(pc, true);
            }
          }
        }
      } else if (this.type == "K" && !this.hasMoved) {
        if (this.xPos == this.prevXPos - 2) {
          for (pc of pieces) {
            if (pc.type == "R" && pc.xPos == 1) {
              rookCastling(pc, false);
            }
          }
        } else if (this.xPos == this.prevXPos + 2) {
          for (pc of pieces) {
            if (pc.type == "R" && pc.xPos == 8) {
              rookCastling(pc, true);
            }
          }
        }
      }
      //check if the piece moving is a pawn doing a double
      //and in case it is, set empassant to true

      if (this.type == "p" && !this.hasMoved) {
        if (this.prevYPos == this.yPos + 2) {
          this.empassant = true;
        }
      } else if (this.type == "P" && !this.hasMoved) {
        if (this.prevYPos == this.yPos - 2) {
          this.empassant = true;
        }
      }

      this.updatePrevPos();
      board.whiteToMove = !board.whiteToMove;
      this.hasMoved = true;
    } else {
      this.xPos = this.prevXPos;
      this.yPos = this.prevYPos;
    }
    this.dragging = false;
    this.dropping = true;

    //reset stuff
    if (checkCheck()) {
      div.html("Check!");
      totalLegalMoves = [];
    } else {
      div.html("");
      totalLegalMoves = [];
    }
    legalMoves = [];
    for (piece of pieces) {
      if (board.whiteToMove && piece.col == "w") {
        if (piece.empassant == true) {
          piece.empassant = false;
        }
      } else if (!board.whiteToMove && piece.col == "b") {
        if (piece.empassant == true) {
          piece.empassant = false;
        }
      }
    }
  }

  updatePrevPos() {
    this.prevXPos = this.xPos;
    this.prevYPos = this.yPos;
  }
}

function rookCastling(pc, short) {
  if (short) {
    pc.xPos = 6;
    pc.prevXPos = 6;
    pc.dropping = true;
    pc.draw();
  } else {
    pc.xPos = 4;
    pc.prevXPos = 4;
    pc.dropping = true;
    pc.draw();
  }

}

function badSetup() {
  y = 0;
  for (let x = 0; x < 8; x++) {
    pieces[x] = new Piece(x + 1, 7, "P", "b", false, false, false, false);
  }
  for (let x = 0; x < 8; x++) {
    pieces.push(new Piece(x + 1, 2, "p", "w", false, false, false, false));
  }
  var names = ["R", "N", "B", "Q", "K", "B", "N", "R"]
  for (nm of names) {
    pieces.push(new Piece(y + 1, 8, nm, "b", false, false, false, false));
    y++;
  }
  y = 0;
  var namesWhite = ["r", "n", "b", "q", "k", "b", "n", "r"]
  for (nm of namesWhite) {
    pieces.push(new Piece(y + 1, 1, nm, "w", false, false, false, false));
    y++;
  }
}

function mousePressed() {
  updateDrag(true);
}

function mouseReleased() {
  updateDrag(false);
}

function updateDrag(click) {
  var x = Math.ceil(mouseX / 60);
  var y = Math.ceil(mouseY / 60);
  for (piece of pieces) {
    if (piece.dragging) {
      piece.drop();
    } else {
      if (click) {
        if ((piece.xPos == x) && (piece.yPos == y)) {
          if (piece.col == "w") {
            if (board.whiteToMove) {
              piece.updatePrevPos();
              piece.dragging = true;
              getLegalMoves(piece, legalMoves);
              for (move of legalMoves) {
                 if (putsYouInCheck(piece, move)) {
                   auxArray.push(move);
                 }
              }
              for (move of auxArray) {
                legalMoves.splice(legalMoves.indexOf(move), 1);
              }
              auxArray = [];
            }
          } else {
            if (!board.whiteToMove) {
              piece.updatePrevPos();
              piece.dragging = true;
              getLegalMoves(piece, legalMoves);
              for (move of legalMoves) {
                if (putsYouInCheck(piece, move)) {
                  auxArray.push(move);
                }
              }
              for (move of auxArray) {
                legalMoves.splice(legalMoves.indexOf(move), 1);
              }
              auxArray = [];
            }
          }
        }
      }
    }
  }
}
function canDrop(pc) {
  var x = Math.ceil(mouseX / 60);
  var y = Math.ceil(mouseY / 60);
  //For some reason passing an object to includes doesn't
  //check if an indentical object is in the array, but if
  //the object itself is in the array, so here I'm using
  //JSON.stringify to convert my arrays to strings in
  //JSON format and then checking them, which works because
  //I'm now passing a string to includes, which acts as
  //one would expect
  lM = JSON.stringify(legalMoves);
  move = [x, y];
  mv = JSON.stringify(move);
  if (mouseX <= width && 0 <= mouseX && mouseY <= height && 0 <= mouseY) {
    if (lM.includes(mv)) {
      for (piece of pieces) {
        if (piece.prevXPos == x && piece.prevYPos == y) {
          var i = pieces.indexOf(piece);
          pieces.splice(i, 1);
        } else if (piece.empassant == true) {
          if (piece.prevXPos == x) {
            if (pc.type == "p" && piece.prevYPos == y + 1) {
              var i = pieces.indexOf(piece);
              pieces.splice(i, 1);
            } else if (pc.type == "P" && piece.prevYPos == y - 1) {
              var i = pieces.indexOf(piece);
              pieces.splice(i, 1);
            }
          }
        }
      }
      return true;
    } else {
      return false;
    }
  }
}
function getPic(name) {
  for (pic of picArray) {
    if (pic[0] == name) {
      return pic[1];
    }
  }
  return picArray[1][1];
}

function getLegalMoves(piece, legal) {
  //Should probably rewrite the code to check if a square 
  //is occupied instead of checking for every piece if the 
  //square is attacked
  if (piece.type == "p" && board.whiteToMove) {
    getWhitePawnMoves(piece, legal);
  } else if (piece.type == "P" && !board.whiteToMove) {
    getBlackPawnMoves(piece, legal);
  } else if (piece.type == "r" && board.whiteToMove) {
    getRookMoves(piece, legal);
  } else if (piece.type == "R" && !board.whiteToMove) {
    getRookMoves(piece, legal);
  } else if (piece.type == "b" && board.whiteToMove) {
    getBishopMoves(piece, legal);
  } else if (piece.type == "B" && !board.whiteToMove) {
    getBishopMoves(piece, legal);
  } else if (piece.type == "q" && board.whiteToMove) {
    getQueenMoves(piece, legal);
  } else if (piece.type == "Q" && !board.whiteToMove) {
    getQueenMoves(piece, legal);
  } else if (piece.type == "n" && board.whiteToMove) {
    getKnightMoves(piece, legal);
  } else if (piece.type == "N" && !board.whiteToMove) {
    getKnightMoves(piece, legal);
  } else if (piece.type == "k" && board.whiteToMove) {
    getKingMoves(piece, legal);
  } else if (piece.type == "K" && !board.whiteToMove) {
    getKingMoves(piece, legal);
  }
}

function getWhitePawnMoves(piece, legal) {
  var x = piece.prevXPos;
  var y = piece.prevYPos;
  var single = true;
  var double = true;
  var canEatLeft = false;
  var canEatRight = false;
  for (pc of pieces) {
    if (pc.xPos == x && pc.yPos == (y - 1)) {
      single = false;
    }
    if (pc.xPos == x && pc.yPos == (y - 2)) {
      double = false;
    }
    if (pc.xPos == x - 1 && pc.yPos == (y - 1) && pc.col == "b") {
      canEatLeft = true;
    }
    if (pc.xPos == x + 1 && pc.yPos == (y - 1) && pc.col == "b") {
      canEatRight = true;
    }
    if (piece.yPos == 4 && piece.yPos == pc.yPos) {
      if ((pc.xPos == piece.xPos - 1 || pc.xPos == piece.xPos + 1) && pc.empassant == true) {
        legal.push([pc.xPos, y - 1]);
      }
    }
  }
  if (single) {
    legal.push([x, y - 1]);
  }
  if (!piece.hasMoved && single && double) {
    legal.push([x, y - 2]);
  }
  if (canEatLeft) {
    legal.push([x - 1, y - 1]);
  }
  if (canEatRight) {
    legal.push([x + 1, y - 1]);
  }
}

function getBlackPawnMoves(piece, legal) {
  var x = piece.prevXPos;
  var y = piece.prevYPos;
  var single = true;
  var double = true;
  var canEatLeft = false;
  var canEatRight = false;
  for (pc of pieces) {
    if (pc.xPos == x && pc.yPos == (y + 1)) {
      single = false;
    }
    if (pc.xPos == x && pc.yPos == (y + 2)) {
      double = false;
    }
    if (pc.xPos == x - 1 && pc.yPos == (y + 1) && pc.col == "w") {
      canEatLeft = true;
    }
    if (pc.xPos == x + 1 && pc.yPos == (y + 1) && pc.col == "w") {
      canEatRight = true;
    }
    if (piece.yPos == 5 && piece.yPos == pc.yPos) {
      if ((pc.xPos == piece.xPos - 1 || pc.xPos == piece.xPos + 1) && pc.empassant == true) {
        legal.push([pc.xPos, y + 1]);
      }
    }
  }
  //Dump legal moves
  if (single) {
    legal.push([x, y + 1]);
  }
  if (!piece.hasMoved && single && double) {
    legal.push([x, y + 2]);
  }
  if (canEatLeft) {
    legal.push([x - 1, y + 1]);
  }
  if (canEatRight) {
    legal.push([x + 1, y + 1]);
  }
}

function getRookMoves(piece, legal) {
  var rightSpaces = 8;
  var leftSpaces = 8;
  var upSpaces = 8;
  var downSpaces = 8;
  //Right legal moves
  for (pc of pieces) {
    for (var i = 1; i <= 8 - piece.xPos; i++) {
      if (pc.xPos == piece.xPos + i && pc.yPos == piece.yPos) {
        if (pc.col == piece.col) {
          if (i < rightSpaces) {
            rightSpaces = i;
            break;
          }
        } else {
          if (i + 1 < rightSpaces) {
            rightSpaces = i + 1;
            break;
          }
        }
      }
    }
  }
  //Left legal moves
  for (pc of pieces) {
    for (var i = 1; i <= 1 + piece.xPos; i++) {
      if (pc.xPos == piece.xPos - i && pc.yPos == piece.yPos) {
        if (pc.col == piece.col) {
          if (i < leftSpaces) {
            leftSpaces = i;
            break;
          }
        } else {
          if (i + 1 < leftSpaces) {
            leftSpaces = i + 1;
            break;
          }
        }
      }
    }
  }
  //Up legal moves
  for (pc of pieces) {
    for (var i = 1; i <= 8 - piece.yPos; i++) {
      if (pc.xPos == piece.xPos && pc.yPos == piece.yPos + i) {
        if (pc.col == piece.col) {
          if (i < upSpaces) {
            upSpaces = i;
            break;
          }
        } else {
          if (i + 1 < upSpaces) {
            upSpaces = i + 1;
            break;
          }
        }
      }
    }
  }
  //Down legal moves
  for (pc of pieces) {
    for (var i = 1; i <= piece.yPos; i++) {
      if (pc.xPos == piece.xPos && pc.yPos == piece.yPos - i) {
        if (pc.col == piece.col) {
          if (i < downSpaces) {
            downSpaces = i;
            break;
          }
        } else {
          if (i + 1 < downSpaces) {
            downSpaces = i + 1;
            break;
          }
        }
      }
    }
  }
  //Dump legal moves
  for (let i = 1; i < leftSpaces; i++) {
    legal.push([piece.xPos - i, piece.yPos]);
  }
  for (let i = 1; i < rightSpaces; i++) {
    legal.push([piece.xPos + i, piece.yPos]);
  }
  for (let i = 1; i < upSpaces; i++) {
    legal.push([piece.xPos, piece.yPos + i]);
  }
  for (let i = 1; i < downSpaces; i++) {
    legal.push([piece.xPos, piece.yPos - i]);
  }
}

function getBishopMoves(piece, legal) {
  var upRight = 8;
  var downRight = 8;
  var downLeft = 8;
  var upLeft = 8;
  //Up right legal moves
  for (pc of pieces) {
    for (let i = 1; piece.xPos + i <= 8; i++) {
      if (pc.xPos == piece.xPos + i && pc.yPos == piece.yPos - i) {
        if (i < upRight) {
          if (pc.col == piece.col) {
            upRight = i - 1;
          } else {
            upRight = i;
          }
        }
      }
    }
  }
  //Down right legal moves
  for (pc of pieces) {
    for (let i = 1; piece.xPos + i <= 8; i++) {
      if (pc.xPos == piece.xPos + i && pc.yPos == piece.yPos + i) {
        if (i < downRight) {
          if (pc.col == piece.col) {
            downRight = i;
          } else {
            downRight = i + 1;
          }
        }
      }
    }
  }
  //Down left legal moves
  for (pc of pieces) {
    for (let i = 1; piece.xPos - i >= 1; i++) {
      if (pc.xPos == piece.xPos - i && pc.yPos == piece.yPos + i) {
        if (i < downLeft) {
          if (pc.col == piece.col) {
            downLeft = i;
          } else {
            downLeft = i + 1;
          }
        }
      }
    }
  }
  //Up left legal moves
  for (pc of pieces) {
    for (let i = 1; piece.xPos - i >= 1; i++) {
      if (pc.xPos == piece.xPos - i && pc.yPos == piece.yPos - i) {
        if (i < upLeft) {
          if (pc.col == piece.col) {
            upLeft = i;
          } else {
            upLeft = i + 1;
          }
        }
      }
    }
  }
  //Dump legal moves
  for (let i = 1; i <= upRight; i++) {
    legal.push([piece.xPos + i, piece.yPos - i]);
  }
  for (let i = 1; i < downRight; i++) {
    legal.push([piece.xPos + i, piece.yPos + i]);
  }
  for (let i = 1; i < downLeft; i++) {
    legal.push([piece.xPos - i, piece.yPos + i]);
  }
  for (let i = 1; i < upLeft; i++) {
    legal.push([piece.xPos - i, piece.yPos - i]);
  }
}

function getQueenMoves(piece, legal) {
  //This simply uses the bishop and rooks logic since
  //the queen's legal moves are the sum of both
  getBishopMoves(piece, legal);
  getRookMoves(piece, legal);
}

function getKnightMoves(piece, legal) {
  var upLeft = true;
  var upRight = true;
  var leftUp = true;
  var leftDown = true;
  var downLeft = true;
  var downRight = true;
  var rightDown = true;
  var rightUp = true;
  for (pc of pieces) {
    if (pc.yPos == piece.yPos - 2) {
      if (pc.xPos == piece.xPos - 1) {
        if (pc.col == piece.col) {
          upLeft = false;
        } else {
          continue;
        }
      } else if (pc.xPos == piece.xPos + 1) {
        if (pc.col == piece.col) {
          upRight = false;
        } else {
          continue;
        }
      }
    } else if (pc.xPos == piece.xPos - 2) {
      if (pc.yPos == piece.yPos - 1) {
        if (pc.col == piece.col) {
          leftUp = false;
        } else {
          continue;
        }
      } else if (pc.yPos == piece.yPos + 1) {
        if (pc.col == piece.col) {
          leftDown = false;
        } else {
          continue;
        }
      }
    } else if (pc.yPos == piece.yPos + 2) {
      if (pc.xPos == piece.xPos - 1) {
        if (pc.col == piece.col) {
          downLeft = false;
        } else {
          continue;
        }
      } else if (pc.xPos == piece.xPos + 1) {
        if (pc.col == piece.col) {
          downRight = false;
        } else {
          continue;
        }
      }
    } else if (pc.xPos == piece.xPos + 2) {
      if (pc.yPos == piece.yPos + 1) {
        if (pc.col == piece.col) {
          rightDown = false;
        } else {
          continue;
        }
      } else if (pc.yPos == piece.yPos - 1) {
        if (pc.col == piece.col) {
          rightUp = false;
        } else {
          continue;
        }
      }
    }
  }
  //Dump legal moves
  if (upRight) {
    legal.push([piece.xPos + 1, piece.yPos - 2]);
  }
  if (upLeft) {
    legal.push([piece.xPos - 1, piece.yPos - 2]);
  }
  if (leftUp) {
    legal.push([piece.xPos - 2, piece.yPos - 1]);
  }
  if (leftDown) {
    legal.push([piece.xPos - 2, piece.yPos + 1]);
  }
  if (downLeft) {
    legal.push([piece.xPos - 1, piece.yPos + 2]);
  }
  if (downRight) {
    legal.push([piece.xPos + 1, piece.yPos + 2]);
  }
  if (rightDown) {
    legal.push([piece.xPos + 2, piece.yPos + 1]);
  }
  if (rightUp) {
    legal.push([piece.xPos + 2, piece.yPos - 1]);
  }
}

function getKingMoves(piece, legal) {
  var found = false;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      for (pc of pieces) {
        found = false;
        if (pc.xPos == piece.xPos + i && pc.yPos == piece.yPos + j) {
          found = true;
          if (pc.col == piece.col) {
            break;
          } else {
            legal.push([piece.xPos + i, piece.yPos + j]);
          }
        }
      }
      if (!found) {
        legal.push([piece.xPos + i, piece.yPos + j]);
      }
    }
  }
  if (!piece.hasMoved) {
    checkForCastle(piece, legal);
  }
}

function checkForCastle(piece, legal) {
  var long = false;
  var short = false;
  var interposing = false;
  if (board.whiteToMove) {
    for (pc of pieces) {
      if (pc.type == "r" && pc.xPos == 1 && !pc.hasMoved) {
        long = true;
      }
      if (pc.type == "r" && pc.xPos == 8 && !pc.hasMoved && !interposing) {
        short = true;
      }
      if (pc.yPos == 8 && pc.xPos > 1 && pc.xPos <= 3) {
        long = false;
      }
      if (pc.yPos == 8 && pc.xPos > 5 && pc.xPos <= 7) {
        short = false;
        interposing = true;
      }
    }
    castleLegal(piece, long, short, legal);
  } else if (!board.whiteToMove) {
    for (pc of pieces) {
      if (pc.type == "R" && pc.xPos == 1 && !pc.hasMoved) {
        long = true;
      }
      if (pc.type == "R" && pc.xPos == 8 && !pc.hasMoved && !interposing) {
        short = true;
      }
      if (pc.yPos == 1 && pc.xPos > 1 && pc.xPos <= 3) {
        long = false;
      }
      if (pc.yPos == 1 && pc.xPos > 5 && pc.xPos <= 7) {
        short = false;
        interposing = true;
      }
    }
    castleLegal(piece, long, short, legal);
  }
}

function castleLegal(piece, long, short, legal) {
  if (long) {
    legal.push([piece.xPos - 2, piece.yPos]);
  }
  if (short) {
    legal.push([piece.xPos + 2, piece.yPos]);
  }
}

function checkCheck() {
  var kingPosition = [];
   if (board.whiteToMove) {
      for (let piece of pieces) {
        if (piece.type == "k") {
          kingPosition = [piece.xPos, piece.yPos];
          break;
        }
      }
     for (let piece of pieces) {
      if (piece.col == "b") {
        board.whiteToMove = false;
        getLegalMoves(piece, totalLegalMoves);
        board.whiteToMove = true;
      }
    }
   } else {
    for (let piece of pieces) {
      if (piece.type == "K") {
        kingPosition = [piece.xPos, piece.yPos];
        break;
      }
    }
    for (let piece of pieces) {
      if (piece.col == "w") {
        board.whiteToMove = true;
        getLegalMoves(piece, totalLegalMoves);
        board.whiteToMove = false;
      }
    }
  }
  var kp = JSON.stringify(kingPosition);
  var tlm = JSON.stringify(totalLegalMoves);
  if (tlm.includes(kp)) {
    totalLegalMoves = [];
    return true;
  }
  totalLegalMoves = [];
  return false;
}

function putsYouInCheck(piece, move) {
  var x = move[0];
  var y = move[1];
  var oldX = piece.xPos;
  var oldY = piece.yPos;
  var pieceIndex = -1;
  var pX = 0;
  var pY = 0;
  for (pc of pieces) {
    if (pc.prevXPos == x && pc.prevYPos == y) {
      pieceIndex = pieces.indexOf(pc);
      pX = pc.prevXPos;
      pY = pc.prevYPos;
      pc.xPos = 50;
      pc.yPos = 50;
    }
  }
  piece.xPos = x;
  piece.yPos = y;
  if (checkCheck()) {
    if (pieceIndex != -1) {
      pieces[pieceIndex].xPos = pX;
      pieces[pieceIndex].yPos = pY;
    }
    piece.xPos = oldX;
    piece.yPos = oldY;
    return true;
  }
  if (pieceIndex != -1) {
    pieces[pieceIndex].xPos = pX;
    pieces[pieceIndex].yPos = pY;
  }
  piece.xPos = oldX;
  piece.yPos = oldY;
  return false;
}

//in piece logic I can probably improve the alg simply by
//breaking out of for loops when I already have an answer


/*missing stuff: 
  --------------------kinda important--------------------
  mate
  stalemate (up to here is probably required)

  mate and stalemate can probably be done easily once check works
  as if col turn and no legal moves, if king.inCheck then mate
  if !king.inCheck then stalemate
  ---------------------maybe-----------------------------
  maybe drawing rules (3 moves repetition most likely, probably
  not the 50 moves rule)
  a way to tell who won
  make it pretty
  maybe a bad engine to play against that uses minimax
  if I end up doing the minimax stuff, I'll have to
  also research some better implementations of minimax
  at the very least with alpha-beta pruning and maybe
  adding a transposition table
  might also try to implement some heuristic improvements
  such as trying captures and checks first
  also I could try and add some sort of iterative deepening
  in the algorithm..
  or I can do none of those and finish this project before my
  grandchildren die of old age, especially considering that
  the algorithm would still be aboslute trash because for
  all of that to be usefull in any way I would need a good
  heuristic to evaluate a position, which I dont have, but that
  I could create, again, spending half of my life on it.

  I was also thinking about adding a board editor and a FEN
  interpreter to the whole project, these might come later.*/