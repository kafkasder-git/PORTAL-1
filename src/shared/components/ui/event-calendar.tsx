/**
 * Event Calendar Component
 * Displays meetings, tasks, and other events on a calendar
 */

'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Calendar } from './calendar';
import { cn } from '@/shared/lib/utils';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  type: 'meeting' | 'task' | 'deadline' | 'event' | 'appointment';
  color?: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface EventCalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onCreateEvent?: (date: Date) => void;
  view?: 'calendar' | 'list';
  onViewChange?: (view: 'calendar' | 'list') => void;
}

export function EventCalendar({
  events = [],
  onDateSelect,
  onEventClick,
  onCreateEvent,
  view = 'calendar',
  onViewChange
}: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.date);
      const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;

      // Check if date falls within event range
      return date >= eventStart && date <= eventEnd;
    });
  };

  // Get all days in current month view
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const calendarDays = getCalendarDays();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
  };

  const handleCreateEvent = (date: Date) => {
    onCreateEvent?.(date);
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    const colors = {
      meeting: 'bg-blue-500',
      task: 'bg-green-500',
      deadline: 'bg-red-500',
      event: 'bg-purple-500',
      appointment: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const upcomingEvents = getUpcomingEvents();

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  if (view === 'calendar') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Etkinlik Takvimi
            </CardTitle>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex rounded-md border">
                <Button
                  variant={view === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange?.('calendar')}
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Takvim
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange?.('list')}
                >
                  Liste
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {format(currentDate, 'MMMM yyyy', { locale: tr })}
                </span>
                <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button onClick={() => handleCreateEvent(new Date())}>
                <Plus className="h-4 w-4 mr-2" />
                Etkinlik Ekle
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const dayEvents = getEventsForDay(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={cn(
                    'min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all',
                    'hover:bg-accent/50',
                    isCurrentMonth ? 'bg-card' : 'bg-muted/30',
                    isSelected && 'ring-2 ring-primary ring-offset-1',
                    isTodayDate && 'border-primary'
                  )}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={cn(
                    'text-sm font-medium mb-1',
                    isTodayDate && 'text-primary font-bold'
                  )}>
                    {format(date, 'd')}
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={cn(
                          'text-xs p-1 rounded truncate cursor-pointer transition-all text-white',
                          getEventTypeColor(event.type)
                        )}
                        onClick={(e) => handleEventClick(event, e)}
                        title={event.title}
                      >
                        {format(new Date(event.date), 'HH:mm')} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents.length - 3} daha fazla
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Yaklaşan Etkinlikler</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange?.('calendar')}
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Takvim
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange?.('list')}
              >
                Liste
              </Button>
              <Button onClick={() => handleCreateEvent(new Date())}>
                <Plus className="h-4 w-4 mr-2" />
                Etkinlik Ekle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Yaklaşan etkinlik bulunmuyor</p>
              <Button className="mt-4" onClick={() => handleCreateEvent(new Date())}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Etkinliği Oluştur
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onEventClick?.(event)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <Badge className={cn('text-white', getEventTypeColor(event.type))}>
                          {event.type}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {format(new Date(event.date), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                        </span>
                        {event.endDate && (
                          <span>
                            - {format(new Date(event.endDate), 'HH:mm', { locale: tr })}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Görüntüle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook to sync calendar events with meetings from the API
 */
export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // In a real implementation, this would fetch from API
  const loadEvents = async () => {
    setIsLoading(true);
    try {
      // Fetch meetings
      // const meetingsResponse = await appwriteApi.meetings.getMeetings({ limit: 1000 });
      // const meetings = meetingsResponse.data || [];
      //
      // // Fetch tasks
      // const tasksResponse = await appwriteApi.tasks.getTasks({ limit: 1000 });
      // const tasks = tasksResponse.data || [];
      //
      // // Transform to events
      // const meetingEvents: CalendarEvent[] = meetings.map(m => ({
      //   id: m.$id,
      //   title: m.title,
      //   date: new Date(m.meeting_date),
      //   type: 'meeting',
      //   description: m.description
      // }));
      //
      // const taskEvents: CalendarEvent[] = tasks
      //   .filter(t => t.due_date)
      //   .map(t => ({
      //     id: t.$id,
      //     title: t.title,
      //     date: new Date(t.due_date!),
      //     type: 'deadline',
      //     description: t.description
      //   }));
      //
      // setEvents([...meetingEvents, ...taskEvents]);

      // For demo, set empty
      setEvents([]);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    events,
    isLoading,
    loadEvents,
    setEvents
  };
}
