"use client"

import { useState } from "react"

import { cn } from "@/components/ui/utils"

import styles from "./door.module.css"

type DoorProps = {
  subject?: string
  timeRange?: string
  enterLabel?: string
  isActive?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  className?: string
  onOpenChange?: (isOpen: boolean) => void
  onEnter?: () => void
}

export function Door({
  subject = "English",
  timeRange = "09:00 - 10:00",
  enterLabel = "ENTER",
  isActive = true,
  defaultOpen = false,
  disabled = false,
  className,
  onOpenChange,
  onEnter,
}: DoorProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const updateOpen = (nextOpen: boolean) => {
    if (disabled) return
    setIsOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  const handleToggle = () => {
    if (disabled) return
    if (!isOpen) {
      updateOpen(true)
    }
  }

  const handleBackDoorClick = () => {
    if (disabled || !isOpen) return
    onEnter?.()
  }

  return (
    <div
      className={cn(styles.backDoor, className)}
      onMouseLeave={() => updateOpen(false)}
    >
      <h1 className={styles.enterLabel}>{enterLabel}</h1>
      <button
        type="button"
        className={styles.backPanelButton}
        onClick={handleBackDoorClick}
        disabled={disabled || !isOpen}
        aria-label={isOpen ? `Enter ${subject} lesson` : "افتح الباب أولا"}
      />

      <button
        type="button"
        className={cn(styles.door, isOpen && styles.doorOpen)}
        onMouseEnter={() => updateOpen(true)}
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-label={disabled ? "لا يوجد درس حالي" : `Open ${subject} door`}
      >
        <h1 className={cn(styles.doorText, styles.doorTitle)}>{subject}</h1>
        <h1 className={styles.doorText}>{timeRange}</h1>
        <div className={styles.activeDotContainer}>
          <div className={cn(styles.activeDot, !isActive && styles.inactiveDot)} />
        </div>
      </button>
    </div>
  )
}
