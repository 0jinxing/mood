import { on } from '@mood/utils';

/**
 * Drag-and-Drop Event Flow:
 *
 * 1. Drag Start: Fired on the source node when dragging begins ('dragstart').
 * 2. Dragging: Continuously fired on the source node during the drag operation ('drag').
 * 3. Enter Target: Fired when entering a target element ('dragenter').
 * 4. Leave Target: Fired when leaving a target element ('dragleave').
 * 5. Drag Over: Continuously fired within the target element during dragging ('dragover').
 * 6. Drop: Fired when dropping onto the target element ('drop').
 * 7. Drag End: Fired on the source node when the drag operation ends ('dragend').
 */

let currentDataTransfer: DataTransfer | null = null;

export const autoWithDataTransfer = (doc = document) => {
  const unsubscribes = [
    on(doc, 'dragstart', ev => (currentDataTransfer = ev.dataTransfer)),
    on(doc, 'dragend', () => {
      currentDataTransfer = null;
      dispose();
    }),
    on(doc, 'focus', () => dispose())
  ];

  function dispose() {
    unsubscribes.forEach(fn => fn());
    currentDataTransfer = null;
  }
};

export function getCurrentDataTransfer() {
  return currentDataTransfer;
}
