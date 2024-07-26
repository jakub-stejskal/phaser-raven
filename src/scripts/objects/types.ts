export const MATERIALS = ['Mystic Crystals', 'Precious Metals', 'Ancient Scrolls', 'Herbal Extracts']

export type Material = (typeof MATERIALS)[number]

export type UpgradeType = 'Speed' | 'Capacity' | 'Defense' | 'Stamina' | 'Reach'

export type NpcType =  {
    type : string,
    height : number,
    width : number,
    velocity : number,
    sprite : string
}

export const childNpc : NpcType = { 'type' : 'Child', 'height' : 80, 'width' : 40, 'velocity' : 60, 'sprite' : 'childNpc'}
export const fatNpc : NpcType = {'type' : 'Fat', 'height' : 120, 'width' : 100, 'velocity' : 40, 'sprite' : 'raven-walking'}
export const skinnyNpc : NpcType = {'type' : 'Skinny', height : 140, 'width' : 60, 'velocity' : 80, 'sprite' : 'raven-flying'}
