import { Controller } from "@hotwired/stimulus"

// Holographic 3D card effect that responds to mouse movement
export default class extends Controller {
  static targets = ["card", "shine"]

  connect() {
    this.bounds = null
    this.isAnimating = false
  }

  handleMouseEnter() {
    this.bounds = this.cardTarget.getBoundingClientRect()
  }

  handleMouseMove(event) {
    if (!this.bounds) {
      this.bounds = this.cardTarget.getBoundingClientRect()
    }

    const mouseX = event.clientX
    const mouseY = event.clientY
    const leftX = mouseX - this.bounds.x
    const topY = mouseY - this.bounds.y
    const center = {
      x: leftX - this.bounds.width / 2,
      y: topY - this.bounds.height / 2
    }
    const distance = Math.sqrt(center.x ** 2 + center.y ** 2)

    // Calculate rotation based on mouse position
    const rotateX = (center.y / this.bounds.height) * -25
    const rotateY = (center.x / this.bounds.width) * 25

    // Calculate shine position
    const shineX = (leftX / this.bounds.width) * 100
    const shineY = (topY / this.bounds.height) * 100

    this.cardTarget.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(1.05, 1.05, 1.05)
    `

    if (this.hasShineTarget) {
      this.shineTarget.style.background = `
        radial-gradient(
          circle at ${shineX}% ${shineY}%,
          rgba(255, 255, 255, 0.4) 0%,
          rgba(255, 255, 255, 0.2) 20%,
          rgba(255, 215, 0, 0.1) 40%,
          transparent 60%
        )
      `
      this.shineTarget.style.opacity = '1'
    }
  }

  handleMouseLeave() {
    this.cardTarget.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(0deg)
      scale3d(1, 1, 1)
    `

    if (this.hasShineTarget) {
      this.shineTarget.style.opacity = '0'
    }

    this.bounds = null
  }
}
