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
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C5CFC] to-[#38BDF8] flex items-center justify-center font-bold text-white text-xl shadow-lg">
            P
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#F8FAFC]">
            Campus<span className="text-[#7C5CFC]">Pulse</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#F8FAFC]">
          Create Student Account
        </h2>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Personalized event schedule, clash detection, and bookmark synchronization.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-200 text-xs font-semibold flex items-center gap-2">
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
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Campus Location</label>
              <input
                type="text"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full text-xs p-3 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
                required
              />
            </div>

            <div className="p-3 bg-[#0B1020] rounded-xl border border-[#334155] text-[11px] text-[#94A3B8] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
              <span>
                Standard Student Profile: Organizer permissions require verified club appointment by Campus Administration.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full gap-2 mt-2"
            >
              <span>Complete Student Registration</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#334155] text-center text-xs text-[#94A3B8]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#38BDF8] hover:underline">
              Sign In Instead
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
