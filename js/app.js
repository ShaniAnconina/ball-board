'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/glue.png">'

// Model:
var gBoard
var gGamerPos
var gBallInterval
var gGlueInterval
var gCountBalls
var gCountBallsCollected
var gIsFrozen

function onInitGame() {
    gCountBallsCollected = 0
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gBallInterval = setInterval(randomBalls, 3000)
    gGlueInterval = setInterval(randomGlue, 7000)
    renderScore('.collected', 0)

}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === 9 || j === 0 || j === 11) {
                board[i][j].type = WALL
            }
        }
    }

    board[0][6].type = FLOOR
    board[9][6].type = FLOOR
    board[5][0].type = FLOOR
    board[5][11].type = FLOOR


    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL
    gCountBalls = 2

    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    if (gIsFrozen) return


    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)


    if (j === gBoard[0].length) j = 0
    else if (j === -1) j = gBoard[0].length - 1
    else if (i === gBoard.length) i = 0
    else if (i === -1) i = gBoard.length - 1


    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return
    if (targetCell.gameElement === GLUE) {
        console.log('moveTo',i, j)

        console.log('oops...')
        gIsFrozen = true
        gBoard[i][j].gameElement = GAMER
        console.log(gBoard[i][j].gameElement)
        renderCell({ i, j }, GAMER)
        setTimeout(() => {
            gIsFrozen = false
        }, 3000)
    }

    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

        if (targetCell.gameElement === BALL) {
            ballSound()
            console.log('Collecting!')
            gCountBallsCollected++
            renderScore('.collected', gCountBallsCollected)
        }

    
        // DONE: Move the gamer
        // REMOVING FROM
        // update Model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')
        gameOver()

        // ADD TO
        // update Model
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        // update DOM
        renderCell(gGamerPos, GAMER_IMG)
    }
    countBallsAround()

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j
    // console.log('event.key:', event.key)

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

// Every few seconds a new ball is added in a random empty cell
function randomBalls() {
    var emptyCells = getEmptyCells()
    var randomBallIdx = getRandomInt(0, emptyCells.length)
    var randomBall = emptyCells[randomBallIdx]
    // MODEL
    gBoard[randomBall.i][randomBall.j].gameElement = BALL
    // DOM
    renderCell(randomBall, BALL_IMG)
    gCountBalls++
    countBallsAround()
}

function randomGlue() {
    var emptyCells = getEmptyCells()
    var randomGlueIdx = getRandomInt(0, emptyCells.length)
    var randomGlueCell = emptyCells[randomGlueIdx]
    // MODEL
    gBoard[randomGlueCell.i][randomGlueCell.j].gameElement = GLUE
    // DOM

    renderCell(randomGlueCell, GLUE_IMG)
    const clearGlueAfter3Sec = setTimeout(function () { clearGlue(randomGlueCell.i, randomGlueCell.j) }, 3000)
    console.log(gBoard[randomGlueCell.i][randomGlueCell.j].gameElement)
    if (gBoard[randomGlueCell.i][randomGlueCell.j].gameElement === GAMER) {
        console.log('heollo if')
        clearTimeout(clearGlueAfter3Sec)
        return
    }
}

function getEmptyCells() {
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].gameElement && gBoard[i][j].type === FLOOR) {
                emptyCells.push({ i: i, j: j })
            }
        }
    }
    return emptyCells
}

function gameOver() {
    if (gCountBalls === gCountBallsCollected) {
        clearInterval(gBallInterval)
        clearInterval(gGlueInterval)
        document.querySelector('.restart').style.display = 'inline-block'
    }
}

function ballSound() {
    var audio = new Audio('sound/mixkit-game-ball-tap-2073.wav')
    audio.play()
}

function countBallsAround() {
    var elSpan = document.querySelector('.balls-around span')
    elSpan.innerText = countNegs(gGamerPos.i, gGamerPos.j, gBoard)
}

function clearGlue(i, j) {
    gBoard[i][j].gameElement = null
    renderCell({ i: i, j: j }, '')
}

function renderScore(selector, score){
    const element = document.querySelector(selector)
    element.innerText =`${score} balls were collected`
}