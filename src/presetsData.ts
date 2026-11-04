import { QuestPreset } from './types';

export const DEFAULT_PRESETS: QuestPreset[] = [
  {
    id: 'hsr',
    name: 'Honkai: Star Rail',
    executable: 'StarRail.exe',
    windowTitle: 'Honkai: Star Rail',
    category: 'game',
    description: 'Один из самых регулярных квестов Discord. Дает звёздный нефрит и орбсы.',
    rewardHint: '30 Звёздного Нефрита + Discord Orbs',
    discordAppId: '1131846467000000000',
    accentColor: '#f59e0b', // Amber / Gold
  },
  {
    id: 'roblox',
    name: 'Roblox',
    executable: 'RobloxPlayerBeta.exe',
    windowTitle: 'Roblox',
    category: 'game',
    description: 'Эмуляция клиента Roblox для квестов на эксклюзивные предметы и орбсы.',
    rewardHint: 'Виртуальный предмет + 100 Orbs',
    discordAppId: '768564039300000000',
    accentColor: '#ef4444', // Red
  },
  {
    id: 'firefox',
    name: 'Mozilla Firefox',
    executable: 'firefox.exe, firefox-bin.exe',
    windowTitle: 'Mozilla Firefox',
    category: 'browser',
    description: 'Квесты на использование браузера Firefox. Запускает оба алиаса одновременно.',
    rewardHint: 'Партнёрские награды и декор профиля',
    accentColor: '#f97316', // Orange
  },
  {
    id: 'genshin',
    name: 'Genshin Impact',
    executable: 'GenshinImpact.exe',
    windowTitle: 'Genshin Impact',
    category: 'game',
    description: 'Регулярные квесты на Примогемы и рамку аватара в Discord.',
    rewardHint: '30 Камней Истока + декор профиля',
    discordAppId: '1131846467000000001',
    accentColor: '#38bdf8', // Cyan
  },
  {
    id: 'zzz',
    name: 'Zenless Zone Zero',
    executable: 'ZenlessZoneZero.exe',
    windowTitle: 'Zenless Zone Zero',
    category: 'game',
    description: 'Квест на полихромы и рамку профиля.',
    rewardHint: '60 Полихромов + Orbs',
    discordAppId: '1249713837910000000',
    accentColor: '#84cc16', // Lime
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    executable: 'FortniteClient-Win64-Shipping.exe',
    windowTitle: 'Fortnite',
    category: 'game',
    description: 'Сезонные квесты на обертки, кирки и боевой опыт.',
    rewardHint: 'Эксклюзивная обертка / Декор',
    discordAppId: '432980957394370572',
    accentColor: '#a855f7', // Purple
  },
  {
    id: 'opera-gx',
    name: 'Opera GX',
    executable: 'opera.exe',
    windowTitle: 'Opera GX',
    category: 'browser',
    description: 'Квесты на Discord Nitro и аватарки за использование браузера.',
    rewardHint: 'Месяц Discord Nitro / Декор профиля',
    discordAppId: '809794017000000000',
    accentColor: '#f43f5e', // Rose
  },
  {
    id: 'marvel-rivals',
    name: 'Marvel Rivals',
    executable: 'MarvelRivals.exe',
    windowTitle: 'Marvel Rivals',
    category: 'game',
    description: 'Квесты на спреи и титулы за стрим.',
    rewardHint: 'Титул + Внутриигровой спрей',
    discordAppId: '1238473917800000000',
    accentColor: '#3b82f6', // Blue
  },
  {
    id: 'once-human',
    name: 'Once Human',
    executable: 'ONCE_HUMAN.exe',
    windowTitle: 'Once Human',
    category: 'game',
    description: 'Квест на ящики с припасами и Discord-значок.',
    rewardHint: 'Ящик бабочки + Очки Orbs',
    discordAppId: '1223948571900000000',
    accentColor: '#10b981', // Emerald
  },
  {
    id: 'warframe',
    name: 'Warframe',
    executable: 'Warframe.x64.exe',
    windowTitle: 'Warframe',
    category: 'game',
    description: 'Квесты на 3-дневный бустер синтеза и кредитов.',
    rewardHint: 'Бустер ресурсов + 100 Orbs',
    discordAppId: '378619623000000000',
    accentColor: '#14b8a6', // Teal
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    executable: 'chrome.exe',
    windowTitle: 'Google Chrome',
    category: 'browser',
    description: 'Эмуляция браузера для партнерских веб-квестов.',
    rewardHint: 'Discord Orbs за партнерские задания',
    discordAppId: '1000000000000000001',
    accentColor: '#eab308', // Yellow
  },
  {
    id: 'wot',
    name: 'World of Tanks',
    executable: 'WorldOfTanks.exe',
    windowTitle: 'World of Tanks',
    category: 'game',
    description: 'Квесты Wargaming на день премиума и кредиты.',
    rewardHint: '1 день премиума + 250 000 серебра',
    discordAppId: '432980957394370573',
    accentColor: '#f97316', // Orange
  },
  {
    id: 'dbd',
    name: 'Dead by Daylight',
    executable: 'DeadByDaylight-Win64-Shipping.exe',
    windowTitle: 'Dead by Daylight',
    category: 'game',
    description: 'Квесты на эксклюзивные амулеты и кастомный значок.',
    rewardHint: 'Кровавые очки + Амулет',
    discordAppId: '369680370000000000',
    accentColor: '#dc2626', // Crimson
  },
  {
    id: 'spotify',
    name: 'Spotify',
    executable: 'Spotify.exe',
    windowTitle: 'Spotify Free',
    category: 'app',
    description: 'Квесты на прослушивание музыки или подкастов.',
    rewardHint: 'Промо-подписка + Декор',
    discordAppId: '1000000000000000002',
    accentColor: '#22c55e', // Green
  },
];
