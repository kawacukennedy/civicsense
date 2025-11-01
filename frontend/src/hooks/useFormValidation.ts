import { useState, useEffect } from 'react'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
}

interface FieldConfig {
  [key: string]: ValidationRule
}

interface ValidationErrors {
  [key: string]: string
}

export const useFormValidation = (config: FieldConfig) => {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())

  const validateField = (name: string, value: string): string | null => {
    const rules = config[name]
    if (!rules) return null

    if (rules.required && !value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rules.minLength} characters`
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be no more than ${rules.maxLength} characters`
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} format is invalid`
    }

    if (rules.custom) {
      return rules.custom(value)
    }

    return null
  }

  const validate = (values: { [key: string]: any }): ValidationErrors => {
    const newErrors: ValidationErrors = {}

    Object.keys(config).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName] || '')
      if (error) {
        newErrors[fieldName] = error
      }
    })

    setErrors(newErrors)
    return newErrors
  }

  const setFieldTouched = (name: string) => {
    setTouched(prev => new Set(prev).add(name))
  }

  const getFieldError = (name: string): string | null => {
    return touched.has(name) ? errors[name] || null : null
  }

  const isValid = Object.keys(errors).length === 0

  return {
    errors,
    touched,
    validate,
    validateField,
    setFieldTouched,
    getFieldError,
    isValid,
    setErrors,
  }
}