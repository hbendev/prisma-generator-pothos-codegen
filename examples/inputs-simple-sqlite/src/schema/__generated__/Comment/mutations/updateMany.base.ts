import * as Inputs from '@/schema/__generated__/inputs'
import { BatchPayload } from '../../objects';
import { db } from '@/db';
import { defineMutation, defineMutationFunction, defineMutationObject } from '../../utils';

export const updateManyCommentMutationObject = defineMutationFunction((t) =>
  defineMutationObject({
    type: BatchPayload,
    nullable: false,
    args: {
      where: t.arg({ type: Inputs.CommentWhereInput, required: false }),
      data: t.arg({ type: Inputs.CommentUpdateManyMutationInput, required: true }),
    },
    resolve: async (_root, args, _context, _info) =>
      await db.comment.updateMany({ where: args.where || undefined, data: args.data }),
  }),
);

export const updateManyCommentMutation = defineMutation((t) => ({
  updateManyComment: t.field(updateManyCommentMutationObject(t)),
}));
