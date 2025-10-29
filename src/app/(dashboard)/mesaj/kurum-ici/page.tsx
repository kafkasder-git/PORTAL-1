'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appwriteApi } from '@/lib/api/appwrite-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  MessageSquare,
  Send,
  FileText,
  Trash2,
  Reply,
  Forward,
  Eye,
  EyeOff,
  Calendar,
  User,
  Mail,
  MoreHorizontal,
} from 'lucide-react';
import { MessageForm } from '@/components/forms/MessageForm';
import {
  getStatusLabel,
  getStatusColor,
  getMessageTypeLabel
} from '@/lib/validations/message';
import type { MessageDocument, UserDocument } from '@/types/collections';

type ActiveTab = 'inbox' | 'sent' | 'drafts';

export default function InternalMessagingPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // State management
  const [activeTab, setActiveTab] = useState<ActiveTab>('inbox');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageDocument | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showMessageDetail, setShowMessageDetail] = useState(false);

  const limit = 20;

  // Data fetching based on active tab
  const { data, isLoading, error } = useQuery({
    queryKey: ['internal-messages', activeTab, page, search, user?.id],
    queryFn: async () => {
      if (!user?.id) return { data: [], total: 0 };

      switch (activeTab) {
        case 'inbox':
          // return appwriteApi.messages.getInboxMessages(user.id);
          return { data: [], total: 0 };
        case 'sent':
          // return appwriteApi.messages.getMessagesBySender(user.id);
          return { data: [], total: 0 };
        case 'drafts':
          // return appwriteApi.messages.getMessages({
          //   filters: {
          //     sender: user.id,
          //     status: 'draft',
          //     message_type: 'internal'
          //   },
          //   page,
          //   limit
          // });
          return { data: [], total: 0 };
        default:
          return { data: [], total: 0 };
      }
    },
    enabled: !!user?.id,
  });

  // Fetch users for sender names
  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: () => appwriteApi.users.getUsers({ limit: 100 }),
  });

  const messages: any[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const users = usersResponse?.data || [];

  // Calculate stats
  const inboxCount = activeTab === 'inbox' ? total : 0;
  const sentCount = activeTab === 'sent' ? total : 0;
  const draftsCount = activeTab === 'drafts' ? total : 0;

  // Mutations
  const deleteMessageMutation = useMutation({
    mutationFn: (id: string) => Promise.resolve({ data: null, error: null }), // appwriteApi.messages.deleteMessage(id),
    onSuccess: () => {
      toast.success('Mesaj silindi.');
      queryClient.invalidateQueries({ queryKey: ['internal-messages'] });
      setSelectedMessage(null);
      setShowMessageDetail(false);
    },
    onError: (error: any) => {
      toast.error('Mesaj silinirken hata oluştu: ' + error.message);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => Promise.resolve({ data: null, error: null }), // appwriteApi.messages.markAsRead(id, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-messages'] });
    },
  });

  // Event handlers
  const handleMessageClick = (message: MessageDocument) => {
    setSelectedMessage(message);
    setShowMessageDetail(true);
    
    // Mark as read if it's an inbox message
    if (activeTab === 'inbox') {
      markAsReadMutation.mutate(message.$id);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  const handleBulkDelete = () => {
    if (selectedMessages.length === 0) return;
    
    if (window.confirm(`${selectedMessages.length} mesajı silmek istediğinizden emin misiniz?`)) {
      selectedMessages.forEach(messageId => {
        deleteMessageMutation.mutate(messageId);
      });
      setSelectedMessages([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map(m => m.$id));
    }
  };

  const handleMessageSelect = (messageId: string) => {
    if (selectedMessages.includes(messageId)) {
      setSelectedMessages(selectedMessages.filter(id => id !== messageId));
    } else {
      setSelectedMessages([...selectedMessages, messageId]);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find((u: UserDocument) => u.$id === userId);
    return user?.name || 'Bilinmeyen Kullanıcı';
  };

  const getUserEmail = (userId: string) => {
    const user = users.find((u: UserDocument) => u.$id === userId);
    return user?.email || '';
  };

  const clearFilters = () => {
    setSearch('');
    setPage(1);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <MessageSquare className="h-12 w-12 mx-auto mb-4" />
            <p>Mesajlar yüklenirken hata oluştu</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kurum İçi Mesajlar</h2>
          <p className="text-gray-600 mt-2">
            Ekip üyeleriyle mesajlaşın ve bildirimler alın
          </p>
        </div>
        
        <Dialog open={showComposeModal} onOpenChange={setShowComposeModal}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Yeni Mesaj
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Mesaj Oluştur</DialogTitle>
              <DialogDescription>
                Ekip üyelerine mesaj gönderin
              </DialogDescription>
            </DialogHeader>
            <MessageForm
              defaultMessageType="internal"
              onSuccess={() => {
                setShowComposeModal(false);
                // Refresh messages list
                queryClient.invalidateQueries({ queryKey: ['internal-messages'] });
              }}
              onCancel={() => setShowComposeModal(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gelen Mesajlar</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
              ) : (
                inboxCount
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gönderilen Mesajlar</CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <Send className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
              ) : (
                sentCount
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taslaklar</CardTitle>
            <div className="p-2 rounded-lg bg-gray-100">
              <FileText className="h-4 w-4 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
              ) : (
                draftsCount
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Mesaj ara (konu, gönderen, içerik)"
                className="pl-10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Button onClick={clearFilters} variant="outline">
              Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inbox">Gelen Kutusu</TabsTrigger>
              <TabsTrigger value="sent">Gönderilenler</TabsTrigger>
              <TabsTrigger value="drafts">Taslaklar</TabsTrigger>
            </TabsList>

            {/* Inbox Tab */}
            <TabsContent value="inbox" className="py-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  Mesajlar yükleniyor...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Gelen kutunuz boş</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bulk Actions */}
                  {selectedMessages.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-700">
                        {selectedMessages.length} mesaj seçildi
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  )}

                  {/* Messages List */}
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <Card
                        key={message.$id}
                        className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                          selectedMessages.includes(message.$id) ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => handleMessageClick(message)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedMessages.includes(message.$id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleMessageSelect(message.$id);
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold">
                                      {message.subject || 'Konusuz Mesaj'}
                                    </h3>
                                    <Badge className={getStatusColor(message.status)}>
                                      {getStatusLabel(message.status)}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {message.content}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      <span>{getUserName(message.sender)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>
                                        {new Date(message.$createdAt).toLocaleDateString('tr-TR')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMessage(message.$id);
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-gray-600">
                        Sayfa {page} / {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Önceki
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          Sonraki
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Sent Tab */}
            <TabsContent value="sent" className="py-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  Mesajlar yükleniyor...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Send className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Henüz mesaj göndermediniz</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => (
                    <Card
                      key={message.$id}
                      className="cursor-pointer transition-colors hover:bg-blue-50"
                      onClick={() => handleMessageClick(message)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {message.subject || 'Konusuz Mesaj'}
                              </h3>
                              <Badge className={getStatusColor(message.status)}>
                                {getStatusLabel(message.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {message.content}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{message.recipients.length} alıcı</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(message.$createdAt).toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Drafts Tab */}
            <TabsContent value="drafts" className="py-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  Mesajlar yükleniyor...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Taslak mesaj bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => (
                    <Card
                      key={message.$id}
                      className="cursor-pointer transition-colors hover:bg-blue-50"
                      onClick={() => handleMessageClick(message)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {message.subject || 'Konusuz Mesaj'}
                              </h3>
                              <Badge className={getStatusColor(message.status)}>
                                {getStatusLabel(message.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {message.content}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{message.recipients.length} alıcı</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Son değişiklik: {new Date(message.$updatedAt).toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMessage(message.$id);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <Dialog open={showMessageDetail} onOpenChange={setShowMessageDetail}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Mesaj Detayı</DialogTitle>
              <DialogDescription>
                Mesaj detaylarını görüntüleyin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedMessage.subject || 'Konusuz Mesaj'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(selectedMessage.status)}>
                      {getStatusLabel(selectedMessage.status)}
                    </Badge>
                    <Badge variant="outline">
                      {getMessageTypeLabel(selectedMessage.message_type)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowComposeModal(true);
                      setShowMessageDetail(false);
                    }}
                  >
                    <Reply className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMessage(selectedMessage.$id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    <strong>Gönderen:</strong> {getUserName(selectedMessage.sender)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>
                    <strong>Alıcılar:</strong> {selectedMessage.recipients.length} kişi
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    <strong>Tarih:</strong> {new Date(selectedMessage.$createdAt).toLocaleString('tr-TR')}
                  </span>
                </div>
                {selectedMessage.sent_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Send className="h-4 w-4" />
                    <span>
                      <strong>Gönderim:</strong> {new Date(selectedMessage.sent_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">İçerik:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>

              {selectedMessage.recipients.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Alıcılar:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMessage.recipients.map((recipientId, index) => (
                      <Badge key={index} variant="secondary">
                        {getUserName(recipientId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
