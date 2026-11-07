import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Input, Card, Badge } from '../components/ui';

export const SignupPage: React.FC = () => {
  const { setCurrentUser } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campus, setCampus] = useState('LPU Main Campus, Phagwara');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill out all required registration fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));

    // Sign up student: security policy enforces default role 'student'.
    // Users are NEVER allowed to pick organizer or admin during sign up.
    const newStudent = {
      id: `user-${Date.now().toString(36)}`,
      email: email.trim(),
      full_name: fullName.trim(),
      role: 'student' as const, // Strict non-escalated role
      campus,
      interests: ['Technology', 'Workshops', 'Cultural']
    };

    setCurrentUser(newStudent);
    setIsLoading(false);
    navigate('/my-events', { replace: true });
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-center py-16 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-indigo-500/25">
            P
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Pulse</span>
          </span>
        </Link>
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white">
          Create Student Account
        </h2>
        <p className="mt-1.5 text-xs text-slate-400 max-w-sm mx-auto">
          Personalized event schedule, clash detection, and bookmark synchronization.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-200 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Input
              label="Full Name *"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Tanay Tanishk"
              required
            />

            <Input
              label="Campus Student Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student.name@campus.edu"
              required
            />

            <Input
              label="Password (min 6 characters) *"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-400 mb-2">Campus Location</label>
              <input
                type="text"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full text-xs p-3.5 bg-white border border-slate-200 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                required
              />
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                Standard Student Profile: Organizer permissions require verified club appointment by Campus Administration.
              </span>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="md"
              isLoading={isLoading}
              className="w-full gap-2 mt-3"
            >
              <span>Complete Student Registration</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-600 underline">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

