import { Material, Recipe } from '../utils/types'
import Nest from '../objects/nest'
import Raven from '../objects/raven'
import MainScene from './mainScene'

const SECTIONS = ['materials', 'cauldron', 'recipes'] as const

type Section = (typeof SECTIONS)[number]

export class LabScene extends Phaser.Scene {
  raven!: Raven
  nest!: Nest
  selectedMaterials: Material[] = []
  materialTexts: { text: Phaser.GameObjects.Text; material: Material }[] = []
  cauldronTexts: Phaser.GameObjects.Text[] = []
  recipeTexts: { text: Phaser.GameObjects.Text; recipe: Recipe }[] = []
  currentSelectionIndex: number = 0
  sections = SECTIONS
  currentSection: Section = 'materials'
  brewButton!: Phaser.GameObjects.Text
  cauldronText!: Phaser.GameObjects.Text
  selectionFrame!: Phaser.GameObjects.Rectangle

  constructor() {
    super({ key: 'LabScene' })
  }

  init({ raven, nest }: { raven: Raven; nest: Nest }) {
    console.log('init')
    this.raven = raven
    this.nest = nest
  }

  create() {
    console.log('create')
    this.add.graphics().fillStyle(0x000000, 0.7).fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)

    this.createMaterialList()
    this.createRecipeList()
    this.createCauldron()

    this.input.keyboard.on('keydown-D', this.nextSection, this)
    this.input.keyboard.on('keydown-A', this.previousSection, this)
    this.input.keyboard.on('keydown-S', this.nextItem, this)
    this.input.keyboard.on('keydown-W', this.previousItem, this)
    this.input.keyboard.on('keydown-SHIFT', this.returnToMainScene, this)
    this.input.keyboard.on('keydown-SPACE', this.selectItem, this)

