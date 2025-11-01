'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, HelpingHand, GraduationCap } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from './button';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon?: React.ReactNode;
  stats?: {
    label: string;
    value: string | number;
  }[];
}

interface ModernCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  showStats?: boolean;
}

export function ModernCarousel({
  items,
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
  showStats = true,
}: ModernCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, items.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={cn('relative w-full overflow-hidden rounded-xl bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6', className)}>
      <div className="relative h-80">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 flex flex-col justify-center"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 mb-2"
                >
                  {items[currentIndex].icon && (
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {items[currentIndex].icon}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-foreground">
                    {items[currentIndex].title}
                  </h3>
                </motion.div>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground mb-4"
                >
                  {items[currentIndex].description}
                </motion.p>

                {showStats && items[currentIndex].stats && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-4 gap-4"
                  >
                    {items[currentIndex].stats!.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-background/50 backdrop-blur-sm rounded-lg p-3 text-center"
                      >
                        <div className="text-2xl font-bold text-primary">
                          {stat.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {items[currentIndex].image && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-48 h-48 bg-linear-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center"
                >
                  <div className="text-6xl opacity-20">
                    {items[currentIndex].icon || '📊'}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="bg-background/80 backdrop-blur-sm hover:bg-background"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="bg-background/80 backdrop-blur-sm hover:bg-background"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === currentIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-background/50 hover:bg-background/80'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Demo usage component
export function CarouselDemo() {
  const demoItems: CarouselItem[] = [
    {
      id: '1',
      title: 'Bağış Yönetimi',
      description: 'Dernek bağışlarınızı kolayca yönetin ve takip edin. Detaylı raporlar ve analizler ile bağışçılarınızı daha iyi anlayın.',
      icon: <Heart className="h-6 w-6" />,
      stats: [
        { label: 'Aylık Bağış', value: '₺45,230' },
        { label: 'Aktif Bağışçı', value: '156' },
        { label: 'Büyüme', value: '+12%' },
        { label: 'Hedef', value: '%85' },
      ],
    },
    {
      id: '2',
      title: 'Yardım Dağıtımı',
      description: 'İhtiyaç sahiplerini belirleyin ve yardımlarınızı etkin bir şekilde dağıtın. Adil ve şeffaf süreç yönetimi.',
      icon: <HelpingHand className="h-6 w-6" />,
      stats: [
        { label: 'Desteklenen', value: '423' },
        { label: 'Aktif Yardım', value: '87' },
        { label: 'Bu Ay', value: '+23' },
        { label: 'Tamamlanan', value: '%92' },
      ],
    },
    {
      id: '3',
      title: 'Burs Sistemi',
      description: 'Öğrencilere burs sağlayın ve başarı hikayelerini takip edin. Eğitim destek programlarınızı yönetin.',
      icon: <GraduationCap className="h-6 w-6" />,
      stats: [
        { label: 'Bursiyer', value: '89' },
        { label: 'Mezun', value: '234' },
        { label: 'Başarı Oranı', value: '%94' },
        { label: 'Devam Eden', value: '76' },
      ],
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <ModernCarousel
        items={demoItems}
        autoPlay={true}
        autoPlayInterval={6000}
        showStats={true}
      />
    </div>
  );
}
