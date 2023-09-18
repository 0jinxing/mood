import { RecordEventWithTime } from '@mood/record';
import { EmbedBuffer, uuid } from '../utils';
import { Messager } from '../utils/messager/types';

export type CreateEmbedOption = {
  uid?: string;
  messager: Messager;
};

export const createEmbed = (option: CreateEmbedOption) => {
  const uid = option.uid || uuid();
  const buffer = new EmbedBuffer<RecordEventWithTime>({
    onTimeout(data) {
      option.messager.send(data);
    }
  });
};
