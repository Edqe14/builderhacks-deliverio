import { ReactElement } from 'react';
import Navbar from './Navbar/Navbar';

interface Props {
  children?: ReactElement;
}

export default function Layout({ children }: Props) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
