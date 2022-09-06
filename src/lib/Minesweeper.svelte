<script lang="ts">
import { onDestroy } from 'svelte';
import type { ICell } from './js/Cell';
import { Minesweeper, type State } from './js/minesweeper'
import Cell from './Cell.svelte';

const game = new Minesweeper(9, 9, 10)

$: state = game.board

$: {
  if (!state.some(cell => !cell.mine && !cell.revealed))
    game.onGameOver('won')
}

let status: State
const unsub = game.state.subscribe(v => {
  status = v
})

$: minesLeft = (): number => {
  if (!status.mineGenerated)
    return game.mines
  return state.reduce((a, b) => a - (b.flagged ? 1 : 0), game.mines)
}

const handleClick = (cell: ICell, index: number) => {
  if (status.status === 'ready') {
    game.state.update(v => {
      v.status = 'playing'
      game.generateMines(cell)
      v.mineGenerated = true
      return v
    })
  }
  if (cell.flagged)
    return
  state[index].revealed = true
  if (cell.mine) {
    game.onGameOver('lost')
    return
  }
  game.expandZero(cell)
}

const handleRightClick = (cell: ICell, index: number) => {
  if (cell.revealed)
    return
  state[index].flagged = !cell.flagged
}

onDestroy(() => { unsub() })
</script>

<div class="minesweeper" style:--width={game.width}>
  {#each state as cell, index}
    <Cell cell={cell}
      on:click={() => handleClick(cell, index)}
      on:contextmenu={() => handleRightClick(cell, index)}
    />
  {/each}
</div>
<p>{status.status}</p>
<p>{minesLeft()}</p>

<style>
.minesweeper {
  display: grid;
  grid-template-columns: repeat(var(--width), 48px);
  grid-auto-rows: 48px;
}
</style>