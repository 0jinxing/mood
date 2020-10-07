import { on } from '../utils';
import { mirror } from '@mood/snapshot';

import { MouseInteractions } from '../constant';

export type MouseInteractionParam = {
  type: MouseInteractions;
  id: number;
  x: number;
  y: number;
};

export type MouseInteractionCallBack = (param: MouseInteractionParam) => void;

function initMouseInteractionObserver(cb: MouseInteractionCallBack) {
  const handlers: VoidFunction[] = [];

  const getHandler = (eventKey: keyof typeof MouseInteractions) => {
    return (event: MouseEvent | TouchEvent) => {
      const id = mirror.getId(event.target as Node);
      const { clientX, clientY } =
        event instanceof TouchEvent ? event.changedTouches[0] : event;
      cb({ type: MouseInteractions[eventKey], id, x: clientX, y: clientY });
    };
  };

  Object.keys(MouseInteractions).forEach(
    (eventKey: keyof typeof MouseInteractions) => {
      const eventName = eventKey;
      const handler = getHandler(eventKey);
      handlers.push(on(eventName, handler));
    }
  );
  return () => {
    handlers.forEach(h => h());
  };
}

export default initMouseInteractionObserver;
