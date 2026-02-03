'use client'

import type { Meal } from '@/lib/api'

type MealTableProps = {
  meals: Meal[]
  query: string
  mustInclude: string
  exclude: string
  maxCalories: string
  minProtein: string
  mealType: string
  onQueryChange: (value: string) => void
  onMustIncludeChange: (value: string) => void
  onExcludeChange: (value: string) => void
  onMaxCaloriesChange: (value: string) => void
  onMinProteinChange: (value: string) => void
  onMealTypeChange: (value: string) => void
  onEdit: (meal: Meal) => void
  onDelete: (meal: Meal) => void
  isLoading?: boolean
}

export const MealTable = ({
  meals,
  query,
  mustInclude,
  exclude,
  maxCalories,
  minProtein,
  mealType,
  onQueryChange,
  onMustIncludeChange,
  onExcludeChange,
  onMaxCaloriesChange,
  onMinProteinChange,
  onMealTypeChange,
  onEdit,
  onDelete,
  isLoading,
}: MealTableProps) => {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Comidas</h3>
          <p className="text-sm text-neutral-500">Filtra por ingredientes y valores.</p>
        </div>
        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
            placeholder="Buscar por nombre"
          />
          <input
            value={mustInclude}
            onChange={(event) => onMustIncludeChange(event.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Debe incluir (separado por comas)"
          />
          <input
            value={exclude}
            onChange={(event) => onExcludeChange(event.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Excluir (separado por comas)"
          />
          <input
            value={maxCalories}
            onChange={(event) => onMaxCaloriesChange(event.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Calorías máximas"
            inputMode="numeric"
          />
          <input
            value={minProtein}
            onChange={(event) => onMinProteinChange(event.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Proteína mínima"
            inputMode="decimal"
          />
          <input
            value={mealType}
            onChange={(event) => onMealTypeChange(event.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
            placeholder="Tipo de comida"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 py-6 text-sm text-neutral-500">Cargando comidas...</div>
      ) : meals.length === 0 ? (
        <div className="px-4 py-6 text-sm text-neutral-500">No encontramos comidas.</div>
      ) : (
        <div className="divide-y divide-neutral-200">
          {meals.map((meal, index) => (
            <div
              key={`${meal.id}-${index}`}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900">{meal.name}</p>
                <p className="text-xs text-neutral-500">
                  {meal.ingredients.slice(0, 4).join(', ')}
                  {meal.ingredients.length > 4 ? '...' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(meal)}
                  className="rounded border border-neutral-300 px-3 py-1.5 text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(meal)}
                  className="rounded border border-red-200 px-3 py-1.5 text-xs text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
