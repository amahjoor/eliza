import React from 'react'
import AuthForm from '../../components/AuthForm'

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Create Your Account</h1>
        <p className="text-neutral-400">Join Eliza.ai to start recording and organizing your meetings</p>
      </div>
      
      <AuthForm mode="register" />
    </div>
  )
}
