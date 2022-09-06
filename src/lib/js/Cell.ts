export interface Coord {
  i: number
  j: number
}

export interface ICell {
  position: Coord
  revealed: boolean
  mine?: boolean
  flagged?: boolean
  adjacentMines: number
}