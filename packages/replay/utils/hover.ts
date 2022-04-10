import { mirror } from '@mood/snapshot';

export function hover($el: Element, $doc?: Document) {
  $doc?.querySelectorAll('.\\:hover').forEach($hovered => {
    $hovered.classList.remove(':hover');
  });
  let $current: Element | null = $el;
  while ($current) {
    if ($current.classList) {
      $current.classList.add(':hover');
    }
    $current = $current.parentElement;
  }
}

export function moveAndHover(
  x: number,
  y: number,
  id: number,
  $cursor: HTMLElement,
  $doc?: Document
) {
  $cursor.style.left = `${x}px`;
  $cursor.style.top = `${y}px`;

  const $target = mirror.getNode<Element>(id);

  if ($target) {
    hover($target, $doc);
  }
}
