import React, { useState } from 'react'

const Contact = () => {
	const [form, setForm] = useState({ name: '', email: '', message: '' })
	const [submitting, setSubmitting] = useState(false)
	const [submitted, setSubmitted] = useState(false)

	const handleChange = (e) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!form.name || !form.email || !form.message) return
		setSubmitting(true)
		try {
			// Placeholder for backend integration
			await new Promise(r => setTimeout(r, 800))
			setSubmitted(true)
			setForm({ name: '', email: '', message: '' })
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className='bg-white'>
			{/* Hero */}
			<section className='bg-red-600 text-white'>
				<div className='max-w-6xl mx-auto px-4 py-14 md:py-20'>
					<h1 className='text-3xl md:text-5xl font-extrabold'>Contact Us</h1>
					<p className='mt-3 text-white/90 max-w-2xl'>We would love to hear from you. Reach out with any questions about InfoBeans Foundation LMS.</p>
				</div>
			</section>

			{/* Content */}
			<section className='max-w-6xl mx-auto px-4 py-12 md:py-16'>
				<div className='grid md:grid-cols-2 gap-8'>
					{/* Form */}
					<div className='border rounded-2xl p-6 md:p-8 shadow-sm'>
						<h2 className='text-2xl font-bold text-gray-900'>Send us a message</h2>
						{submitted && (
							<div className='mt-4 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded'>
								Thanks! Your message has been sent.
							</div>
						)}
						<form onSubmit={handleSubmit} className='mt-6 space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
								<input
									type='text'
									name='name'
									value={form.name}
									onChange={handleChange}
									placeholder='Your name'
									className='w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
									required
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
								<input
									type='email'
									name='email'
									value={form.email}
									onChange={handleChange}
									placeholder='you@example.com'
									className='w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
									required
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>Message</label>
								<textarea
									name='message'
									rows='5'
									value={form.message}
									onChange={handleChange}
									placeholder='How can we help?'
									className='w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
									required
								/>
							</div>
							<button
								type='submit'
								disabled={submitting}
								className='bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold px-5 py-2 rounded-lg'
							>
								{submitting ? 'Sending...' : 'Send Message'}
							</button>
						</form>
					</div>

					{/* Contact details */}
					<div className='space-y-6'>
						<div className='bg-red-50 border border-red-100 rounded-2xl p-6'>
							<h3 className='text-lg font-bold text-red-700'>Address</h3>
							<p className='mt-1 text-gray-700'>170, Madhavastika, South Raj Mohalla, Jawahar Marg, Indore. </p>
						</div>
						<div className='bg-red-50 border border-red-100 rounded-2xl p-6'>
							<h3 className='text-lg font-bold text-red-700'>Phone</h3>
							<p className='mt-1 text-gray-700'>+91 1111111111</p>
						</div>
						<div className='bg-red-50 border border-red-100 rounded-2xl p-6'>
							<h3 className='text-lg font-bold text-red-700'>Email</h3>
							<p className='mt-1 text-gray-700'>foundation@infobeans.com</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Contact


