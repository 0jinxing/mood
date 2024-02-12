import { AddedNodeMutation, MutationEmitArg } from '@mood/record';
import { buildNodeWithSN } from '@mood/snapshot';
import { each } from '@mood/utils';
import { EmitHandler } from '../types';

export const handleMutationEmit: EmitHandler<MutationEmitArg> = (event, { $iframe, mirror }) => {
  each(event.removes, rm => {
    const $el = mirror.getNode(rm.id);
    const $parent = mirror.getNode(rm.pId);

    if (!$el) return;

    if ($parent) $parent.removeChild($el);

    mirror.remove($el);
  });

  const $doc = $iframe.contentDocument!;

  const append = (add: AddedNodeMutation) => {
    const $parent = add.pId ? mirror.getNode(add.pId) : undefined;

    let $next = add.nId ? mirror.getNode(add.nId) : undefined;

    const $target = $doc ? buildNodeWithSN(add, $doc, mirror) : null;

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
    if (!$target) {
      return;
    }
    $target.textContent = text.value;
  });

  each(event.attrs, mutation => {
    const $target = mirror.getNode<Element>(mutation.id);
    if (!$target) return;

    each(Object.entries(mutation.attrs), ([name, value]) => {
      if (value) $target.setAttribute(name, value + '');
      else $target.removeAttribute(name);
    });
  });
};
