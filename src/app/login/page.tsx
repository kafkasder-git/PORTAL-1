'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('admin123');
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    initializeAuth();
  }, [initializeAuth]);

  // Redirect if already authenticated
  useEffect(() => {
    if (mounted && isAuthenticated) {
      const from = new URLSearchParams(window.location.search).get('from') || '/genel';
      router.push(from);
    }
  }, [mounted, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      toast.success('Giriş başarılı!');

      // Use router.push instead of window.location.href to preserve state
      router.push('/genel');
    } catch (err: any) {
      toast.error(err.message || 'Giriş başarısız');
    }
  };

  // Don't render until mounted (prevent hydration mismatch)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Don't render the form if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-slate-800/30 via-transparent to-gray-800/30"
          animate={{
            x: ['-50%', '50%', '-50%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-700/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="shadow-2xl bg-white/95 backdrop-blur-xl border-white/20">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="p-4 bg-gradient-to-br from-slate-800 to-gray-800 rounded-2xl shadow-lg"
              >
                <Building2 className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold text-slate-900">
            Dernek Yönetim Sistemi
          </CardTitle>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                Hesabınıza güvenli giriş yapın
          </p>
            </div>
        </CardHeader>

        <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  E-posta
                </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                disabled={isLoading}
                  className="h-12 border-gray-200 focus:border-slate-600 focus:ring-slate-600"
              />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  Şifre
                </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                  className="h-12 border-gray-200 focus:border-slate-600 focus:ring-slate-600"
              />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
            <Button
              type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-slate-800 to-gray-800 hover:from-slate-700 hover:to-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Giriş yapılıyor...
                    </span>
                  ) : (
                    'Giriş Yap'
                  )}
            </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200"
              >
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  Test Hesapları
              </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-700 rounded-full" />
                    <span className="font-medium">Admin:</span>
                    <span className="text-slate-600">admin123</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full" />
                    <span className="font-medium">Manager:</span>
                    <span className="text-gray-600">manager123</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-600 rounded-full" />
                    <span className="font-medium">Member:</span>
                    <span className="text-slate-600">member123</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    <span className="font-medium">Viewer:</span>
                    <span className="text-gray-500">viewer123</span>
              </div>
            </div>
              </motion.div>
          </form>
        </CardContent>
      </Card>
      </motion.div>

      {/* Bottom decorative text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-8 left-0 right-0 text-center text-white/30 text-sm font-light"
      >
        Güvenli & Modern Dernek Yönetim Çözümü
      </motion.div>
    </div>
  );
}
