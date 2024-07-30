import { Material, Potion } from '../utils/types'
import Nest from '../objects/nest'
import Raven from '../objects/raven'
import MainScene from './mainScene'
import getRecipes from '../utils/potion-factory'

const getTextColor = (enabled: boolean = true): string => {
  return enabled ? '#fff' : '#aaa'
}

const SECTIONS = ['materials', 'cauldron', 'recipes'] as const
const FONT_HEADING = {
  fontSize: '28px',
  color: getTextColor(true)
}
const FONT_ITEM = (enabled: boolean = true) => ({
  fontSize: '24px',
  color: getTextColor(enabled)
})

type Section = (typeof SECTIONS)[number]

export default class LabScene extends Phaser.Scene {
  raven!: Raven
  nest!: Nest
  selectedMaterials: Material[] = []
  materialTexts: { text: Phaser.GameObjects.Text; material: Material }[] = []
  cauldronTexts: { text: Phaser.GameObjects.Text }[] = []
  recipeTexts: { text: Phaser.GameObjects.Text; recipe: Potion }[] = []
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
    this.add.text(100, this.cameras.main.centerY - 140, 'Materials', FONT_HEADING)

    this.materialTexts = []
    let y = this.cameras.main.centerY - 100
    Object.keys(this.nest.materials).forEach(material => {
      const count = this.nest.materials[material as Material]
      const enabled = count >= 0
      const text = this.add.text(100, y, `${material}: ${count}`, FONT_ITEM(enabled))
      this.materialTexts.push({ text, material: material as Material })
      y += 30
    })

