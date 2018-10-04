# Hnefatafl Online

A browser version of Hnefatafl. Play in private or public games against other players in realtime. It uses [NodeJS](https://nodejs.org/), [Express](https://expressjs.com/) and [socket.io](https://socket.io/)

Try it out: https://floseite.de/hnefatafl

## Rules

- Any piece can move any amount of spaces in straight lines, not diagonally
- No piece can pass over another piece
- A piece is captured and removed if it's surrounded by enemies on two opposite sides (horizontally or vertically - not diagonally)
- The edges are considered as an enemy
- The king can only be captured by beeing completly surrounded by enemies. If so, black wins
- Only the king can step on the middle, yet the others can pass it
- Only the king can step on the edges and by doing so white wins

Moving around, Capturing and Winning:

![img](https://i.imgur.com/ooYAZS3.gif) ![img](https://i.imgur.com/BDfgaiw.gif) ![img](https://i.imgur.com/T8zbToN.gif)

## Installing and Running

Install the dependencies:
`npm install`

Start the local server:
`npm start`

The game runs on port *5000* so just open http://localhost:5000