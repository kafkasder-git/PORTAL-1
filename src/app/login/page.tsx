'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/authStore';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';
import { Building2, Lock, Mail, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('admin123');
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      try {
        const params = new URLSearchParams(window.location.search);
        const from = params.get('from');
        const redirectUrl = from ? decodeURIComponent(from) : '/genel';

        // Ensure it's a valid internal route
        if (redirectUrl.startsWith('/')) {
          router.push(redirectUrl);
        } else {
          router.push('/genel');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        router.push('/genel');
      }
    }
  }, [mounted, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      toast.success('Giriş başarılı!');
      router.push('/genel');
    } catch (err: any) {
      toast.error(err.message || 'Giriş başarısız');
    }
  };

  if (!mounted) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top accent */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-primary/20 to-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Bottom accent */}
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-br from-accent/20 to-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="shadow-2xl border-border/40 backdrop-blur-sm bg-card/95">
          {/* Header */}
          <CardHeader className="space-y-4 pb-2">
            <div className="flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="p-3.5 bg-linear-to-br from-primary to-primary/80 rounded-2xl shadow-lg"
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold">
                KAFKASDER
              </CardTitle>
              <CardDescription className="text-base">
                Dernek Yönetim Sistemi
              </CardDescription>
              <p className="text-sm text-muted-foreground pt-1">
                Hesabınıza güvenli giriş yapın
              </p>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="pt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="flex items-center gap-2 font-semibold">
                  <Mail className="w-4 h-4 text-primary" />
                  E-posta Adresi
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                  disabled={isLoading}
                  className="h-11 text-base"
                />
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="flex items-center gap-2 font-semibold">
                  <Lock className="w-4 h-4 text-primary" />
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
                  className="h-11 text-base"
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-base font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>Giriş yapılıyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Giriş Yap</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </motion.div>

              {/* Test Credentials */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 pt-6 border-t border-border/30 space-y-3"
              >
                <p className="text-sm font-semibold text-foreground">Test Hesapları:</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <p className="font-semibold text-foreground">Admin</p>
                    <p className="text-muted-foreground">admin123</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <p className="font-semibold text-foreground">Manager</p>
                    <p className="text-muted-foreground">manager123</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <p className="font-semibold text-foreground">Member</p>
                    <p className="text-muted-foreground">member123</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <p className="font-semibold text-foreground">Viewer</p>
                    <p className="text-muted-foreground">viewer123</p>
                  </div>
                </div>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 left-0 right-0 text-center text-muted-foreground text-xs"
      >
        Güvenli & Modern Dernek Yönetim Çözümü © 2024
      </motion.div>
    </div>
  );
}