    // Add essence counter below material items
    y += 20 // Add some space before the essence counter
    this.add.text(100, y, `Essence: ${this.nest.essence}`, FONT_ITEM(true))
  }

  createRecipeList() {
    console.log('createRecipeList')
    this.add.text(this.cameras.main.width - 300, this.cameras.main.centerY - 140, 'Recipes', FONT_HEADING)

    this.recipeTexts = []
    let y = this.cameras.main.centerY - 100
    const recipes = getRecipes()
    recipes.forEach(recipe => {
      console.log('Current recipe looks like: ' + JSON.stringify(recipe))
      const enabled = this.canAffordRecipe(recipe)
      console.log('The recipe is... ' + recipe + 'and it is...' + enabled)
      const text = this.add.text(this.cameras.main.width - 300, y, recipe.name, FONT_ITEM(enabled))
      this.recipeTexts.push({ text, recipe })
      y += 30
    })
  }

  createCauldron() {
    console.log('createCauldron')
    this.add
      .text(this.cameras.main.width / 2, this.cameras.main.centerY - 140, 'Cauldron', FONT_HEADING)
      .setOrigin(0.5, 0)

    this.cauldronTexts = [
      {
        text: this.add
          .text(this.cameras.main.width / 2, this.cameras.main.centerY - 100, 'Empty', FONT_ITEM(false))
          .setOrigin(0.5, 0)
      },

      {
        text: this.add
          .text(this.cameras.main.width / 2, this.cameras.main.centerY - 70, 'Empty', FONT_ITEM(false))
          .setOrigin(0.5, 0)
      }
    ]

    this.brewButton = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.centerY - 20, 'Brew', {
        fontSize: '32px',
        color: getTextColor(false)
      })
      .setOrigin(0.5, 0)
  }

  updateSelectionFrame() {
    console.log('updateSelectionFrame')
    let text!: Phaser.GameObjects.Text
    this.selectionFrame.setVisible(false)

    switch (this.currentSection) {
      case 'materials':
        if (this.materialTexts[this.currentSelectionIndex]) {
          text = this.materialTexts[this.currentSelectionIndex].text
        }
        break
      case 'cauldron':
        if (this.currentSelectionIndex < 2) {
          text = this.cauldronTexts[this.currentSelectionIndex].text
        } else {
          text = this.brewButton
        }
        break
      case 'recipes':
        if (this.recipeTexts[this.currentSelectionIndex]) {
          text = this.recipeTexts[this.currentSelectionIndex].text
        }
        break
    }

    const { x, y, width, height } = text.getBounds()
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
        return this.materialTexts.some(text => !this.isItemDisabled(text))
      case 'cauldron':
        // Include the brew button as an item to be enabled
        return (
          this.cauldronTexts.some(text => !this.isItemDisabled(text)) || !this.isItemDisabled({ text: this.brewButton })
        )
      case 'recipes':
        return this.recipeTexts.some(text => !this.isItemDisabled(text))
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
        } while (this.isItemDisabled(this.materialTexts[this.currentSelectionIndex]))
        break
      case 'cauldron':
        this.currentSelectionIndex = (this.currentSelectionIndex + 1) % 3
        if (this.currentSelectionIndex < 2 && this.isItemDisabled(this.cauldronTexts[this.currentSelectionIndex])) {
          this.currentSelectionIndex = 2 // Skip to brew button if selected item is empty
        }
        break
      case 'recipes':
        do {
          this.currentSelectionIndex = (this.currentSelectionIndex + 1) % this.recipeTexts.length
        } while (this.isItemDisabled(this.recipeTexts[this.currentSelectionIndex]))
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
        } while (this.isItemDisabled(this.materialTexts[this.currentSelectionIndex]))
        break
      case 'cauldron':
        this.currentSelectionIndex = (this.currentSelectionIndex - 1 + 3) % 3
        if (this.currentSelectionIndex < 2 && this.isItemDisabled(this.cauldronTexts[this.currentSelectionIndex])) {
          this.currentSelectionIndex = 1 // Skip to first filled item or brew button
        }
        break
      case 'recipes':
        do {
          this.currentSelectionIndex =
            (this.currentSelectionIndex - 1 + this.recipeTexts.length) % this.recipeTexts.length
        } while (this.isItemDisabled(this.recipeTexts[this.currentSelectionIndex]))
        break
    }
    this.updateSelectionFrame()
  }

  isItemDisabled(item: { text: Phaser.GameObjects.Text }): boolean {
    return item.text.style.color === getTextColor(false)
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
    if (this.selectedMaterials.length < 2 && this.nest.materials[material] >= 1) {
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
      if (this.selectedMaterials[i]) {
        this.cauldronTexts[i].text.setText(this.selectedMaterials[i])
        this.cauldronTexts[i].text.setFill(getTextColor(true))
      } else {
        this.cauldronTexts[i].text.setText('Empty')
        this.cauldronTexts[i].text.setFill(getTextColor(false))
      }
    }

    const enabled = this.selectedMaterials.length === 2
    this.brewButton.setFill(getTextColor(enabled))
  }

  selectRecipeMaterials() {
    console.log('selectRecipeMaterials')
    const recipe = this.recipeTexts[this.currentSelectionIndex].recipe
    if (this.canAffordRecipe(recipe)) {
      this.selectedMaterials = recipe.materials.map(m => m.ingredient)
      this.updateCauldronText()
      this.updateSelectionFrame()
    }
  }

  canAffordRecipe(recipe: Potion): boolean {
    return (
      this.nest.essence >= recipe.essence &&
      recipe.materials.every(material => {
        console.log(`Current material: ${JSON.stringify(material)}`)
        console.log(`All materials in nest: ${JSON.stringify(this.nest.materials)}`)
        console.log(`Current material qtty in nest: ${this.nest.materials[material.ingredient]}`)
        this.nest.materials[material.ingredient] >= material.cost
      })
    )
  }

  brew() {
    console.log('brew')
    if (this.selectedMaterials.length === 2) {
      const matchingRecipe = getRecipes().find(recipe =>
        recipe.materials.every(
          material =>
            this.selectedMaterials.includes(material.ingredient) &&
            this.nest.materials[material.ingredient] >= material.cost
        )
      )

      if (matchingRecipe && this.nest.essence >= matchingRecipe.essence) {
        this.nest.essence -= matchingRecipe.essence

        // TODO: Visual effect for brewing and failure/Shadowblight spawn
        if (Math.random() < 0.1) {
          console.log('Brewing failed, adding Shadowblight')
          ;(this.scene.get('MainScene') as MainScene).addShadowblight()
        } else {
          console.log('Brewing succeeded, applying upgrade')
          this.nest.materials[matchingRecipe.name] = (this.nest.materials[matchingRecipe.name] ?? 0) + 1
          console.log(JSON.stringify(this.nest.materials))
          // matchingRecipe.effect.apply(this.raven)
        }

        matchingRecipe.materials.forEach(material => {
          this.nest.materials[material.ingredient] -= material.cost
        })

        this.selectedMaterials = []
        this.scene.restart({ raven: this.raven, nest: this.nest })
      } else {
        console.log('Not enough essence or materials for brewing.')
      }
    } else {
      console.log('Not enough materials selected.')
    }
  }

  returnToMainScene() {
    console.log('returnToMainScene')
    this.scene.stop()
    this.scene.resume('MainScene')
  }
}
