import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { register, login } from '../services/auth.service';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function RegisterPage() {
  const { isAuthenticated, login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Nome é obrigatório.';
    if (!email.trim()) errors.email = 'E-mail é obrigatório.';
    if (password.length < 6)
      errors.password = 'A senha deve ter no mínimo 6 caracteres.';
    if (password !== confirmPassword)
      errors.confirmPassword = 'As senhas não coincidem.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      const { token, user } = await login({ email: email.trim(), password });
      authLogin(token, user);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } }).response?.data
          ?.error || 'Erro ao criar conta. Tente novamente.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary bg-gradient-radial p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-emerald/20 mb-4">
            <svg
              className="w-8 h-8 text-accent-emerald"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Criar Conta
          </h1>
          <p className="text-text-secondary mt-1">
            Comece a controlar suas finanças hoje
          </p>
        </div>

        {/* Card do formulário */}
        <div className="glass rounded-2xl p-10 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-accent-rose/10 border border-accent-rose/30 rounded-xl px-4 py-3 text-sm text-accent-rose animate-fade-in">
                {error}
              </div>
            )}

            <Input
              label="Nome"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              }
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              }
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              }
            />

            <Input
              label="Confirmar Senha"
              type="password"
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              }
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              Criar Conta
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Já tem conta?{' '}
            <Link
              to="/login"
              className="text-accent-violet hover:text-accent-violet-light font-medium transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
