import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  clickable?: boolean
}

export function Card({ children, className = '', hover = true, clickable = false }: CardProps) {
  const baseClass = 'depth-panel rounded-xl p-6'
  const interactiveClass = hover ? 'depth-hover hover:border-brand-cyan/35' : ''
  const cursorClass = clickable ? 'cursor-pointer' : ''

  return (
    <div className={cn(baseClass, interactiveClass, cursorClass, className)}>
      {children}
    </div>
  )
}

interface CardHeadingProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function CardHeading({ title, subtitle, action }: CardHeadingProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-black text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`space-y-3 ${className}`}>{children}</div>
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={cn('mt-4 border-t border-kaf-border pt-4', className)}>
      {children}
    </div>
  )
}

interface SectionCardProps {
  title: string
  viewAllHref?: string
  children: React.ReactNode
  className?: string
}

export function SectionCard({ title, viewAllHref, children, className = '' }: SectionCardProps) {
  return (
    <section className={cn('py-12 sm:py-16', className)}>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="kaf-section-title text-xl sm:text-2xl">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-xs font-black uppercase tracking-wider text-brand-cyan transition hover:text-brand-lime">
            View All
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
