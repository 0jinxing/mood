import { AddedNodeMutation, SubscribeToMutationArg } from '@mood/record';
import { buildNodeWithSN, isElement, mirror } from '@mood/snapshot';
import { each } from '@mood/utils';
import { ReceiveHandler } from '../types';

export const receiveToMutation: ReceiveHandler<SubscribeToMutationArg> = (event, context) => {
  each(event.removes, rm => {
    const $el = mirror.getNode(rm.id);

    if (!$el) return;

    const $parent = $el.parentNode;
    const $next = $el.nextSibling;

    mirror.remove($el);
    $parent?.removeChild($el);

    if (isElement($next) && $next.getAttribute(mirror.DERIVE_KEY) === String(rm.id)) {
      mirror.remove($next);
      $parent?.removeChild($next);
    }
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

  each(event.adds, append);

  each(event.texts, text => {
    const $target = mirror.getNode(text.id);

    if (!$target) return;

    $target.textContent = text.value;
  });

  each(event.attrs, mutation => {
    const $target = mirror.getNode<Element>(mutation.id);

    if (!$target) return;

    each(Object.entries(mutation.record), ([name, value]) => {
      if (value) $target.setAttribute(name, value + '');
      else $target.removeAttribute(name);
    });
  });
};
