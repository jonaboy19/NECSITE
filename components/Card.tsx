import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  clickable?: boolean
}

export function Card({ children, className = '', hover = true, clickable = false }: CardProps) {
  const baseClass = 'kaf-card rounded-2xl p-6'
  const interactiveClass = hover ? 'hover:border-cyan-300/40 transition' : ''
  const cursorClass = clickable ? 'cursor-pointer' : ''

  return (
    <div className={`${baseClass} ${interactiveClass} ${cursorClass} ${className}`}>
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
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400 uppercase tracking-wide">{subtitle}</p>}
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
    <div className={`mt-4 pt-4 border-t border-slate-700 ${className}`}>
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
    <section className={`py-16 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black">{title}</h2>
        {viewAllHref && (
          <a href={viewAllHref} className="text-cyan-200 hover:text-cyan-100 transition">
            View All
          </a>
        )}
      </div>
      {children}
    </section>
  )
}