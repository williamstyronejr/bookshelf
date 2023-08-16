import { useMutation } from '@tanstack/react-query';

export default function useDeleteAuthor(options = {}) {
  return useMutation(
    ['delete-author'],
    async ({ id }: { id: string }) => {
      const res = await fetch(`/api/author/${id}/delete`, {
        method: 'POST',
      });

      if (res.ok) return res.json();

      throw new Error('An unexpected error occurred, please try again.');
    },
    options
  );
}
