<script lang="ts">
import type { ICell } from "./js/Cell";
export let cell: ICell
</script>

<button class="cell" class:hidden={!cell.revealed} class:mine={cell.mine && cell.revealed} class:flagged={cell.flagged} on:click|preventDefault on:contextmenu|preventDefault>
  {#if cell?.revealed}
    <span>
      {cell.adjacentMines ? cell.adjacentMines : ''}
    </span>
  {/if}
</button>

<style>
.cell {
  border: 1px solid #fff;
  border-radius: 0;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}
.cell.hidden {
  background-color: #444;
}
.cell.flagged::after {
  content: "⚑";
  font-size: 1.5em;
  color: #d66;
}
.cell.mine {
  background-color: #d66;
}
</style>