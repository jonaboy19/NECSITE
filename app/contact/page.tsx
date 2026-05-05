'use client'
import { useState } from 'react'
import PageLayout from '@/components/PageLayout'
import { Mail, MessageSquare } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert('Thank you for your message! We will get back to you soon.')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-black">Contact Us</h1>
          <p className="text-lg text-slate-300">
            Have questions about tournaments, sponsorships, or partnerships? Get in touch with the KAF team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="kaf-card p-6 rounded-2xl">
              <Mail size={32} className="text-cyan-200 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-slate-400 mb-4">For general inquiries and support</p>
              <a href="mailto:contact@kafesports.nl" className="text-cyan-200 hover:text-cyan-100 transition">
                contact@kafesports.nl
              </a>
            </div>

            <div className="kaf-card p-6 rounded-2xl">
              <MessageSquare size={32} className="text-cyan-200 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Discord</h3>
              <p className="text-slate-400 mb-4">Join our community for faster responses</p>
              <a href="/community" className="text-cyan-200 hover:text-cyan-100 transition">
                Join Discord
              </a>
            </div>
          </div>

          <div className="kaf-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-bold text-slate-950 hover:bg-cyan-300 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}