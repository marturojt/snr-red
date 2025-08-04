'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Check, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

interface ValidationState {
  isValid: boolean;
  isValidating: boolean;
  message?: string;
}

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  validation?: ValidationState;
  helperText?: string;
  icon?: React.ReactNode;
}

export function EnhancedInput({
  label,
  required = false,
  validation,
  helperText,
  icon,
  className,
  ...props
}: EnhancedInputProps) {
  const hasError = validation && !validation.isValid && validation.message;
  const isSuccess = validation && validation.isValid && !validation.isValidating;
  const isValidating = validation?.isValidating;

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label 
          htmlFor={props.id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
        >
          {label}
          {required && (
            <span className="text-destructive">*</span>
          )}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        {/* Input */}
        <Input
          {...props}
          className={cn(
            "transition-all duration-200",
            icon && "pl-10",
            (isSuccess || isValidating || hasError) && "pr-10",
            hasError && "border-destructive focus-visible:ring-destructive",
            isSuccess && "border-green-500 focus-visible:ring-green-500",
            className
          )}
        />
        
        {/* Right Status Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isValidating && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {isSuccess && (
            <Check className="h-4 w-4 text-green-500" />
          )}
          {hasError && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
        </div>
      </div>
      
      {/* Helper Text / Error Message */}
      {(helperText || hasError) && (
        <div className="space-y-1">
          {hasError && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validation.message}
            </p>
          )}
          {helperText && !hasError && (
            <p className="text-sm text-muted-foreground">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  validation?: ValidationState;
  helperText?: string;
}

export function EnhancedTextarea({
  label,
  required = false,
  validation,
  helperText,
  className,
  ...props
}: TextareaProps) {
  const hasError = validation && !validation.isValid && validation.message;
  const isSuccess = validation && validation.isValid && !validation.isValidating;

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label 
          htmlFor={props.id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
        >
          {label}
          {required && (
            <span className="text-destructive">*</span>
          )}
        </label>
      )}
      
      {/* Textarea */}
      <textarea
        {...props}
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          hasError && "border-destructive focus-visible:ring-destructive",
          isSuccess && "border-green-500 focus-visible:ring-green-500",
          className
        )}
      />
      
      {/* Helper Text / Error Message */}
      {(helperText || hasError) && (
        <div className="space-y-1">
          {hasError && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validation.message}
            </p>
          )}
          {helperText && !hasError && (
            <p className="text-sm text-muted-foreground">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
