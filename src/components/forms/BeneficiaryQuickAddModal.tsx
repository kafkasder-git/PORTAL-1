"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Separator } from "@/components/ui/separator"

import { 
  BeneficiaryCategory, 
  FundRegion, 
  FileConnection
} from "@/types/beneficiary"
import { quickAddBeneficiarySchema, QuickAddBeneficiaryFormData } from "@/lib/validations/beneficiary"
import { appwriteApi } from "@/lib/api/appwrite-api"
import type { BeneficiaryDocument, CreateDocumentData } from '@/types/collections'

interface BeneficiaryQuickAddModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Enum değerlerini Türkçe etiketlerle eşleştirme
const categoryLabels: Record<BeneficiaryCategory, string> = {
  [BeneficiaryCategory.YETIM_AILESI]: "Yetim Ailesi",
  [BeneficiaryCategory.MULTECI_AILE]: "Mülteci Aile",
  [BeneficiaryCategory.IHTIYAC_SAHIBI_AILE]: "İhtiyaç Sahibi Aile",
  [BeneficiaryCategory.YETIM_COCUK]: "Yetim Çocuk",
  [BeneficiaryCategory.MULTECI_COCUK]: "Mülteci Çocuk",
  [BeneficiaryCategory.IHTIYAC_SAHIBI_COCUK]: "İhtiyaç Sahibi Çocuk",
  [BeneficiaryCategory.YETIM_GENCLIK]: "Yetim Gençlik",
  [BeneficiaryCategory.MULTECI_GENCLIK]: "Mülteci Gençlik",
  [BeneficiaryCategory.IHTIYAC_SAHIBI_GENCLIK]: "İhtiyaç Sahibi Gençlik"
}

const fundRegionLabels: Record<FundRegion, string> = {
  [FundRegion.AVRUPA]: "Avrupa",
  [FundRegion.SERBEST]: "Serbest"
}

const fileConnectionLabels: Record<FileConnection, string> = {
  [FileConnection.PARTNER_KURUM]: "Partner Kurum",
  [FileConnection.CALISMA_SAHASI]: "Çalışma Sahası"
}

