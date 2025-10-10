import { Suspense } from 'react';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-64">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}