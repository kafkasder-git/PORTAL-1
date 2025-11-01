'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { DatePicker } from '@/shared/components/ui/date-picker';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Calendar, Clock, MapPin, Users, UserPlus, X, Plus } from 'lucide-react';
import type { MeetingDocument } from '@/entities/collections';

// Form validation schema
const meetingSchema = z.object({
  title: z.string().min(3, 'Toplantı başlığı en az 3 karakter olmalıdır'),
  description: z.string().optional(),
  meeting_date: z.date().refine((date) => date !== undefined, {
    message: 'Toplantı tarihi zorunludur',
  }),
  meeting_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat girin (HH:MM)'),
  duration: z.number().min(15, 'Toplantı en az 15 dakika olmalıdır').max(480, 'Toplantı en fazla 8 saat olabilir'),
  location: z.string().min(3, 'Konum bilgisi zorunludur'),
  meeting_type: z.enum(['general', 'committee', 'board', 'other']),
  participants: z.array(z.string()).min(1, 'En az bir katılımcı seçilmelidir'),
  agenda: z.string().optional(),
  notes: z.string().optional(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface MeetingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  meeting?: MeetingDocument | null;
  selectedDate?: Date | null;
}

export function MeetingForm({ isOpen, onClose, onSuccess, meeting, selectedDate }: MeetingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participants, setParticipants] = useState<string[]>(meeting?.participants || []);
  const [showParticipantDialog, setShowParticipantDialog] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');

  const isEditing = !!meeting;

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: meeting?.title || '',
      description: meeting?.description || '',
      meeting_date: meeting?.meeting_date ? new Date(meeting.meeting_date) : (selectedDate || new Date()),
      meeting_time: '10:00', // Default time since MeetingDocument doesn't have meeting_time
      duration: 60, // Default duration since MeetingDocument doesn't have duration
      location: meeting?.location || '',
      meeting_type: meeting?.meeting_type || 'general',
      participants: meeting?.participants || [],
      agenda: meeting?.agenda || '',
      notes: meeting?.notes || '',
    },
  });

  const onSubmit = async (data: MeetingFormData) => {
    setIsSubmitting(true);
    try {
      // Combine date and time into a single ISO datetime string
      const meetingDateTime = new Date(data.meeting_date);
      const [hours, minutes] = data.meeting_time.split(':');
      meetingDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      // Format meeting date as ISO string
      const meetingDateISO = meetingDateTime.toISOString();

      // Create the meeting data
      const meetingData = {
        title: data.title,
        description: data.description,
        meeting_date: meetingDateISO,
        location: data.location,
        meeting_type: data.meeting_type,
        participants: participants,
        agenda: data.agenda,
        // Store duration in notes for now (can be a separate field in future)
        notes: data.notes
          ? `${data.notes}\n\nSüre: ${data.duration} dakika`
          : `Süre: ${data.duration} dakika`,
        status: 'scheduled' as const,
      };

      if (isEditing && meeting) {
        // Update existing meeting
        const response = await fetch(`/api/meetings/${meeting.$id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meetingData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Toplantı güncellenemedi');
        }

        toast.success(result.message || 'Toplantı başarıyla güncellendi');
      } else {
        // Create new meeting
        const response = await fetch('/api/meetings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meetingData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Toplantı oluşturulamadı');
        }

        toast.success(result.message || 'Toplantı başarıyla oluşturuldu');
      }

      onSuccess();
      onClose();
      form.reset();
      setParticipants([]);
    } catch (error: any) {
      console.error('Meeting submission error:', error);
      toast.error(
        error.message ||
        (isEditing
          ? 'Toplantı güncellenirken hata oluştu'
          : 'Toplantı oluşturulurken hata oluştu')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Participant management
  const handleAddParticipant = () => {
    if (newParticipantName.trim()) {
      setParticipants([...participants, newParticipantName.trim()]);
      setNewParticipantName('');
      setShowParticipantDialog(false);
    }
  };

  // No agenda items functionality needed - using simple agenda field

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isEditing ? 'Toplantıyı Düzenle' : 'Yeni Toplantı Oluştur'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Toplantı bilgilerini güncelleyin'
              : 'Toplantı detaylarını girin ve katılımcıları belirleyin'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toplantı Başlığı *</FormLabel>
                    <FormControl>
                      <Input placeholder="Toplantı başlığını girin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meeting_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toplantı Türü *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tür seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">Genel Kurul</SelectItem>
                        <SelectItem value="committee">Komite</SelectItem>
                        <SelectItem value="board">Yönetim Kurulu</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Toplantı hakkında detaylı açıklama"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="meeting_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarih *</FormLabel>
                    <FormControl>
                      <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tarih seçin"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meeting_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saat *</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Süre (dk) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={15}
                        max={480}
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konum *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Toplantı adresini girin"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Participants */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Katılımcılar</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowParticipantDialog(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Katılımcı Ekle
                </Button>
              </div>

              {participants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Henüz katılımcı eklenmemiş</p>
                  <p className="text-sm">Katılımcı eklemek için yukarıdaki butona tıklayın</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>{participant}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setParticipants(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agenda */}
            <FormField
            control={form.control}
            name="agenda"
            render={({ field }) => (
            <FormItem>
            <FormLabel>Gündem</FormLabel>
              <FormControl>
                  <Textarea
                      placeholder="Toplantı gündemini girin (her maddeyi ayrı satırda yazın)"
                    rows={4}
                  {...field}
              />
            </FormControl>
              <FormMessage />
              </FormItem>
            )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ek notlar ve hatırlatmalar"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {isEditing ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                  </>
                ) : (
                  isEditing ? 'Toplantıyı Güncelle' : 'Toplantıyı Oluştur'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Add Participant Dialog */}
      <Dialog open={showParticipantDialog} onOpenChange={setShowParticipantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Katılımcı Ekle</DialogTitle>
            <DialogDescription>
              Toplantıya katılacak kişinin adını girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Katılımcı adı"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddParticipant();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowParticipantDialog(false);
                  setNewParticipantName('');
                }}
              >
                İptal
              </Button>
              <Button onClick={handleAddParticipant}>
                Ekle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
