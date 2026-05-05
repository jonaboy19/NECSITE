'use client'
import Link from 'next/link'
export default function MobileNav(){
 return(
  <nav className='fixed bottom-0 left-0 right-0 bg-black border-t border-slate-800 flex justify-around p-3 text-sm'>
   <Link href='/dashboard'>Home</Link>
   <Link href='/tournaments'>Tournaments</Link>
   <Link href='/clans'>Clans</Link>
   <Link href='/rankings'>Rankings</Link>
  </nav>
 )
}