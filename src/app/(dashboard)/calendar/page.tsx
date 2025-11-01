/**
 * Calendar Integration Page
 */

'use client';

import { useState } from 'react';
import { EventCalendar, useCalendarEvents } from '@/shared/components/ui/event-calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarIcon, Download, Settings } from 'lucide-react';

export default function CalendarPage() {
  const { events, isLoading, loadEvents } = useCalendarEvents();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date);
    // Handle date selection
  };

  const handleEventClick = (event: any) => {
    console.log('Clicked event:', event);
    // Handle event click
  };

  const handleCreateEvent = (date: Date) => {
    console.log('Create event on:', date);
    // Open create event modal
  };

  const handleExportCalendar = () => {
    // Generate iCal export
    console.log('Exporting calendar...');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Etkinlik Takvimi</h1>
          <p className="text-gray-500 mt-2">
            Toplantılar, görevler ve etkinliklerinizi takip edin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCalendar}>
            <Download className="h-4 w-4 mr-2" />
            Takvimi İndir (iCal)
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Ayarlar
          </Button>
        </div>
      </div>

      {/* Calendar Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Etkinlik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Toplantılar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {events.filter(e => e.type === 'meeting').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Görevler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {events.filter(e => e.type === 'task').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Son Tarihler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {events.filter(e => e.type === 'deadline').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Etkinlik Türleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-sm">Toplantı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-sm">Görev</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-sm">Son Tarih</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span className="text-sm">Etkinlik</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span className="text-sm">Randevu</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <EventCalendar
        events={events}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
        onCreateEvent={handleCreateEvent}
        view={view}
        onViewChange={setView}
      />

      {/* Upcoming Events Section - Only show in list view */}
      {view === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Bugünkü Etkinlikler</CardTitle>
            <CardDescription>
              {format(new Date(), 'dd MMMM yyyy, dddd', { locale: tr })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.filter(e => {
              const today = new Date();
              const eventDate = new Date(e.date);
              return eventDate.toDateString() === today.toDateString();
            }).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Bugün için etkinlik bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events
                  .filter(e => {
                    const today = new Date();
                    const eventDate = new Date(e.date);
                    return eventDate.toDateString() === today.toDateString();
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className="text-white bg-blue-500">
                          {format(new Date(event.date), 'HH:mm', { locale: tr })}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm text-gray-500">{event.description}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
