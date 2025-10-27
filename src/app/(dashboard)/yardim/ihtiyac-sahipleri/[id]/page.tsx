"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  Save, 
  X, 
  Camera, 
  Trash2,
  User,
  FileText,
  Heart,
  Shield,
  Phone,
  MapPin,
  Mail,
  Calendar,
  Users,
  Briefcase,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Home,
  Building2,
  CreditCard,
  Activity
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DatePicker } from "@/components/ui/date-picker"

import { getBeneficiary, updateBeneficiary } from "@/lib/api/mock-api"
import { Beneficiary } from "@/types/beneficiary"

export default function BeneficiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['beneficiary', id],
    queryFn: () => getBeneficiary(id),
  })

  const beneficiary = data?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !beneficiary) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Button>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">İhtiyaç Sahibi Bulunamadı</h3>
                <p className="text-red-700">Aradığınız kayıt sistemde mevcut değil.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()} 
                size="sm" 
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Geri
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  İhtiyaç Sahibi Kayıt - {beneficiary.fileNumber}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Camera className="h-4 w-4" />
                Çek
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                Kaldır
              </Button>
              <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4" />
                Kaydet
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <X className="h-4 w-4" />
                Kapat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - Main Form */}
          <div className="col-span-9 space-y-6">
            
            {/* Fotoğraf ve Temel Bilgiler */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Fotoğraf / Sponsorluk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2">
                    <div className="w-full aspect-[3/4] bg-gray-100 rounded border flex items-center justify-center">
                      {beneficiary.photo ? (
                        <img 
                          src={beneficiary.photo} 
                          alt="Fotoğraf" 
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-1">Fotoğraf</p>
                  </div>
                  
                  <div className="col-span-10 grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sponsorluk Tipi</Label>
                      <Select defaultValue={beneficiary.sponsorType || ""}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BIREYSEL">Bireysel</SelectItem>
                          <SelectItem value="KURUMSAL">Kurumsal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kimlik Bilgileri */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Kimlik Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Ad</Label>
                    <Input 
                      defaultValue={beneficiary.firstName}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Soyad</Label>
                    <Input 
                      defaultValue={beneficiary.lastName}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Uyruk</Label>
                    <Input 
                      defaultValue={beneficiary.nationality}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Kimlik No</Label>
                    <Input 
                      defaultValue={beneficiary.identityNumber || ""}
                      className="h-9"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="mernisCheck" 
                    defaultChecked={beneficiary.mernisCheck}
                  />
                  <Label htmlFor="mernisCheck" className="text-sm font-normal">
                    Mernis Kontrolü Yap
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Kategori Bilgileri */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Kategori Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Kategori</Label>
                    <Select defaultValue={beneficiary.category}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YETIM_AILESI">Yetim Ailesi</SelectItem>
                        <SelectItem value="MULTECI_AILE">Mülteci Aile</SelectItem>
                        <SelectItem value="IHTIYAC_SAHIBI_AILE">İhtiyaç Sahibi Aile</SelectItem>
                        <SelectItem value="YETIM_COCUK">Yetim Çocuk</SelectItem>
                        <SelectItem value="MULTECI_COCUK">Mülteci Çocuk</SelectItem>
                        <SelectItem value="IHTIYAC_SAHIBI_COCUK">İhtiyaç Sahibi Çocuk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Fon Bölgesi</Label>
                    <Select defaultValue={beneficiary.fundRegion}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVRUPA">Avrupa</SelectItem>
                        <SelectItem value="SERBEST">Serbest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Dosya Bağlantısı</Label>
                    <Select defaultValue={beneficiary.fileConnection}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PARTNER_KURUM">Partner Kurum</SelectItem>
                        <SelectItem value="CALISMA_SAHASI">Çalışma Sahası</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Dosya Numarası</Label>
                    <Input 
                      defaultValue={beneficiary.fileNumber}
                      readOnly
                      className="h-9 bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* İletişim Bilgileri */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">İletişim Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Cep Telefonu</Label>
                    <div className="flex gap-2">
                      <Select defaultValue={beneficiary.mobilePhoneCode || "555"}>
                        <SelectTrigger className="w-20 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['501', '502', '503', '504', '505', '530', '531', '532', '533', '534', '535', '536', '537', '538', '539', '555'].map(code => (
                            <SelectItem key={code} value={code}>{code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input 
                        defaultValue={beneficiary.mobilePhone || ""}
                        placeholder="123 45 67"
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Sabit Telefon</Label>
                    <Input 
                      defaultValue={beneficiary.landlinePhone || ""}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Yurtdışı Telefon</Label>
                    <Input 
                      defaultValue={beneficiary.internationalPhone || ""}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">E-posta</Label>
                    <Input 
                      type="email"
                      defaultValue={beneficiary.email || ""}
                      className="h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bağlantılar */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Bağlantılar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Bağlı Yetim/Kart</Label>
                    <Input 
                      defaultValue={beneficiary.linkedOrphan || ""}
                      readOnly
                      className="h-9 bg-gray-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Ailedeki Kişi Sayısı</Label>
                    <Select defaultValue={beneficiary.familyMemberCount?.toString() || "1"}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adres Bilgileri */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Adres Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Ülke</Label>
                    <Select defaultValue={beneficiary.country || ""}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TURKIYE">Türkiye</SelectItem>
                        <SelectItem value="SURIYE">Suriye</SelectItem>
                        <SelectItem value="AFGANISTAN">Afganistan</SelectItem>
                        <SelectItem value="IRAK">Irak</SelectItem>
                        <SelectItem value="IRAN">İran</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Şehir/Bölge</Label>
                    <Select defaultValue={beneficiary.city || ""}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ISTANBUL">İstanbul</SelectItem>
                        <SelectItem value="ANKARA">Ankara</SelectItem>
                        <SelectItem value="IZMIR">İzmir</SelectItem>
                        <SelectItem value="BURSA">Bursa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Yerleşim</Label>
                    <Input 
                      defaultValue={beneficiary.district || ""}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Mahalle/Köy</Label>
                    <Input 
                      defaultValue={beneficiary.neighborhood || ""}
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Adres</Label>
                  <Textarea 
                    defaultValue={beneficiary.address || ""}
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Passport ve Vize */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Passport ve Vize</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Passport Tipi</Label>
                    <Select>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIZMET">Hizmet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Passport No</Label>
                    <Input className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Çıkış Tarihi</Label>
                    <Input type="date" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Son Kullanma Tarihi</Label>
                    <Input type="date" className="h-9" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* İş ve Diğer Durumlar */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">İş ve Diğer Durumlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="baseTurkish" />
                      <Label htmlFor="baseTurkish" className="text-sm font-normal">Baz Türkçe</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="deathCertificate" />
                      <Label htmlFor="deathCertificate" className="text-sm font-normal">Ölüm Belgesi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="divorced" />
                      <Label htmlFor="divorced" className="text-sm font-normal">Boşanmış</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="disabled" />
                      <Label htmlFor="disabled" className="text-sm font-normal">Engelli</Label>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="refugee" />
                      <Label htmlFor="refugee" className="text-sm font-normal">Mülteci</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="needyFamily" />
                      <Label htmlFor="needyFamily" className="text-sm font-normal">İhtiyaç Sahibi Aile</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="temporaryProtection" />
                      <Label htmlFor="temporaryProtection" className="text-sm font-normal">Geçici Koruma Altında</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acil Durum İletişim */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Acil Durum İletişim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">İsim</Label>
                    <Input className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Soyisim</Label>
                    <Input className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">TC Kimlik Bilgisi</Label>
                    <Input className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Yakınlık Derecesi</Label>
                    <Select>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANNE">Anne</SelectItem>
                        <SelectItem value="BABA">Baba</SelectItem>
                        <SelectItem value="KARDES">Kardeş</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Etiketler */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Etiketler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Yetim</Badge>
                  <Badge variant="secondary">Mülteci</Badge>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    + Etiket Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Genel Durumlar */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Genel Durumlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Rıza Beyanı</Label>
                  <Textarea 
                    defaultValue={beneficiary.consentStatement || ""}
                    readOnly
                    rows={2}
                    className="resize-none text-sm bg-gray-50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="deleteRecord" 
                      defaultChecked={beneficiary.deleteRecord}
                    />
                    <Label htmlFor="deleteRecord" className="text-sm font-normal">
                      Kaydı Sil
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Label className="text-sm">Durum:</Label>
                    <RadioGroup defaultValue={beneficiary.status} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="TASLAK" id="taslak" />
                        <Label htmlFor="taslak" className="text-sm font-normal">Taslak</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kayıt Bilgileri */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Kayıt Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Kayıt Tarihi:</span>
                    <span className="ml-2 font-medium">15.10.2025 09:28</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Son Güncelleme:</span>
                    <span className="ml-2 font-medium">16.10.2025 10:28</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Bağlantılı Kayıtlar */}
          <div className="col-span-3">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Bağlantılı Kayıtlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Banka Hesapları', count: 0 },
                  { label: 'Dokümanlar', count: 0 },
                  { label: 'Fotoğraflar', count: 0 },
                  { label: 'Baktığı Yetimler', count: 0 },
                  { label: 'Baktığı Kişiler', count: 0 },
                  { label: 'Sponsorlar', count: 0 },
                  { label: 'Referanslar', count: 0 },
                  { label: 'Görüşme Kayıtları', count: 0 },
                  { label: 'Görüşme Seans Takibi', count: 0 },
                  { label: 'Yardım Talepleri', count: 0 },
                  { label: 'Yapılan Yardımlar', count: 0 },
                  { label: 'Rıza Beyanları', count: 0 },
                  { label: 'Sosyal Kartlar', count: 0 },
                  { label: 'Kart Özeti', count: 0 },
                ].map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-between h-9 px-3 hover:bg-gray-100"
                  >
                    <span className="text-sm">{item.label}</span>
                    <Badge variant="secondary" className="text-xs">{item.count}</Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}