'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { countries, type Country, defaultCountry } from '@/lib/countries';

interface CountrySelectorProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  disabled?: boolean;
}

export function CountrySelector({ 
  selectedCountry, 
  onCountryChange, 
  disabled = false 
}: CountrySelectorProps) {
  return (
    <Select
      value={selectedCountry.code}
      onValueChange={(code) => {
        const country = countries.find(c => c.code === code);
        if (country) {
          onCountryChange(country);
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm">{selectedCountry.dialCode}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center gap-3 w-full">
              <span className="text-lg">{country.flag}</span>
              <div className="flex-1">
                <div className="text-sm font-medium">{country.name}</div>
              </div>
              <span className="text-sm text-muted-foreground">
                {country.dialCode}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  country: Country;
  onCountryChange: (country: Country) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  country,
  onCountryChange,
  placeholder = "Enter phone number",
  error,
  disabled = false,
  required = false
}: PhoneInputProps) {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove all non-digits
    const cleaned = input.replace(/[^\d]/g, '');
    
    // Apply country-specific formatting
    if (cleaned.length === 0) {
      onChange('');
      return;
    }

    let formatted = '';
    let mask = country.format;
    let digitIndex = 0;
    
    for (let i = 0; i < mask.length && digitIndex < cleaned.length; i++) {
      if (mask[i] === '#') {
        formatted += cleaned[digitIndex];
        digitIndex++;
      } else {
        formatted += mask[i];
      }
    }
    
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <CountrySelector
          selectedCountry={country}
          onCountryChange={onCountryChange}
          disabled={disabled}
        />
        <div className="flex-1">
          <Input
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
