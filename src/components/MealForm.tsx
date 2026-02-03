'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Meal, MealInput } from '@/lib/api'

type MealFormValues = {
  name: string
  ingredients: { value: string }[]
  notes?: string
}

type MealFormProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialMeal?: Meal | null
  onClose: () => void
  onSave: (payload: MealInput) => Promise<void> | void
}

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  ingredients: z
    .array(z.object({ value: z.string().trim().min(1, 'Agrega al menos un ingrediente.') }))
    .min(1, 'Agrega al menos un ingrediente.'),
  notes: z.string().optional(),
})

export const MealForm = ({ open, mode, initialMeal, onClose, onSave }: MealFormProps) => {
  const [formError, setFormError] = useState<string | null>(null)
  const initialValues = useMemo<MealFormValues>(
    () => ({
      name: initialMeal?.name ?? '',
      ingredients:
        initialMeal?.ingredients?.map((item) => ({ value: item })) ?? [{ value: '' }],
      notes: initialMeal?.notes ?? '',
    }),
    [initialMeal],
  )

  const { control, register, handleSubmit, reset, formState } = useForm<MealFormValues>({
    defaultValues: initialValues,
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  })

  useEffect(() => {
    reset(initialValues)
    setFormError(null)
  }, [initialValues, reset])

  const submit = handleSubmit(async (values) => {
    setFormError(null)
    const result = schema.safeParse(values)
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? 'Revisa los campos.')
      return
    }

    const ingredients = result.data.ingredients
      .map((item) => item.value.trim())
      .filter(Boolean)
    if (!ingredients.length) {
      setFormError('Agrega al menos un ingrediente.')
      return
    }

    await onSave({
      name: result.data.name.trim(),
      ingredients,
      notes: result.data.notes?.trim() || undefined,
    })
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              {mode === 'create' ? 'Crear comida' : 'Editar comida'}
            </h2>
            <p className="text-sm text-neutral-500">Agrega un ingrediente por línea.</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            Cerrar
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700">Nombre</label>
            <input
              {...register('name')}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
              placeholder="Ej. Bowl mediterráneo"
            />
            {formState.errors.name && (
              <p className="mt-1 text-xs text-red-500">{formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">Ingredientes</label>
            <div className="mt-2 space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    {...register(`ingredients.${index}.value`)}
                    className="w-full rounded border border-neutral-300 px-3 py-2"
                    placeholder="Ej. Pechuga de pollo"
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded border border-neutral-300 px-3 py-2 text-xs"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formState.errors.ingredients && (
              <p className="mt-1 text-xs text-red-500">
                {formState.errors.ingredients?.[0]?.value?.message ??
                  'Agrega al menos un ingrediente.'}
              </p>
            )}
            <button
              type="button"
              onClick={() => append({ value: '' })}
              className="mt-2 rounded border border-neutral-300 px-3 py-2 text-sm"
            >
              Añadir más
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">Notas</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
              placeholder="Notas opcionales..."
            />
          </div>

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-neutral-300 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