export function BeneficiaryQuickAddModal({ 
  open, 
  onOpenChange 
}: BeneficiaryQuickAddModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingFileNumber, setIsGeneratingFileNumber] = useState(false)

  const form = useForm({
    resolver: zodResolver(quickAddBeneficiarySchema),
    mode: "onChange",
    defaultValues: {
      category: "",
      firstName: "",
      lastName: "",
      nationality: "",
      birthDate: undefined,
      identityNumber: "",
      mernisCheck: false,
      fundRegion: "",
      fileConnection: "",
      fileNumber: ""
    }
  })

  const { watch, setValue, reset } = form
  const watchedCategory = watch("category")
  const watchedFundRegion = watch("fundRegion")

  // Dosya numarası otomatik oluşturma
  const handleGenerateFileNumber = async () => {
    if (!watchedCategory || !watchedFundRegion) {
      toast.error("Önce kategori ve fon bölgesi seçiniz")
      return
    }

    setIsGeneratingFileNumber(true)
    try {
      // Client-side file number generation
      // Format: [FundRegionPrefix][CategoryCode][Timestamp]
      const prefix = watchedFundRegion === 'AVRUPA' ? 'AV' : 'SR';
      const categoryCode = String(watchedCategory).substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      const fileNumber = `${prefix}${categoryCode}${timestamp}`;
      
      setValue('fileNumber', fileNumber);
      toast.success('Dosya numarası oluşturuldu');
    } catch (error) {
      toast.error('Dosya numarası oluşturulurken hata oluştu');
    } finally {
      setIsGeneratingFileNumber(false);
    }
  }

  const onSubmit = async (data: QuickAddBeneficiaryFormData) => {
    setIsLoading(true)
    try {
      // Appwrite API için data mapping - CreateDocumentData<BeneficiaryDocument> contract
      const beneficiaryData: CreateDocumentData<BeneficiaryDocument> = {
        name: `${data.firstName} ${data.lastName}`,
        tc_no: data.identityNumber || '',
        phone: '', // Required field - empty for now, can be collected later
        address: '', // Required field - empty for now, can be collected later
        city: '', // Required field - empty for now, can be collected later
        district: '', // Required field - empty for now, can be collected later
        neighborhood: '', // Required field - empty for now, can be collected later
        family_size: 1, // Required field - default to 1
        birth_date: data.birthDate?.toISOString(),
        nationality: data.nationality,
        status: 'TASLAK' as const,
        // Persist quick-add selections by mapping to suitable fields
        notes: `Kategori: ${data.category}, Fon Bölgesi: ${data.fundRegion}, Dosya Bağlantısı: ${data.fileConnection}, Dosya No: ${data.fileNumber}`
      };
      
      const result = await appwriteApi.beneficiaries.createBeneficiary(beneficiaryData);
      
      if (result.data) {
        toast.success('İhtiyaç sahibi başarıyla oluşturuldu');
        reset();
        onOpenChange(false);
        
        // Detay sayfasına yönlendir
        router.push(`/yardim/ihtiyac-sahipleri/${result.data.$id}`);
      } else {
        toast.error(result.error || 'İhtiyaç sahibi oluşturulamadı');
      }
    } catch (error: any) {
      toast.error(error.message || 'İhtiyaç sahibi oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    // Only close if form is not submitting and no validation errors
    if (!open && !isLoading && !form.formState.isSubmitting) {
      handleClose()
    } else if (open) {
      onOpenChange(true)
    }
  }

  const { errors, isValid } = form.formState

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>İhtiyaç Sahibi Ekle</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Yeni ihtiyaç sahibi için temel bilgileri girin ve detay kaydı için yönlendirileceksiniz
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Kategori */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori <span className="text-red-600">*</span></Label>
            <Select
              value={form.watch("category")}
              onValueChange={(value) => setValue("category", value as BeneficiaryCategory)}
            >
              <SelectTrigger aria-invalid={!!errors.category} aria-describedby={errors.category ? "category-error" : undefined}>
                <SelectValue placeholder="Kategori seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p id="category-error" className="text-sm text-red-600">
                {errors.category.message as string}
              </p>
            )}
          </div>

          {/* Ad ve Soyad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ad <span className="text-red-600">*</span></Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                placeholder="Ad"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p id="firstName-error" className="text-sm text-red-600">
                  {errors.firstName.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Soyad <span className="text-red-600">*</span></Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                placeholder="Soyad"
                disabled={isLoading}
              />
              {errors.lastName && (
                <p id="lastName-error" className="text-sm text-red-600">
                  {errors.lastName.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Uyruk */}
          <div className="space-y-2">
            <Label htmlFor="nationality">Uyruk <span className="text-red-600">*</span></Label>
            <Input
              id="nationality"
              {...form.register("nationality")}
              aria-invalid={!!errors.nationality}
              aria-describedby={errors.nationality ? "nationality-error" : undefined}
              placeholder="Uyruk"
              disabled={isLoading}
            />
            {errors.nationality && (
              <p id="nationality-error" className="text-sm text-red-600">
                {errors.nationality.message as string}
              </p>
            )}
          </div>

          {/* Doğum Tarihi */}
          <div className="space-y-2">
            <Label>Doğum Tarihi</Label>
            <DatePicker
              value={form.watch("birthDate")}
              onChange={(date) => setValue("birthDate", date)}
              placeholder="Doğum tarihi seçiniz"
              disabled={isLoading}
            />
            {errors.birthDate && (
              <p className="text-sm text-red-600">
                {errors.birthDate.message as string}
              </p>
            )}
          </div>

          {/* Kimlik No */}
          <div className="space-y-2">
            <Label htmlFor="identityNumber">Kimlik No</Label>
            <Input
              id="identityNumber"
              {...form.register("identityNumber")}
              aria-invalid={!!errors.identityNumber}
              aria-describedby={errors.identityNumber ? "identityNumber-error" : undefined}
              placeholder="TC Kimlik No"
              maxLength={11}
              disabled={isLoading}
            />
            {errors.identityNumber && (
              <p id="identityNumber-error" className="text-sm text-red-600">
                {errors.identityNumber.message as string}
              </p>
            )}
          </div>

          {/* Mernis Kontrolü */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mernisCheck"
              checked={form.watch("mernisCheck")}
              onCheckedChange={(checked) => setValue("mernisCheck", !!checked)}
              disabled={isLoading}
            />
            <Label htmlFor="mernisCheck" className="text-sm">
              Mernis Kontrolü Yap
            </Label>
          </div>

          <Separator />

          {/* Fon Bölgesi */}
          <div className="space-y-2">
            <Label htmlFor="fundRegion">Fon Bölgesi <span className="text-red-600">*</span></Label>
            <Select
              value={form.watch("fundRegion")}
              onValueChange={(value) => setValue("fundRegion", value as FundRegion)}
            >
              <SelectTrigger aria-invalid={!!errors.fundRegion} aria-describedby={errors.fundRegion ? "fundRegion-error" : undefined}>
                <SelectValue placeholder="Fon bölgesi seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fundRegionLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fundRegion && (
              <p id="fundRegion-error" className="text-sm text-red-600">
                {errors.fundRegion.message as string}
              </p>
            )}
          </div>

          {/* Dosya Bağlantısı */}
          <div className="space-y-2">
            <Label htmlFor="fileConnection">Dosya Bağlantısı <span className="text-red-600">*</span></Label>
            <Select
              value={form.watch("fileConnection")}
              onValueChange={(value) => setValue("fileConnection", value as FileConnection)}
            >
              <SelectTrigger aria-invalid={!!errors.fileConnection} aria-describedby={errors.fileConnection ? "fileConnection-error" : undefined}>
                <SelectValue placeholder="Dosya bağlantısı seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fileConnectionLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fileConnection && (
              <p id="fileConnection-error" className="text-sm text-red-600">
                {errors.fileConnection.message as string}
              </p>
            )}
          </div>

          {/* Dosya Numarası */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="fileNumber">Dosya Numarası <span className="text-red-600">*</span></Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateFileNumber}
                disabled={isGeneratingFileNumber || !watchedCategory || !watchedFundRegion}
                aria-live="polite"
              >
                {isGeneratingFileNumber ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Otomatik Oluştur"
                )}
              </Button>
            </div>
            <Input
              id="fileNumber"
              {...form.register("fileNumber")}
              aria-invalid={!!errors.fileNumber}
              aria-describedby={errors.fileNumber ? "fileNumber-error" : undefined}
              placeholder="Dosya numarası"
              disabled={isLoading}
            />
            {errors.fileNumber && (
              <p id="fileNumber-error" className="text-sm text-red-600">
                {errors.fileNumber.message as string}
              </p>
            )}
          </div>

          <Separator />

          {/* Butonlar */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Kapat
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Kaydet"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}