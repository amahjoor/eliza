import React from 'react'
import AuthForm from '../../components/AuthForm'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
        <p className="text-neutral-400">Sign in to access your meetings and notes</p>
      </div>
      
      <AuthForm mode="login" />
    </div>
  )
}
