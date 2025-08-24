'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'
import { useUser } from '@supabase/auth-helpers-react'

export const dynamic = 'force-dynamic'

export default function SetupPage() {
  const [role, setRole] = useState<'student' | 'parent'>('student')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    graduation_year: new Date().getFullYear() + 1,
    gpa: '',
    sat_score: '',
    act_score: '',
    high_school: '',
    intended_majors: [] as string[],
  })

  const supabase = createClientSupabase()
  const user = useUser()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: formData.full_name,
          phone: formData.phone || null,
        })

      if (profileError) throw profileError

      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: role,
        })

      if (roleError) throw roleError

      // If student, create student profile
      if (role === 'student') {
        const { error: studentError } = await supabase
          .from('students')
          .upsert({
            user_id: user.id,
            graduation_year: formData.graduation_year,
            gpa: formData.gpa ? parseFloat(formData.gpa) : null,
            sat_score: formData.sat_score ? parseInt(formData.sat_score) : null,
            act_score: formData.act_score ? parseInt(formData.act_score) : null,
            high_school: formData.high_school || null,
            intended_majors: formData.intended_majors,
          })

        if (studentError) throw studentError
      }

      // Redirect to appropriate dashboard based on role
      if (role === 'student') {
        router.push('/dashboard/student')
      } else {
        router.push('/dashboard/parent')
      }
    } catch (error) {
      console.error('Setup error:', error)
      alert('Error setting up profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addMajor = () => {
    const major = prompt('Enter intended major:')
    if (major && !formData.intended_majors.includes(major)) {
      setFormData(prev => ({
        ...prev,
        intended_majors: [...prev.intended_majors, major]
      }))
    }
  }

  const removeMajor = (major: string) => {
    setFormData(prev => ({
      ...prev,
      intended_majors: prev.intended_majors.filter(m => m !== major)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Complete Your Profile
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Tell us about yourself to get started
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Quit Setup
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="card">
            {/* Role Selection */}
            <div className="mb-6">
              <label className="label">I am a:</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="student"
                    checked={role === 'student'}
                    onChange={(e) => setRole(e.target.value as 'student')}
                    className="mr-2"
                  />
                  Student
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="parent"
                    checked={role === 'parent'}
                    onChange={(e) => setRole(e.target.value as 'parent')}
                    className="mr-2"
                  />
                  Parent
                </label>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              {/* Student-specific fields */}
              {role === 'student' && (
                <>
                  <div>
                    <label className="label">Graduation Year *</label>
                    <input
                      type="number"
                      required
                      min="2024"
                      max="2030"
                      className="input"
                      value={formData.graduation_year}
                      onChange={(e) => setFormData(prev => ({ ...prev, graduation_year: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div>
                    <label className="label">GPA (0.0 - 4.0)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      className="input"
                      value={formData.gpa}
                      onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">SAT Score</label>
                      <input
                        type="number"
                        min="400"
                        max="1600"
                        className="input"
                        value={formData.sat_score}
                        onChange={(e) => setFormData(prev => ({ ...prev, sat_score: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="label">ACT Score</label>
                      <input
                        type="number"
                        min="1"
                        max="36"
                        className="input"
                        value={formData.act_score}
                        onChange={(e) => setFormData(prev => ({ ...prev, act_score: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">High School</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.high_school}
                      onChange={(e) => setFormData(prev => ({ ...prev, high_school: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="label">Intended Majors</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.intended_majors.map((major) => (
                        <span
                          key={major}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {major}
                          <button
                            type="button"
                            onClick={() => removeMajor(major)}
                            className="ml-1 text-primary-600 hover:text-primary-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addMajor}
                      className="btn-secondary text-sm"
                    >
                      Add Major
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary mt-6"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
