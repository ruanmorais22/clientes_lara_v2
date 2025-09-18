import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onShowSignUp: () => void;
}

export function LoginForm({ onShowSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Left side - Login Form */}
      <div className="w-1/2 p-8">
        <div className="flex justify-center mb-6">
          <img 
            src="https://io.minhalara.com.br/evolution/LOGO_FINAL.webp"
            alt="Evolution Logo"
            className="h-16 object-contain"
          />
        </div>
        
        <p className="text-center text-gray-700 dark:text-gray-300 mb-8">
          Estamos transformando vidas com IA, Nossa equipe é top 🚀🚀.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </form>
        
        <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
          Fala comigo! Não tem conta vacilão? clica aqui 👉👉{' '}
          <button
            onClick={onShowSignUp}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>

      {/* Right side - Image */}
      <div className="w-1/2 relative">
        <img
          src="https://io.minhalara.com.br/evolution/topo.png"
          alt="Evolution"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
