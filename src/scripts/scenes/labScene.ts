import { Ingredient, Material, Potion, PotionType } from '../utils/types'
import Nest from '../objects/nest'
import Raven from '../objects/raven'
import MainScene from './mainScene'
import getRecipes from '../utils/potion-factory'
import { POTION_TYPES } from '../utils/constants'
import config from '../config'

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
  selectedIngredients: Ingredient[] = []
  ingredientTexts: { text: Phaser.GameObjects.Text; ingredient: Ingredient }[] = []
  essenceText!: Phaser.GameObjects.Text
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
    this.raven = raven
    this.nest = nest
  }

  create() {
    this.add.graphics().fillStyle(0x000000, 0.7).fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)

    this.createGraphics()

    this.input.keyboard.on('keydown-D', this.nextSection, this)
    this.input.keyboard.on('keydown-A', this.previousSection, this)
    this.input.keyboard.on('keydown-S', this.nextItem, this)
    this.input.keyboard.on('keydown-W', this.previousItem, this)
    this.input.keyboard.on('keydown-ENTER', this.returnToMainScene, this)
    this.input.keyboard.on('keydown-SPACE', this.selectItem, this)
    this.input.keyboard.on('keydown-SHIFT', this.drinkPotion, this)
  }

  createGraphics() {
    // this.children.each(child => child.destroy())
    this.ingredientTexts.forEach(text => text.text.destroy())
    this.cauldronTexts.forEach(text => text.text.destroy())
    this.recipeTexts.forEach(text => text.text.destroy())
    this.essenceText?.destroy()
    this.selectionFrame?.destroy()

    this.createMaterialList()
    this.createRecipeList()
    this.createCauldron()

    this.selectionFrame = this.add.rectangle(0, 0, 0, 0, 0xffffff, 0.5).setVisible(false)
    this.updateSelectionFrame()
  }

  createMaterialList() {
    this.add.text(100, this.cameras.main.centerY - 140, 'Materials', FONT_HEADING)

    this.ingredientTexts = []
    let y = this.cameras.main.centerY - 100
    Object.keys(this.nest.ingredients).forEach(ingredient => {
      const count = this.nest.ingredients[ingredient as Ingredient] ?? 0
      const enabled = count >= 0
      const text = this.add.text(100, y, `${ingredient}: ${count}`, FONT_ITEM(enabled))
      this.ingredientTexts.push({ text, ingredient: ingredient as Ingredient })
      y += 30
    })

    // Add essence counter below material items
    y += 20 // Add some space before the essence counter
    this.essenceText = this.add.text(100, y, `Essence: ${this.nest.essence}`, FONT_ITEM(true))
  }

  createRecipeList() {
    this.add.text(this.cameras.main.width - 300, this.cameras.main.centerY - 140, 'Recipes', FONT_HEADING)

    this.recipeTexts = []
    let y = this.cameras.main.centerY - 100
    const recipes = getRecipes()
    recipes.forEach(recipe => {
      const enabled = this.canAffordRecipe(recipe)
      console.log('The recipe is', recipe, 'and it is', enabled ? 'available' : 'unavailable')
      const text = this.add.text(this.cameras.main.width - 300, y, recipe.name.toString(), FONT_ITEM(enabled))
      this.recipeTexts.push({ text, recipe })
      y += 30
    })
  }

  createCauldron() {
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
    let text!: Phaser.GameObjects.Text
    this.selectionFrame.setVisible(false)

    switch (this.currentSection) {
      case 'materials':
        if (this.ingredientTexts[this.currentSelectionIndex]) {
          text = this.ingredientTexts[this.currentSelectionIndex].text
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
          this.updateCauldronText() // Update the cauldron with recipe preview
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
    for (let i = 0; i < this.sections.length; i++) {
      this.currentSection = this.sections[(this.sections.indexOf(this.currentSection) + 1) % this.sections.length]
      if (this.hasEnabledItemsInCurrentSection()) {
        this.currentSelectionIndex = 0
        this.updateSelectionFrame()
        this.updateCauldronText() // Clear preview or update based on new section
        return
      }
    }
    this.selectionFrame.setVisible(false) // Hide if no enabled items found
  }

  previousSection() {
    for (let i = 0; i < this.sections.length; i++) {
      this.currentSection =
        this.sections[(this.sections.indexOf(this.currentSection) - 1 + this.sections.length) % this.sections.length]
      if (this.hasEnabledItemsInCurrentSection()) {
        this.currentSelectionIndex = 0
        this.updateSelectionFrame()
        this.updateCauldronText() // Clear preview or update based on new section
        return
      }
    }
    this.selectionFrame.setVisible(false) // Hide if no enabled items found
  }

  hasEnabledItemsInCurrentSection(): boolean {
    switch (this.currentSection) {
      case 'materials':
        return this.ingredientTexts.some(text => !this.isItemDisabled(text))
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
    switch (this.currentSection) {
      case 'materials':
        this.currentSelectionIndex = (this.currentSelectionIndex + 1) % this.ingredientTexts.length
        break
      case 'cauldron':
        this.currentSelectionIndex = (this.currentSelectionIndex + 1) % 3
        break
      case 'recipes':
        this.currentSelectionIndex = (this.currentSelectionIndex + 1) % this.recipeTexts.length
        break
    }
    this.updateSelectionFrame()
  }

  previousItem() {
    switch (this.currentSection) {
      case 'materials':
        this.currentSelectionIndex =
          (this.currentSelectionIndex - 1 + this.ingredientTexts.length) % this.ingredientTexts.length
        break
      case 'cauldron':
        this.currentSelectionIndex = (this.currentSelectionIndex - 1 + 3) % 3
        break
      case 'recipes':
        this.currentSelectionIndex =
          (this.currentSelectionIndex - 1 + this.recipeTexts.length) % this.recipeTexts.length
        break
    }
    this.updateSelectionFrame()
  }

  isItemDisabled(item: { text: Phaser.GameObjects.Text }): boolean {
    return item.text.style.color === getTextColor(false)
  }

  selectItem() {
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
        this.selectRecipeIngredients()
        break
    }
  }

  addMaterialToCauldron() {
    const ingredient = this.ingredientTexts[this.currentSelectionIndex].ingredient
    if (this.selectedIngredients.length < 2 && (this.nest.ingredients[ingredient] ?? 0) >= 1) {
      this.selectedIngredients.push(ingredient)
      this.updateCauldronText()
      this.updateSelectionFrame()
    }
  }

  removeMaterialFromCauldron(index: number) {
    if (this.selectedIngredients.length > index) {
      this.selectedIngredients.splice(index, 1)
      this.updateCauldronText()
      this.updateSelectionFrame()
    }
  }

  updateCauldronText() {
    const isPreview = this.currentSection === 'recipes' && this.recipeTexts[this.currentSelectionIndex]
    const recipe = isPreview ? this.recipeTexts[this.currentSelectionIndex].recipe : null

    for (let i = 0; i < 2; i++) {
      if (isPreview && recipe?.ingredientCosts[i]) {
        // Preview ingredients in grey
        this.cauldronTexts[i].text.setText(recipe.ingredientCosts[i].ingredient)
        this.cauldronTexts[i].text.setFill(getTextColor(false)) // Grey color for preview
      } else if (this.selectedIngredients[i]) {
        // Actual selected ingredients in white
        this.cauldronTexts[i].text.setText(this.selectedIngredients[i].toString())
        this.cauldronTexts[i].text.setFill(getTextColor(true)) // White color for selected
      } else {
        this.cauldronTexts[i].text.setText('Empty')
        this.cauldronTexts[i].text.setFill(getTextColor(false))
      }
    }

    const enabled = this.selectedIngredients.length === 2
    this.brewButton.setFill(getTextColor(enabled))
  }

  selectRecipeIngredients() {
    const recipe = this.recipeTexts[this.currentSelectionIndex].recipe
    if (this.canAffordRecipe(recipe)) {
      this.selectedIngredients = recipe.ingredientCosts.map(m => m.ingredient as Ingredient)
      this.updateCauldronText()
      this.updateSelectionFrame()
    }
  }

  canAffordRecipe(recipe: Potion): boolean {
    return this.nest.essence >= recipe.essenceCost && this.hasIngredientsForRecipe(recipe)
  }

  hasIngredientsForRecipe(recipe: Potion): boolean {
    return recipe.ingredientCosts.every(ingredientCost => {
      return this.nest.ingredients[ingredientCost.ingredient] ?? 0 >= ingredientCost.cost
    })
  }

  brew() {
    if (this.selectedIngredients.length === 2) {
      const matchingRecipe = getRecipes().find(
        recipe =>
          this.hasIngredientsForRecipe(recipe) &&
          recipe.ingredientCosts.every(ingredientCost => this.selectedIngredients.includes(ingredientCost.ingredient))
      )

      if (matchingRecipe && this.nest.essence >= matchingRecipe.essenceCost) {
        this.nest.essence -= matchingRecipe.essenceCost

        if (Math.random() < config.BREWING_FAILURE_RATE) {
          ;(this.scene.get('MainScene') as MainScene).addShadowblight()
          this.showBrewSnackbar('Brewing failed! Shadowblight has been summoned!')
        } else {
          this.nest.ingredients[matchingRecipe.name] = (this.nest.ingredients[matchingRecipe.name] ?? 0) + 1
          this.showBrewSnackbar(`Successfully brewed a ${matchingRecipe.name} potion!`, '#00FF00')
        }

        matchingRecipe.ingredientCosts.forEach(material => {
          this.nest.ingredients[material.ingredient] ??= 0
          this.nest.ingredients[material.ingredient]! -= material.cost
        })

        this.selectedIngredients = []
      } else {
        this.showBrewSnackbar('Not enough essence or materials for brewing.', '#FFA500')
      }
      this.createGraphics()
    } else {
      console.log('Not enough materials selected.')
    }
  }

  drinkPotion() {
    const ingredient = this.ingredientTexts[this.currentSelectionIndex].ingredient
    if (this.nest.ingredients?.[ingredient] ?? 0 >= 1) {
      if ((POTION_TYPES as readonly string[]).includes(ingredient)) {
        this.nest.ingredients[ingredient] = (this.nest.ingredients[ingredient] ?? 0) - 1
        const potion = getRecipes().find(p => p.name === ingredient)
        potion?.effect.apply(this.raven)
        this.updateSelectionFrame()

        this.showDrinkSnackbar(`You drank a ${potion?.name} potion!`)
      }
    }
  }

  // Inside the LabScene class

  /**
   * Displays a snackbar notification with the given text, style, and position.
   * @param message The text message to display.
   * @param style The styling options for the text.
   * @param position The position object containing x and y coordinates.
   * @param duration The duration (in milliseconds) before the snackbar fades out. Default is 3000ms.
   */
  private showSnackbar(
    message: string,
    style: Phaser.Types.GameObjects.Text.TextStyle,
    position: { x: number; y: number },
    duration: number = 3000
  ) {
    const snackbarText = new Phaser.GameObjects.Text(
      this,
      this.cameras.main.centerX + position.x,
      this.cameras.main.centerY + position.y,
      message,
      style
    )
    snackbarText.setOrigin(0.5) // Center the text
    snackbarText.depth = 1 // Ensure the text is above everything else
    this.add.existing(snackbarText)

    // Fade out the text after the specified duration
    this.time.delayedCall(duration, () => {
      this.tweens.add({
        targets: snackbarText,
        alpha: { from: 1, to: 0 },
        duration: 1000,
        ease: 'Linear',
        onComplete: () => {
          snackbarText.destroy()
        }
      })
    })
  }

  private showBrewSnackbar(message: string, color = '#FF4C4C') {
    this.showSnackbar(
      message,
      {
        fontSize: '16px',
        color,
        fontStyle: 'bold',
        backgroundColor: '#000000'
      },
      { x: 0, y: 250 }
    )
  }

  private showDrinkSnackbar(message: string, color = '#ABCDEF') {
    this.showSnackbar(
      message,
      {
        fontSize: '16px',
        color,
        fontStyle: 'bold',
        backgroundColor: '#000000'
      },
      { x: 0, y: -250 }
    )
  }

  getAvailableIngredientAmount(ingredient: Ingredient): number {
    return this.nest.ingredients[ingredient] ?? 0
  }

  returnToMainScene() {
    this.scene.stop()
    this.scene.resume('MainScene')
  }
}
