import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';



/*Basic Square, Has 5 Possible Values 
  - T
  - K
  - G
  - A
  */
function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  /*
  Render a square based on its state value
  */
  renderSquare(x, y) {
    var square = null;

    /*Display T for Throne on the central square if the King is not occupying the square*/
    if (x === 9 / 2 && y === 9 / 2 && this.props.squares[y][x] !== 'K') {
      square =
        <Square
          key={x.toString() + y.toString()}
          value="T"
          onClick={() => this.props.onClick(x, y)}
        />
    }
    else {
      square =
        <Square
          key={x.toString() + y.toString()}
          value={this.props.squares[y][x]}
          onClick={() => this.props.onClick(x, y)}
        />
    }
    return square;
  }

  /*Render Row Y
  TODO: Make board size flexible */
  renderRow(y) {

    let row = []
    for (let x = 0; x < 9; x++) {
      row.push(this.renderSquare(x, y))
    }

    return row;
  }

  /*Render Entire Board */
  render() {

    let board = []

    for (let j = 0; j < 9; j++) {
      board.push(<div className="board-row" key={j}>{this.renderRow(j)}</div>)
    }

    return <div className="board">{board}</div>;
  }
}

/*Standard Setup for a 9x9 board */
function setupBoard() {
  var start_board = [
    ['', '', '', 'A', 'A', 'A', '', '', ''],
    ['', '', '', '', 'A', '', '', '', ''],
    ['', '', '', '', 'G', '', '', '', ''],
    ['A', '', '', '', 'G', '', '', '', 'A'],
    ['A', 'A', 'G', 'G', 'K', 'G', 'G', 'A', 'A'],
    ['A', '', '', '', 'G', '', '', '', 'A'],
    ['', '', '', '', 'G', '', '', '', ''],
    ['', '', '', '', 'A', '', '', '', ''],
    ['', '', '', 'A', 'A', 'A', '', '', '']
  ]
  return start_board
}



class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      history: [
        {
          squares: setupBoard()
        }
      ],
      stepNumber: 0,
      offenceIsNext: true,
      cursor: null,
    };

  }

  // scanForObstacles(origin, final, board) {

  //   const dist_y = final[0] - origin[0]
  //   const dist_x = final[1] - origin[1]

  //   //Scan Each Square between two points. Exclude the origin square from the calculation
  //   for (let dy = Math.abs(dist_y); dy >= 0; dy--) {
  //     for (let dx = Math.abs(dist_x); dx <= 0; dx--) {

  //       let new_y = origin[0] + dist_y + dy
  //       let new_x = origin[1] + dist_x + dx

  //       //If square is occupied and isn't occupied by the piece being moved
  //       if (origin[0] !== new_y || origin[1] !== new_x && board[new_y][new_x] !== ''){
  //         return true
  //       }
  //     }
  //   }
  //   return false
  // }

  isLineHorizontal(origin, final) {
    if (origin[1] === final[1]) {//Line is vertical
      return false
    }
    else if (origin[0] === final[0]) {//Line is horizontal
      return true
    }
    else {
      throw new Error("Line isn't straight")
    }
  }

  scanForObstacles(origin, final, board) {
    if (this.isLineHorizontal(origin, final)) {
      for (let target = origin[1]; target !== final[1]; target += Math.sign(final[1] - origin[1])) {
        if (target !== origin[1] && board[origin[0]][target] !== '') {
          return true
        }
      }
    }
    else {
      for (let target = origin[0]; target !== final[0]; target += Math.sign(final[0] - origin[0])) {
        if (board[target][origin[1]] !== '') {
          return true
        }
      }
    }
    return false

  }

  isLegalMove(origin, final, board) {
    if (origin[0] === final[0] || origin[1] === final[1] && origin !== final) { //Is move in straight line
      if (!this.scanForObstacles(origin, final, board)) {    //Is there something between pooints
        return true
      }
    }
    return false
  }

  isYourTurn(selectedPiece) {
    if ((this.state.offenceIsNext && selectedPiece == "A") ||
      (!this.state.offenceIsNext && selectedPiece == 'G' || !this.state.offenceIsNext && selectedPiece == 'K')) {
      return true
    }
    return false
  }

  handleClick(x, y) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1]; /* Link to current board state */
    const squares = current.squares.slice(); /*Copy of current board State */

    /*
    Process Click 
      - Replace cursor if its a new cursor
      - move piece if valid move selected
    */

    var newCursor = [y, x]

    console.log("Current     [Y:X] [" + y + "," + x + "] Value-> " + squares[y][x])


    if (this.state.cursor) {

      console.log("Last Cursor [Y:X] [" + this.state.cursor[0] + "," + this.state.cursor[1] + "] Value-> " + squares[this.state.cursor[0]][this.state.cursor[1]])

      if (this.isYourTurn(squares[this.state.cursor[0]][this.state.cursor[1]])) {
        //Swap piece location
        squares[y][x] = squares[this.state.cursor[0]][this.state.cursor[1]]
        squares[this.state.cursor[0]][this.state.cursor[1]] = ''
      }

    }

    //Set the state from the last moe
    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      offenceIsNext: !this.state.offenceIsNext,
      cursor: newCursor,

    });

  }

  // Set Game state to a specific move
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      offenceIsNext: (step % 2) === 0
    });
  }

  //Get cursor value at a certain square index
  cursorValue(x, y) {
    //List of game states.
    const history = this.state.history;
    //Current game state
    const current = history[this.state.stepNumber];

    return current.squares[y][x];
  }

  render() {
    //List of game states.
    const history = this.state.history;
    //Current game state
    const current = history[this.state.stepNumber];

    const cursor = this.state.cursor !== null ? this.state.cursor : [0, 0];


    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(x, y) => this.handleClick(x, y)}
          />
        </div>
        <div className="cursor">
          <Square
            key='cursor'
            value={this.cursorValue(cursor[0], cursor[1])}>
          </Square>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  return null;
}

