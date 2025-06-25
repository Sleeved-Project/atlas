import vine from '@vinejs/vine'

export const getResourceFiltersCardsValidator = vine.compile(
  vine.object({
    types: vine.array(vine.enum(['rarity', 'subtype', 'artist'])).optional(),
  })
)