    this.selectionFrame = this.add.rectangle(0, 0, 0, 0, 0xffffff, 0.5).setVisible(false)
    this.updateSelectionFrame()
  }

  createMaterialList() {
    console.log('createMaterialList')
    this.add.text(100, this.cameras.main.centerY - 140, 'Materials', { fontSize: '28px', color: '#fff' })

    this.materialTexts = []
    let y = this.cameras.main.centerY - 100
    Object.keys(this.nest.materials).forEach(material => {
      const count = this.nest.materials[material as Material]
      const color = count >= 10 ? '#fff' : '#aaa'
      const text = this.add.text(100, y, `${material}: ${count}`, { fontSize: '24px', color: color })
      this.materialTexts.push({ text, material: material as Material })
      y += 30
    })
  }

  createRecipeList() {
    console.log('createRecipeList')
    this.add.text(this.cameras.main.width - 300, this.cameras.main.centerY - 140, 'Recipes', {
      fontSize: '28px',
      color: '#fff'
    })

    this.recipeTexts = []
    let y = this.cameras.main.centerY - 100
    const recipes = this.getRecipes()
    recipes.forEach(recipe => {
      const color = this.canAffordRecipe(recipe) ? '#fff' : '#aaa'
      const text = this.add.text(this.cameras.main.width - 300, y, recipe.name, { fontSize: '24px', color: color })
      this.recipeTexts.push({ text, recipe })
      y += 30
    })
  }

  createCauldron() {
    console.log('createCauldron')
    this.add
      .text(this.cameras.main.width / 2, this.cameras.main.centerY - 140, 'Cauldron', {
        fontSize: '28px',
        color: '#fff'
      })
      .setOrigin(0.5, 0)

    this.cauldronTexts = [
      this.add
        .text(this.cameras.main.width / 2, this.cameras.main.centerY - 100, 'Empty', {
          fontSize: '24px',
          color: '#aaa'
        })
        .setOrigin(0.5, 0),

      this.add
        .text(this.cameras.main.width / 2, this.cameras.main.centerY - 70, 'Empty', {
          fontSize: '24px',
          color: '#aaa'
        })
        .setOrigin(0.5, 0)
    ]

    this.brewButton = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.centerY - 20, 'Brew', {
        fontSize: '32px',
        color: '#aaa'
      })
      .setOrigin(0.5, 0)
      .setInteractive()
    this.brewButton.on('pointerdown', this.brew.bind(this))
  }

  updateSelectionFrame() {
    console.log('updateSelectionFrame')
    let x = 0,
      y = 0,
      width = 0,
      height = 0
    this.selectionFrame.setVisible(false)

    switch (this.currentSection) {
      case 'materials':
        if (this.materialTexts[this.currentSelectionIndex]) {
          const { text } = this.materialTexts[this.currentSelectionIndex]
          ;({ x, y, width, height } = text.getBounds())
        }
        break
      case 'cauldron':
        if (this.currentSelectionIndex < 2) {
          const text = this.cauldronTexts[this.currentSelectionIndex]
          ;({ x, y, width, height } = text.getBounds())
        } else {
          ;({ x, y, width, height } = this.brewButton.getBounds())
        }
        break
      case 'recipes':
        if (this.recipeTexts[this.currentSelectionIndex]) {
          const { text } = this.recipeTexts[this.currentSelectionIndex]
          ;({ x, y, width, height } = text.getBounds())
        }
        break
    }

    this.selectionFrame
      .setPosition(x, y)
      .setSize(width + 10, height + 10)
      .setStrokeStyle(2, 0xffffff)
      .setVisible(true)
  }

  nextSection() {
    console.log('nextSection')
    for (let i = 0; i < this.sections.length; i++) {
      this.currentSection = this.sections[(this.sections.indexOf(this.currentSection) + 1) % this.sections.length]
      if (this.hasEnabledItemsInCurrentSection()) {
        this.currentSelectionIndex = 0
        this.updateSelectionFrame()
        return
      }
    }
    this.selectionFrame.setVisible(false) // Hide if no enabled items found
  }

  previousSection() {
    console.log('previousSection')
    for (let i = 0; i < this.sections.length; i++) {
      this.currentSection =
        this.sections[(this.sections.indexOf(this.currentSection) - 1 + this.sections.length) % this.sections.length]
      if (this.hasEnabledItemsInCurrentSection()) {
        this.currentSelectionIndex = 0
        this.updateSelectionFrame()
        return
      }
    }
    this.selectionFrame.setVisible(false) // Hide if no enabled items found
  }

  hasEnabledItemsInCurrentSection(): boolean {
    switch (this.currentSection) {
      case 'materials':
        return this.materialTexts.some(text => text.text.style.color !== '#aaa')
      case 'cauldron':
        // Include the brew button as an item to be enabled
        return this.cauldronTexts.some(text => text.style.color !== '#aaa') || this.brewButton.style.color !== '#aaa'
      case 'recipes':
        return this.recipeTexts.some(text => text.text.style.color !== '#aaa')
      default:
        return false
    }
  }

  nextItem() {
    console.log('nextItem')
    switch (this.currentSection) {
      case 'materials':
        do {
          this.currentSelectionIndex = (this.currentSelectionIndex + 1) % this.materialTexts.length
        } while (this.materialTexts[this.currentSelectionIndex].text.style.color === '#aaa')
        break
      case 'cauldron':
        this.currentSelectionIndex = (this.currentSelectionIndex + 1) % 3
        if (this.currentSelectionIndex < 2 && this.cauldronTexts[this.currentSelectionIndex].style.color === '#aaa') {
          this.currentSelectionIndex = 2 // Skip to brew button if selected item is empty
        }
        break
      case 'recipes':
        do {
          this.currentSelectionIndex = (this.currentSelectionIndex + 1) % this.recipeTexts.length
        } while (this.recipeTexts[this.currentSelectionIndex].text.style.color === '#aaa')
        break
    }
    this.updateSelectionFrame()
  }

  previousItem() {
    console.log('previousItem')
    switch (this.currentSection) {
      case 'materials':
        do {
          this.currentSelectionIndex =
            (this.currentSelectionIndex - 1 + this.materialTexts.length) % this.materialTexts.length
        } while (this.materialTexts[this.currentSelectionIndex].text.style.color === '#aaa')
        break
      case 'cauldron':
        this.currentSelectionIndex = (this.currentSelectionIndex - 1 + 3) % 3
        if (this.currentSelectionIndex < 2 && this.cauldronTexts[this.currentSelectionIndex].style.color === '#aaa') {
          this.currentSelectionIndex = 1 // Skip to first filled item or brew button
        }
        break
      case 'recipes':
        do {
          this.currentSelectionIndex =
            (this.currentSelectionIndex - 1 + this.recipeTexts.length) % this.recipeTexts.length
        } while (this.recipeTexts[this.currentSelectionIndex].text.style.color === '#aaa')
        break
    }
    this.updateSelectionFrame()
  }

  selectItem() {
    console.log('selectItem')
    switch (this.currentSection) {
      case 'materials':
        this.addMaterialToCauldron()
        break
      case 'cauldron':
        if (this.currentSelectionIndex < 2) {
          this.removeMaterialFromCauldron(this.currentSelectionIndex)
        } else {
          this.brew()
        }
        break
      case 'recipes':
        this.selectRecipeMaterials()
        break
    }
  }

  addMaterialToCauldron() {
    console.log('addMaterialToCauldron')
    const material = this.materialTexts[this.currentSelectionIndex].material
    if (this.selectedMaterials.length < 2 && this.nest.materials[material] >= 10) {
      this.selectedMaterials.push(material)
      this.updateCauldronText()
      this.updateSelectionFrame()
    }
  }

  removeMaterialFromCauldron(index: number) {
    console.log('removeMaterialFromCauldron')
    if (this.selectedMaterials.length > index) {
      this.selectedMaterials.splice(index, 1)
      this.updateCauldronText()
      this.updateSelectionFrame()
    }
  }

  updateCauldronText() {
    console.log('updateCauldronText')
    for (let i = 0; i < 2; i++) {
      console.log('for')
      if (this.selectedMaterials[i]) {
        this.cauldronTexts[i].setText(this.selectedMaterials[i])
        this.cauldronTexts[i].setFill('#fff')
      } else {
        this.cauldronTexts[i].setText('Empty')
        this.cauldronTexts[i].setFill('#aaa')
      }
    }

    const fillColor = this.selectedMaterials.length === 2 ? '#fff' : '#aaa'
    this.brewButton.setFill(fillColor)
  }

  selectRecipeMaterials() {
    console.log('selectRecipeMaterials')
    const recipe = this.recipeTexts[this.currentSelectionIndex].recipe
    if (this.canAffordRecipe(recipe)) {
      this.selectedMaterials = Object.keys(recipe.materials) as Material[]
      this.updateCauldronText()
      this.updateSelectionFrame()
    }
  }

  canAffordRecipe(recipe: Recipe): boolean {
    return (
      this.nest.essence >= recipe.essence &&
      Object.keys(recipe.materials).every(
        material => this.nest.materials[material as Material] >= recipe.materials[material]
      )
    )
  }

  brew() {
    console.log('brew')
    if (this.selectedMaterials.length === 2 && this.nest.essence >= 10) {
      this.nest.essence -= 10
      if (Math.random() < 0.1) {
        console.log('Brewing failed, adding Shadowblight')
        ;(this.scene.get('MainScene') as MainScene).addShadowblight()
      } else {
        console.log('Brewing succeeded, applying upgrade')
        // Apply the upgrade to the Raven
      }

      this.selectedMaterials.forEach(material => {
        this.nest.materials[material]--
      })
      this.selectedMaterials = []

      this.scene.restart({ raven: this.raven, nest: this.nest })
    }
  }

  returnToMainScene() {
    console.log('returnToMainScene')
    this.scene.stop()
    this.scene.resume('MainScene')
  }

  getRecipes(): Recipe[] {
    return [
      { name: 'Recipe 1', essence: 10, materials: { 'Mystic Crystals': 5, 'Precious Metals': 5 } },
      { name: 'Recipe 2', essence: 10, materials: { 'Mystic Crystals': 5, 'Ancient Scrolls': 5 } },
      { name: 'Recipe 3', essence: 10, materials: { 'Mystic Crystals': 5, 'Herbal Extracts': 5 } },
      { name: 'Recipe 4', essence: 10, materials: { 'Precious Metals': 5, 'Ancient Scrolls': 5 } },
      { name: 'Recipe 5', essence: 10, materials: { 'Precious Metals': 5, 'Herbal Extracts': 5 } },
      { name: 'Recipe 6', essence: 10, materials: { 'Ancient Scrolls': 5, 'Herbal Extracts': 5 } }
    ]
  }
}
