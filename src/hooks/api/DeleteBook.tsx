import { useMutation } from '@tanstack/react-query';

export default function useDeleteBook() {
  return useMutation(['delete-book'], async ({ id }: { id: string }) => {
    const res = await fetch(`/api/books/${id}/delete`, {
      method: 'POST',
    });

    if (res.ok) return res.json();

    throw new Error('An unexpected error occurred, please try again.');
  });
}
