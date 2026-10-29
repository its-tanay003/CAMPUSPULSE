import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Input, Card, Badge } from '../components/ui';

export const LoginPage: React.FC = () => {
  const { setCurrentUser, switchRole } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Return to intended location if redirected
  const from = (location.state as any)?.from?.pathname || '/my-events';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both student campus email and password.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid campus email address.');
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 450)); // realistic authentication latency simulation

    // Authenticate student session (strictly defaults to student role to prevent privilege self-escalation)
    const authenticatedStudent = {
      id: `user-${email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}`,
      email: email.trim(),
      full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: 'student' as const, // Strict non-escalated role
      campus: 'LPU Main Campus, Phagwara',
      interests: ['Technology', 'Workshops']
    };

    setCurrentUser(authenticatedStudent);
    setIsLoading(false);
    navigate(from, { replace: true });
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
          Sign in to your Student Account
        </h2>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Manage your saved agenda, synchronized calendar, and confirmed event passes.
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
              label="Campus Student Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname.12204592@campus.edu"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full gap-2 mt-2"
            >
              <span>Sign In to Student Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#334155] text-center text-xs text-[#94A3B8]">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-[#38BDF8] hover:underline">
              Create Student Account
            </Link>
          </div>
        </Card>

        {/* Quick Demo Fill Pill */}
        <div className="mt-6 p-4 rounded-2xl bg-[#151C2F]/50 border border-[#334155] text-xs text-[#94A3B8] text-center space-y-2">
          <div className="font-semibold text-[#F8FAFC]">Quick Demonstration Shortcut:</div>
          <p className="text-[11px]">Click below to populate standard student evaluation credentials:</p>
          <button
            type="button"
            onClick={() => {
              setEmail('student.tanay@campus.edu');
              setPassword('demoPassword123');
            }}
            className="text-[11px] font-bold text-[#7C5CFC] hover:text-purple-300 underline"
          >
            Auto-fill Demo Student Credentials
          </button>
        </div>
      </div>
    </div>
  );
};
