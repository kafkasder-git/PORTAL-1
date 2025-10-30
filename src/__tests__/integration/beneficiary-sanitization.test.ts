import { describe, it, expect } from 'vitest';
import {
  sanitizeTcNo,
  sanitizePhone,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeObject
} from '@/shared/lib/sanitization';
import { beneficiarySchema } from '@/shared/lib/validations/beneficiary';
import {
  BeneficiaryCategory,
  FundRegion,
  FileConnection
} from '@/entities/beneficiary';

describe('Beneficiary Sanitization Integration', () => {
  describe('TC Kimlik No Sanitization + Validation', () => {
    it('should sanitize and validate correct TC Kimlik No', () => {
      const rawTc = '10000000146'; // Valid TC (example)
      const sanitized = sanitizeTcNo(rawTc);
      
      expect(sanitized).toBe('10000000146');
      
      // Validate with schema
      const data = {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        nationality: 'Türkiye',
        identityNumber: sanitized,
        mernisCheck: true,
        category: BeneficiaryCategory.IHTIYAC_SAHIBI_AILE,
        fundRegion: FundRegion.SERBEST,
        fileConnection: FileConnection.CALISMA_SAHASI,
        fileNumber: 'FILE001'
      };
      
      const result = beneficiarySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid TC after sanitization', () => {
      const rawTc = '12345678901'; // Invalid checksum
      const sanitized = sanitizeTcNo(rawTc);
      
      expect(sanitized).toBeNull();
    });
    
    it('should sanitize TC with formatting', () => {
      const rawTc = '100-000-001-46'; // With dashes
      const sanitized = sanitizeTcNo(rawTc);
      
      // Should extract digits but fail validation (invalid checksum)
      expect(sanitized).toBeNull();
    });
  });
  
  describe('Phone Sanitization + Validation', () => {
    it('should sanitize Turkish phone to international format', () => {
      const rawPhone = '0555 123 45 67';
      const sanitized = sanitizePhone(rawPhone);
      
      expect(sanitized).toBe('+905551234567');
      
      // Validate with schema
      const data = {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        nationality: 'Türkiye',
        mobilePhone: sanitized,
        category: BeneficiaryCategory.IHTIYAC_SAHIBI_AILE,
        fundRegion: FundRegion.SERBEST,
        fileConnection: FileConnection.CALISMA_SAHASI,
        fileNumber: 'FILE001',
        mernisCheck: false
      };
      
      const result = beneficiarySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
    
    it('should reject landline numbers', () => {
      const rawPhone = '0212 123 45 67'; // Istanbul landline
      const sanitized = sanitizePhone(rawPhone);
      
      expect(sanitized).toBeNull();
    });
    
    it('should handle phone with country code', () => {
      const rawPhone = '+90 555 123 45 67';
      const sanitized = sanitizePhone(rawPhone);
      
      expect(sanitized).toBe('+905551234567');
    });
  });
  
  describe('Email Sanitization + Validation', () => {
    it('should sanitize and validate email', () => {
      const rawEmail = '  AHMET@EXAMPLE.COM  ';
      const sanitized = sanitizeEmail(rawEmail);
      
      expect(sanitized).toBe('ahmet@example.com');
      
      // Validate with schema
      const data = {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        nationality: 'Türkiye',
        email: sanitized,
        category: BeneficiaryCategory.IHTIYAC_SAHIBI_AILE,
        fundRegion: FundRegion.SERBEST,
        fileConnection: FileConnection.CALISMA_SAHASI,
        fileNumber: 'FILE001',
        mernisCheck: false
      };
      
      const result = beneficiarySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid email format', () => {
      const rawEmail = 'not-an-email';
      const sanitized = sanitizeEmail(rawEmail);
      
      expect(sanitized).toBeNull();
    });
  });
  
  describe('Number Sanitization + Validation', () => {
    it('should sanitize and validate income', () => {
      const rawIncome = '5,000.50'; // Turkish format
      const sanitized = sanitizeNumber(rawIncome);
      
      expect(sanitized).toBe(5000.5);
      
      // Validate with schema
      const data = {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        nationality: 'Türkiye',
        monthlyIncome: sanitized,
        category: BeneficiaryCategory.IHTIYAC_SAHIBI_AILE,
        fundRegion: FundRegion.SERBEST,
        fileConnection: FileConnection.CALISMA_SAHASI,
        fileNumber: 'FILE001',
        mernisCheck: false
      };
      
      const result = beneficiarySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
    
    it('should reject negative income after sanitization', () => {
      const rawIncome = '-1000';
      const sanitized = sanitizeNumber(rawIncome);
      
      expect(sanitized).toBe(-1000);
      
      // Schema should reject negative
      const data = {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        nationality: 'Türkiye',
        monthlyIncome: sanitized,
        category: BeneficiaryCategory.IHTIYAC_SAHIBI_AILE,
        fundRegion: FundRegion.SERBEST,
        fileConnection: FileConnection.CALISMA_SAHASI,
        fileNumber: 'FILE001',
        mernisCheck: false
      };
      
      const result = beneficiarySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Object Sanitization', () => {
    it('should sanitize all text fields in beneficiary object', () => {
      const rawData = {
        firstName: '<script>alert("xss")</script>Ahmet',
        lastName: 'Yılmaz<>',
        notes: 'Test notes with <b>HTML</b>',
        address: 'Address with "quotes"'
      };
      
      const sanitized = sanitizeObject(rawData, { allowHtml: false });
      
      expect(sanitized.firstName).not.toContain('<script>');
      expect(sanitized.firstName).toContain('Ahmet');
      expect(sanitized.lastName).not.toContain('<>');
      expect(sanitized.notes).not.toContain('<b>');
      expect(sanitized.address).not.toContain('"');
    });
    
    it('should preserve valid data during sanitization', () => {
      const rawData = {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        monthlyIncome: 5000,
        email: 'ahmet@example.com'
      };
      
      const sanitized = sanitizeObject(rawData, { allowHtml: false });
      
      expect(sanitized.firstName).toBe('Ahmet');
      expect(sanitized.lastName).toBe('Yılmaz');
      expect(sanitized.monthlyIncome).toBe(5000);
      expect(sanitized.email).toBe('ahmet@example.com');
    });
  });
  
  describe('Full Form Data Sanitization + Validation', () => {
    it('should sanitize and validate complete beneficiary data', () => {
      const rawFormData = {
        firstName: '  Ahmet  ',
        lastName: '  Yılmaz  ',
        nationality: 'Türkiye',
        identityNumber: '10000000146',
        mobilePhone: '0555 123 45 67',
        email: '  AHMET@EXAMPLE.COM  ',
        monthlyIncome: '5,000',
        monthlyExpense: '3,000',
        notes: 'Test notes with <script>alert("xss")</script>',
        category: BeneficiaryCategory.IHTIYAC_SAHIBI_AILE,
        fundRegion: FundRegion.SERBEST,
        fileConnection: FileConnection.CALISMA_SAHASI,
        fileNumber: 'FILE001',
        mernisCheck: true
      };
      
      // Sanitize each field
      const sanitizedData = {
        ...rawFormData,
        firstName: rawFormData.firstName.trim(),
        lastName: rawFormData.lastName.trim(),
        identityNumber: sanitizeTcNo(rawFormData.identityNumber),
        mobilePhone: sanitizePhone(rawFormData.mobilePhone),
        email: sanitizeEmail(rawFormData.email),
        monthlyIncome: sanitizeNumber(rawFormData.monthlyIncome),
        monthlyExpense: sanitizeNumber(rawFormData.monthlyExpense),
        notes: sanitizeObject({ notes: rawFormData.notes }, { allowHtml: false }).notes
      };
      
      // Validate with schema
      const result = beneficiarySchema.safeParse(sanitizedData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe('Ahmet');
        expect(result.data.lastName).toBe('Yılmaz');
        expect(result.data.identityNumber).toBe('10000000146');
        expect(result.data.mobilePhone).toBe('+905551234567');
        expect(result.data.email).toBe('ahmet@example.com');
        expect(result.data.monthlyIncome).toBe(5000);
        expect(result.data.monthlyExpense).toBe(3000);
        expect(result.data.notes).not.toContain('<script>');
      }
    });
    
    it('should reject invalid data even after sanitization', () => {
      const rawFormData = {
        firstName: 'A', // Too short
        lastName: 'Yılmaz',
        nationality: 'Türkiye',
        identityNumber: '12345678901', // Invalid checksum
        email: 'invalid-email',
        monthlyIncome: -1000, // Negative
        category: BeneficiaryCategory.IHTIYAC_SAHIBI_AILE,
        fundRegion: FundRegion.SERBEST,
        fileConnection: FileConnection.CALISMA_SAHASI,
        fileNumber: 'FILE001',
        mernisCheck: false
      };
      
      // Sanitize
      const sanitizedData = {
        ...rawFormData,
        identityNumber: sanitizeTcNo(rawFormData.identityNumber),
        email: sanitizeEmail(rawFormData.email),
        monthlyIncome: sanitizeNumber(rawFormData.monthlyIncome)
      };
      
      // Validate
      const result = beneficiarySchema.safeParse(sanitizedData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
  
  describe('Emergency Contacts Sanitization', () => {
    it('should sanitize emergency contact phones', () => {
      const rawContacts = [
        {
          name: 'Mehmet Yılmaz',
          relationship: 'Kardeş',
          phone: '0555 123 45 67'
        },
        {
          name: 'Ayşe Yılmaz',
          relationship: 'Anne',
          phone: '+90 555 987 65 43'
        }
      ];
      
      const sanitizedContacts = rawContacts.map(contact => ({
        ...contact,
        phone: sanitizePhone(contact.phone) || contact.phone
      }));
      
      expect(sanitizedContacts[0].phone).toBe('+905551234567');
      expect(sanitizedContacts[1].phone).toBe('+905559876543');
      
      // Validate with schema
      const data = {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        nationality: 'Türkiye',
        emergencyContacts: sanitizedContacts,
        category: BeneficiaryCategory.IHTIYAC_SAHIBI_AILE,
        fundRegion: FundRegion.SERBEST,
        fileConnection: FileConnection.CALISMA_SAHASI,
        fileNumber: 'FILE001',
        mernisCheck: false
      };
      
      const result = beneficiarySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});