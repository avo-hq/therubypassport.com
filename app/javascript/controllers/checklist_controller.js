import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["item", "progress", "progressBar", "progressText"]

  connect() {
    this.storageKey = "ruby-passport-checklist"
    this.loadState()
    this.updateProgress()
  }

  toggle(event) {
    const checkbox = event.currentTarget
    const key = checkbox.dataset.checklistKey
    const state = this.getState()

    if (checkbox.checked) {
      state[key] = true
    } else {
      delete state[key]
    }

    this.saveState(state)
    this.updateProgress()
  }

  resetAll() {
    localStorage.removeItem(this.storageKey)
    this.itemTargets.forEach((item) => {
      item.checked = false
    })
    this.updateProgress()
  }

  print() {
    window.print()
  }

  getState() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || {}
    } catch {
      return {}
    }
  }

  saveState(state) {
    localStorage.setItem(this.storageKey, JSON.stringify(state))
  }

  loadState() {
    const state = this.getState()
    this.itemTargets.forEach((item) => {
      item.checked = !!state[item.dataset.checklistKey]
    })
  }

  updateProgress() {
    const total = this.itemTargets.length
    const checked = this.itemTargets.filter((item) => item.checked).length
    const percent = total > 0 ? Math.round((checked / total) * 100) : 0

    if (this.hasProgressBarTarget) {
      this.progressBarTarget.style.width = `${percent}%`
    }
    if (this.hasProgressTextTarget) {
      this.progressTextTarget.textContent = `${checked} of ${total} completed`
    }
  }
}
