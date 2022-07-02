import { AddedNodeMutation, SubscribeToMutationArg } from '@mood/record';
import { buildNodeWithSN, mirror } from '@mood/snapshot';
import { ReceiveHandler } from '../types';

export const receiveToMutation: ReceiveHandler<SubscribeToMutationArg> = (event, context) => {
  event.removes?.forEach(rm => {
    const $el = mirror.getNode(rm.id);

    if (!$el) return;

    const $parent = $el.parentNode;

    mirror.remove($el);
    $parent?.removeChild($el);
  });

  const $doc = context.$iframe.contentDocument!;

  const append = (add: AddedNodeMutation) => {
    const $parent = add.pId ? mirror.getNode(add.pId) : undefined;

    let $next = add.nId ? mirror.getNode(add.nId) : undefined;

    const $target = $doc ? buildNodeWithSN(add, $doc) : null;

    if (!$target) return;

    if ($next && $next.parentElement) {
      // making sure the parent contains the reference nodes
      // before we insert target before next.
      $parent?.contains($next)
        ? $parent?.insertBefore($target, $next)
        : $parent?.insertBefore($target, null);
    } else {
      $parent?.appendChild($target);
    }
  };

  event.adds?.forEach(append);

  event.texts?.forEach(text => {
    const $target = mirror.getNode(text.id);

    if (!$target) return;

    $target.textContent = text.value;
  });

  event.attrs?.forEach(mutation => {
    const $target = mirror.getNode<Element>(mutation.id);

    if (!$target) return;

    Object.entries(mutation.record).forEach(([name, value]) => {
      if (value === null) $target.removeAttribute(name);
      else $target.setAttribute(name, value + '');
    });
  });
};
