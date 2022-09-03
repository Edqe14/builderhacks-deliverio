import { ReactElement } from 'react';

interface Props {
  children: ReactElement;
}

export default function Layout({ children }: Props) {
  return (
    <main className="sm:aspect-[9/16] h-screen mx-auto border border-red-500">
      {children}
    </main>
  );
}