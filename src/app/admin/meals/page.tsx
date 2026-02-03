'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createMeal, deleteMeal, searchMeals, updateMeal, type Meal } from '@/lib/api'
import { MealForm } from '@/components/MealForm'
import { MealTable } from '@/components/MealTable'

const normalizeMeal = (meal: Meal | Record<string, any>): Meal => {
  const id = (meal as Meal).id ?? meal._id ?? meal.meal_id
  return {
    id,
    name: meal.name ?? meal.title ?? 'Comida sin nombre',
    ingredients: meal.ingredients ?? meal.items ?? [],
    notes: meal.notes ?? meal.description,
  }
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [query, setQuery] = useState('')
  const [mustInclude, setMustInclude] = useState('')
  const [exclude, setExclude] = useState('')
  const [maxCalories, setMaxCalories] = useState('')
  const [minProtein, setMinProtein] = useState('')
  const [mealType, setMealType] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [nextCursor, setNextCursor] = useState<number | string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const limit = 20

  const parseList = useCallback((value: string) => {
    const items = value
      .split(/[\n,]/g)
      .map((item) => item.trim())
      .filter(Boolean)
    return items.length ? items : undefined
  }, [])

  const parseNumber = useCallback((value: string) => {
    if (!value.trim()) return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }, [])

  const searchParams = useMemo(
    () => ({
      must_include: parseList(mustInclude),
      exclude: parseList(exclude),
      max_calories: parseNumber(maxCalories),
      min_protein: parseNumber(minProtein),
      meal_type: mealType.trim() || undefined,
      q: query.trim() || undefined,
    }),
    [exclude, maxCalories, mealType, minProtein, mustInclude, parseList, parseNumber, query],
  )

  const loadMeals = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const page = await searchMeals({ ...searchParams, limit })
      setMeals(page.items.map(normalizeMeal))
      setNextCursor(page.next_cursor ?? null)
      setHasMore(Boolean(page.next_cursor))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar las comidas.')
    } finally {
      setIsLoading(false)
    }
  }, [limit, searchParams])

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const page = await searchMeals({ ...searchParams, limit, cursor: nextCursor })
      setMeals((prev) => [...prev, ...page.items.map(normalizeMeal)])
      setNextCursor(page.next_cursor ?? null)
      setHasMore(Boolean(page.next_cursor))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar más comidas.')
    } finally {
      setIsLoadingMore(false)
    }
  }, [hasMore, isLoadingMore, limit, nextCursor, searchParams])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadMeals()
    }, 400)
    return () => window.clearTimeout(timer)
  }, [loadMeals, searchParams])

  const handleCreateClick = () => {
    setEditingMeal(null)
    setIsFormOpen(true)
  }

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal)
    setIsFormOpen(true)
  }

  const handleDelete = async (meal: Meal) => {
    const confirmed = window.confirm(`¿Eliminar ${meal.name}?`)
    if (!confirmed) return
    try {
      await deleteMeal(meal.id)
      setMeals((prev) => prev.filter((item) => item.id !== meal.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos eliminar la comida.')
    }
  }

  const handleSave = async (payload: Omit<Meal, 'id'>) => {
    try {
      if (editingMeal) {
        const updated = await updateMeal(editingMeal.id, payload)
        setMeals((prev) =>
          prev.map((item) => (item.id === editingMeal.id ? normalizeMeal(updated) : item)),
        )
      } else {
        const created = await createMeal(payload)
        setMeals((prev) => [normalizeMeal(created), ...prev])
      }
      setIsFormOpen(false)
      await loadMeals()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar la comida.')
    }
  }

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Comidas</h1>
          <p className="text-sm text-neutral-500">Administra tus comidas e ingredientes.</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          Crear comida
        </button>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm">{error}</div>}

      <MealTable
        meals={meals}
        query={query}
        mustInclude={mustInclude}
        exclude={exclude}
        maxCalories={maxCalories}
        minProtein={minProtein}
        mealType={mealType}
        onQueryChange={setQuery}
        onMustIncludeChange={setMustInclude}
        onExcludeChange={setExclude}
        onMaxCaloriesChange={setMaxCalories}
        onMinProteinChange={setMinProtein}
        onMealTypeChange={setMealType}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <div ref={loadMoreRef} className="flex justify-center py-4 text-sm text-neutral-500">
        {isLoadingMore
          ? 'Cargando más comidas...'
          : hasMore
            ? 'Desplázate para ver más'
            : 'No hay más comidas'}
      </div>

      <MealForm
        open={isFormOpen}
        mode={editingMeal ? 'edit' : 'create'}
        initialMeal={editingMeal}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
