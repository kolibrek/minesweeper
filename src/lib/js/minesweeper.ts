import { get, writable } from 'svelte/store'
import type { Coord, ICell } from './Cell'

type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

export interface State {
  board: ICell[]
  mineGenerated: boolean
  status: GameStatus
  startTime?: number
  endTime?: number
}

export class Minesweeper {
  state = writable<State>()

  constructor(
    public width: number,
    public height: number,
    public mines: number
  ) {
    this.init()
  }

  get board(): ICell[] {
    return get(this.state).board
  }

  get total(): number {
    return this.height * this.width
  }

  init(
    width = this.width,
    height = this.height,
    mines = this.mines
    ) {
    this.width = width
    this.height = height
    this.mines = mines

    this.state.set({
      mineGenerated: false,
      status: 'ready',
      board: Array.from({length: this.total}, (_, index) => {
        const position = this.resolvePosition(index)
        return {
          position,
          adjacentMines: 0,
          revealed: false,
        }
      })
    })
  }

  generateMines(cell: ICell) {
    const placeRandom = (): boolean => {
      let success = false
      this.state.update(v => {
        const coord: Coord = {
          i: this.randomInt(0, this.width),
          j: this.randomInt(0, this.height)
        }
        if (v.board[this.at(coord)].mine || cell.position === coord) {
          success = false
        } else {
          v.board[this.at(coord)].mine = true
          success = true
        }
        return v
      })
      return success
    }
    Array.from({length: this.mines}, () => null).forEach(() => {
      let placed = false
      while (!placed) {
        placed = placeRandom()
      }
    })
    this.updateNumbers()
  }

  updateNumbers() {
    this.board.forEach((cell) => {
      if (cell.mine)
        return
      this.getNeighbors(cell).forEach(n => {
        if (n.mine)
          cell.adjacentMines += 1
      })
    })
  }

  expandZero(cell: ICell) {
    if (cell.adjacentMines)
      return
    this.getNeighbors(cell).forEach(n => {
      if (!n.revealed) {
        if (!n.flagged) {
          n.revealed = true
        }
        this.expandZero(n)
      }
    })
  }

  autoExpand(cell: ICell) {
    if (get(this.state).status !== 'playing' || cell.flagged)
      return
    const neighbors = this.getNeighbors(cell)
    const flags = neighbors.reduce((a,b) => a + (b.flagged ? 1 : 0), 0)
    const notRevealed = neighbors.reduce((a,b) => a + (!b.revealed && !b.flagged ? 1 : 0), 0)

    if (flags === cell.adjacentMines) {
      neighbors.forEach(n => {
        if (n.revealed || n.flagged)
          return
        n.revealed = true
        this.expandZero(n)
        if (n.mine)
          this.onGameOver('lost')
      })
    }
    const missingFlags = cell.adjacentMines - flags
    if (notRevealed === missingFlags) {
      neighbors.forEach(n => {
        if (!n.revealed && !n.flagged)
          n.flagged = true
      })
    }
  }

  showAllMines() {
    this.board.forEach(cell => {
      if (cell.mine)
        cell.revealed = true
    })
  }

  getNeighbors(cell: ICell): ICell[] {
    const p = cell.position
    const coords = [
      { i: p.i - 1, j: p.j }, // west
      { i: p.i + 1, j: p.j }, // east
      { i: p.i, j: p.j - 1 }, // north
      { i: p.i, j: p.j + 1 }, // south
      { i: p.i - 1, j: p.j - 1 }, // northwest
      { i: p.i + 1, j: p.j - 1 }, // northeast
      { i: p.i - 1, j: p.j + 1 }, // southwest
      { i: p.i + 1, j: p.j + 1 }, // southeast
    ].filter(c => (
      (c.i >= 0 && c.i < this.width) && (c.j >= 0 && c.j < this.height)
    ))
    return coords.map(c => this.board[this.at(c)])
  }

  onGameOver(status: GameStatus) {
    this.state.update(v => {
      v.status = status
      v.endTime = +Date.now()
      if (status === 'lost') {
        this.showAllMines()
        setTimeout(() => { alert('lost') }, 10)
      }
      return v
    })
  }

  resolvePosition(index: number): Coord {
    return { i: (index % this.width), j: Math.floor(index / this.height) }
  }

  at(coord: Coord): number {
    const index = coord.j * this.width + coord.i
    if (index >= 0 && index < this.total) {
      return index
    }
  }

  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min)
  }
}