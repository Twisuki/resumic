"use client"

import type { CollisionDetection, DragEndEvent, DragOverEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core"
import {
  closestCorners,

  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,

} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useState } from "react"
import { useHistory } from "@/hooks/history"
import { mustGet } from "@/lib/tree"
import { useResumeStore } from "@/stores/resume"

export type DragType = "page" | "section"

export interface DragState {
  activeId: UniqueIdentifier | null
  activeType: DragType | null
  sourcePageId: string | null
  overPageId: string | null
}

const initial: DragState = {
  activeId: null,
  activeType: null,
  sourcePageId: null,
  overPageId: null,
}

const PAGE_PREFIX = "page:"
const SECTION_PREFIX = "section:"
const RECEIVE_PREFIX = "page-receive:"

function decodePageId(id: UniqueIdentifier): string | null {
  const s = String(id)
  if (s.startsWith(PAGE_PREFIX))
    return s.slice(PAGE_PREFIX.length)
  if (s.startsWith(RECEIVE_PREFIX))
    return s.slice(RECEIVE_PREFIX.length)
  return null
}

function decodeSectionId(id: UniqueIdentifier): string | null {
  const s = String(id)
  if (s.startsWith(SECTION_PREFIX))
    return s.slice(SECTION_PREFIX.length)
  return null
}

export function useOptionsDrag() {
  const { patch } = useHistory()
  const [drag, setDrag] = useState<DragState>(initial)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    setDrag({
      activeId: active.id,
      activeType: (active.data.current?.type as DragType | undefined) ?? null,
      sourcePageId: (active.data.current?.pageId as string | undefined) ?? null,
      overPageId: null,
    })
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event
    if (!over) {
      setDrag(prev => (prev.overPageId === null ? prev : { ...prev, overPageId: null }))
      return
    }
    const overIdStr = String(over.id)
    let targetPageId: string | null = null
    if (overIdStr.startsWith(PAGE_PREFIX) || overIdStr.startsWith(RECEIVE_PREFIX)) {
      targetPageId = decodePageId(over.id)
    }
    else if (overIdStr.startsWith(SECTION_PREFIX)) {
      targetPageId = (over.data.current?.pageId as string | undefined) ?? null
    }
    setDrag(prev => (targetPageId === prev.overPageId ? prev : { ...prev, overPageId: targetPageId }))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setDrag(initial)
    if (!over)
      return

    const activeType = active.data.current?.type as DragType | undefined
    if (activeType === "page") {
      handlePageDragEnd(active.id, over.id)
    }
    else if (activeType === "section") {
      handleSectionDragEnd(active.id, over.id, active.data.current, over.data.current)
    }
  }

  function handleDragCancel() {
    setDrag(initial)
  }

  function handlePageDragEnd(activeId: UniqueIdentifier, overId: UniqueIdentifier) {
    const activePageId = decodePageId(activeId)
    const overPageId = decodePageId(overId)
    if (!activePageId || !overPageId || activePageId === overPageId)
      return

    const { resume } = useResumeStore.getState()
    if (!resume)
      return
    const root = mustGet(resume, resume.rootId)
    const orders = root.children
    const oldIndex = orders.indexOf(activePageId)
    const newIndex = orders.indexOf(overPageId)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex)
      return

    const newOrders = arrayMove(orders, oldIndex, newIndex)
    patch.reorder(resume.rootId, newOrders)
  }

  function handleSectionDragEnd(
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
    activeData: Record<string, unknown> | undefined,
    overData: Record<string, unknown> | undefined,
  ) {
    const activeSectionId = decodeSectionId(activeId)
    const sourcePageId = activeData?.pageId as string | undefined
    if (!activeSectionId || !sourcePageId)
      return

    const overIdStr = String(overId)
    let targetPageId: string | undefined
    if (overIdStr.startsWith(SECTION_PREFIX)) {
      targetPageId = overData?.pageId as string | undefined
    }
    else if (overIdStr.startsWith(RECEIVE_PREFIX)) {
      targetPageId = decodePageId(overId) ?? undefined
    }
    if (!targetPageId)
      return

    const { resume } = useResumeStore.getState()
    if (!resume)
      return

    if (sourcePageId === targetPageId) {
      const overSectionId = decodeSectionId(overId)
      if (!overSectionId)
        return
      const pageNode = mustGet(resume, sourcePageId)
      const orders = pageNode.children
      const oldIndex = orders.indexOf(activeSectionId)
      const newIndex = orders.indexOf(overSectionId)
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex)
        return
      const newOrders = arrayMove(orders, oldIndex, newIndex)
      patch.reorder(sourcePageId, newOrders)
    }
    else {
      const subtree = patch.remove(sourcePageId, activeSectionId)
      if (subtree)
        patch.add(targetPageId, subtree)
    }
  }

  const collisionDetection: CollisionDetection = (args) => {
    const activeType = args.active.data.current?.type as DragType | undefined

    if (activeType === "page") {
      return [...pointerWithin(args), ...closestCorners(args)]
        .filter(c => c.id !== args.active.id)
        .filter(c => String(c.id).startsWith(PAGE_PREFIX))
    }

    if (activeType === "section") {
      const isSectionOrReceive = (id: UniqueIdentifier) =>
        String(id).startsWith(SECTION_PREFIX) || String(id).startsWith(RECEIVE_PREFIX)

      const pointerHits = pointerWithin(args)
        .filter(c => c.id !== args.active.id)
        .filter(c => isSectionOrReceive(c.id))
      if (pointerHits.length > 0)
        return pointerHits

      const cornerHits = closestCorners(args).filter(c => c.id !== args.active.id)
      const pageReceive = cornerHits.find(c => String(c.id).startsWith(RECEIVE_PREFIX))
      if (pageReceive)
        return [pageReceive]
      return cornerHits.filter(c => String(c.id).startsWith(SECTION_PREFIX))
    }

    return closestCorners(args)
  }

  return {
    drag,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }
}
