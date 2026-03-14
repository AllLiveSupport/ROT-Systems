import { useEffect, useMemo, useRef, useState } from 'react'
import { GeminiAPI } from '../lib/gemini'
import { cn } from '../lib/utils'
import { PRESET_MODELS, useGeminiStore } from '../store/geminiStore'

type TranslationLang = 'tr' | 'en' | 'es' | 'ru'

type City = {
  name: string
  region: string
  country: string
  size: 1 | 2 | 3 | 4
  weight: string
  flavor: string
  lang: string
}

type ChatMessage = {
  id: string
  sender: 'user' | 'bot'
  text: string
}

type ModuleMode =
  | 'analyze'
  | 'voice'
  | 'character'
  | 'visual'
  | 'dream'
  | 'fashion'
  | 'history'
  | 'menu'
  | 'language'
  | 'legend'
  | 'music'
  | 'ritual'
  | 'news'
  | 'excuse'
  | 'startup'
  | 'global_report'
  | 'recommend'
  | 'tech'
  | 'haiku'
  | 'fortune'
  | 'encounter'
  | 'item'
  | 'quest'
  | 'secret'
  | 'graffiti'
  | 'film'
  | 'scent'
  | 'job'
  | 'totem'
  | 'gift'
  | 'architecture'
  | 'cocktail'
  | 'law'
  | 'faction'
  | 'pet'
  | 'glitch'
  | 'trivia'
  | 'book'
  | 'slogan'
  | 'color'
  | 'horror'
  | 'riddle'
  | 'philosophy'
  | 'ambience'
  | 'market'
  | 'weather'
  | 'tarot'
  | 'crime'
  | 'alias'
  | 'relic'
  | 'ad'
  | 'bio'
  | 'cult'
  | 'emoji'
  | 'visa'
  | 'socket'
  | 'tip'
  | 'water'
  | 'sos'
  | 'data'
  | 'budget'
  | 'taboo'
  | 'pack'
  | 'festival'
  | 'kids'
  | 'date'
  | 'work'
  | 'walk'
  | 'hack'
  | 'night'
  | 'friend'
  | 'quiet'
  | 'breakfast'
  | 'dessert'
  | 'bazaar'
  | 'library'
  | 'view'
  | 'escape'
  | 'workout'
  | 'podcast'
  | 'app'
  | 'challenge'
  | 'zen'
  | 'playlist'
  | 'aura'
  | 'karma'
  | 'element'
  | 'chakra'
  | 'spirit'
  | 'omen'
  | 'coffee'
  | 'tea'
  | 'vintage'
  | 'vinyl'
  | 'wifi'
  | 'pharmacy'
  | 'hospital'
  | 'police'
  | 'embassy'
  | 'student'
  | 'vegan'
  | 'yoga'
  | 'gym'
  | 'park'
  | 'cat'
  | 'dog'
  | 'plot'
  | 'hero'
  | 'villain'
  | 'dialog'
  | 'genre'
  | 'twist'
  | 'parallel'
  | 'pastlife'
  | 'zodiac'
  | 'prophecy'
  | 'dream_meaning'
  | 'talisman'
  | 'scan'
  | 'chat'

type ModuleDef = {
  mode: ModuleMode
  emoji: string
  key: string
  style: string
}

const cityData: City[] = [
  { name: 'İstanbul', region: 'Europe/Istanbul', country: 'TR', size: 1, weight: '900', flavor: 'istanbul', lang: 'tr' },
  { name: 'New York', region: 'America/New_York', country: 'US', size: 1, weight: '900', flavor: 'new_york', lang: 'en' },
  { name: 'Tokyo', region: 'Asia/Tokyo', country: 'JP', size: 1, weight: '900', flavor: 'tokyo', lang: 'ja' },
  { name: 'Londra', region: 'Europe/London', country: 'GB', size: 1, weight: '800', flavor: 'london', lang: 'en' },
  { name: 'Paris', region: 'Europe/Paris', country: 'FR', size: 1, weight: '800', flavor: 'paris', lang: 'fr' },
  { name: 'Pekin', region: 'Asia/Shanghai', country: 'CN', size: 1, weight: '800', flavor: 'beijing', lang: 'zh' },
  { name: 'Moskova', region: 'Europe/Moscow', country: 'RU', size: 2, weight: '700', flavor: 'moscow', lang: 'ru' },
  { name: 'Los Angeles', region: 'America/Los_Angeles', country: 'US', size: 2, weight: '700', flavor: 'la', lang: 'en' },
  { name: 'Berlin', region: 'Europe/Berlin', country: 'DE', size: 2, weight: '600', flavor: 'berlin', lang: 'de' },
  { name: 'Dubai', region: 'Asia/Dubai', country: 'AE', size: 2, weight: '700', flavor: 'dubai', lang: 'ar' },
  { name: 'Roma', region: 'Europe/Rome', country: 'IT', size: 3, weight: '500', flavor: 'rome', lang: 'it' },
  { name: 'Sao Paulo', region: 'America/Sao_Paulo', country: 'BR', size: 2, weight: '700', flavor: 'sao_paulo', lang: 'pt' },
  { name: 'Seul', region: 'Asia/Seoul', country: 'KR', size: 3, weight: '600', flavor: 'seoul', lang: 'ko' },
  { name: 'Madrid', region: 'Europe/Madrid', country: 'ES', size: 3, weight: '500', flavor: 'madrid', lang: 'es' },
  { name: 'Sidney', region: 'Australia/Sydney', country: 'AU', size: 2, weight: '700', flavor: 'sydney', lang: 'en' },
  { name: 'Toronto', region: 'America/Toronto', country: 'CA', size: 3, weight: '500', flavor: 'toronto', lang: 'en' },
  { name: 'Amsterdam', region: 'Europe/Amsterdam', country: 'NL', size: 4, weight: '400', flavor: 'amsterdam', lang: 'nl' },
  { name: 'Singapur', region: 'Asia/Singapore', country: 'SG', size: 2, weight: '700', flavor: 'singapore', lang: 'en' },
  { name: 'Delhi', region: 'Asia/Kolkata', country: 'IN', size: 2, weight: '800', flavor: 'delhi', lang: 'hi' },
  { name: 'Kahire', region: 'Africa/Cairo', country: 'EG', size: 3, weight: '500', flavor: 'cairo', lang: 'ar' },
  { name: 'Bakü', region: 'Asia/Baku', country: 'AZ', size: 3, weight: '600', flavor: 'baku', lang: 'az' },
  { name: 'Atina', region: 'Europe/Athens', country: 'GR', size: 4, weight: '400', flavor: 'athens', lang: 'el' },
  { name: 'Kiev', region: 'Europe/Kiev', country: 'UA', size: 4, weight: '400', flavor: 'kiev', lang: 'uk' },
  { name: 'Meksiko', region: 'America/Mexico_City', country: 'MX', size: 2, weight: '800', flavor: 'mexico', lang: 'es' },
]

const supportedLanguages: Record<string, string> = {
  tr: 'Türkçe',
  en: 'English',
  es: 'Español',
  ru: 'Русский',
}

const modules: ModuleDef[] = [
  { mode: 'analyze', emoji: '✨', key: 'btn_analyze', style: 'bg-blue-600/10 hover:bg-blue-600/30 border-blue-500/30 text-blue-300' },
  { mode: 'voice', emoji: '🗣️', key: 'btn_voice', style: 'bg-emerald-600/10 hover:bg-emerald-600/30 border-emerald-500/30 text-emerald-300' },
  { mode: 'character', emoji: '👤', key: 'btn_character', style: 'bg-yellow-600/10 hover:bg-yellow-600/30 border-yellow-500/30 text-yellow-300' },
  { mode: 'visual', emoji: '📸', key: 'btn_visual', style: 'bg-fuchsia-600/10 hover:bg-fuchsia-600/30 border-fuchsia-500/30 text-fuchsia-300' },
  { mode: 'dream', emoji: '🌌', key: 'btn_dream', style: 'bg-indigo-600/10 hover:bg-indigo-600/30 border-indigo-500/30 text-indigo-300' },
  { mode: 'fashion', emoji: '👗', key: 'btn_fashion', style: 'bg-purple-600/10 hover:bg-purple-600/30 border-purple-500/30 text-purple-300' },

  { mode: 'history', emoji: '🏛️', key: 'btn_history', style: 'bg-amber-600/10 hover:bg-amber-600/30 border-amber-500/30 text-amber-300' },
  { mode: 'menu', emoji: '🍽️', key: 'btn_menu', style: 'bg-rose-600/10 hover:bg-rose-600/30 border-rose-500/30 text-rose-300' },
  { mode: 'language', emoji: '💬', key: 'btn_lang', style: 'bg-orange-600/10 hover:bg-orange-600/30 border-orange-500/30 text-orange-300' },
  { mode: 'legend', emoji: '📜', key: 'btn_legend', style: 'bg-violet-600/10 hover:bg-violet-600/30 border-violet-500/30 text-violet-300' },
  { mode: 'music', emoji: '🎵', key: 'btn_music', style: 'bg-sky-600/10 hover:bg-sky-600/30 border-sky-500/30 text-sky-300' },
  { mode: 'ritual', emoji: '☕', key: 'btn_ritual', style: 'bg-stone-600/10 hover:bg-stone-600/30 border-stone-500/30 text-stone-300' },

  { mode: 'news', emoji: '📰', key: 'btn_news', style: 'bg-red-600/10 hover:bg-red-600/30 border-red-500/30 text-red-300' },
  { mode: 'excuse', emoji: '🚧', key: 'btn_excuse', style: 'bg-teal-600/10 hover:bg-teal-600/30 border-teal-500/30 text-teal-300' },
  { mode: 'startup', emoji: '💡', key: 'btn_startup', style: 'bg-lime-600/10 hover:bg-lime-600/30 border-lime-500/30 text-lime-300' },
  { mode: 'global_report', emoji: '🌍', key: 'btn_summary', style: 'bg-cyan-600/10 hover:bg-cyan-600/30 border-cyan-500/30 text-cyan-300' },
  { mode: 'recommend', emoji: '📍', key: 'btn_route', style: 'bg-gray-600/10 hover:bg-gray-600/30 border-gray-500/30 text-gray-300' },
  { mode: 'tech', emoji: '🚇', key: 'btn_tech', style: 'bg-zinc-600/10 hover:bg-zinc-600/30 border-zinc-500/30 text-zinc-300' },

  { mode: 'haiku', emoji: '✒️', key: 'btn_haiku', style: 'bg-purple-600/10 hover:bg-purple-600/30 border-purple-500/30 text-purple-300' },
  { mode: 'fortune', emoji: '🔮', key: 'btn_fortune', style: 'bg-slate-600/10 hover:bg-slate-600/30 border-slate-500/30 text-slate-300' },
  { mode: 'encounter', emoji: '👁️', key: 'btn_encounter', style: 'bg-pink-600/10 hover:bg-pink-600/30 border-pink-500/30 text-pink-300' },
  { mode: 'item', emoji: '🛍️', key: 'btn_item', style: 'bg-green-600/10 hover:bg-green-600/30 border-green-500/30 text-green-300' },
  { mode: 'quest', emoji: '🎯', key: 'btn_quest', style: 'bg-orange-600/10 hover:bg-orange-600/30 border-orange-500/30 text-orange-300' },
  { mode: 'secret', emoji: '🤫', key: 'btn_secret', style: 'bg-red-800/20 hover:bg-red-800/40 border-red-500/50 text-red-400' },

  { mode: 'graffiti', emoji: '🎨', key: 'btn_graffiti', style: 'bg-yellow-800/20 hover:bg-yellow-800/40 border-yellow-500/30 text-yellow-400' },
  { mode: 'film', emoji: '🎬', key: 'btn_film', style: 'bg-blue-800/20 hover:bg-blue-800/40 border-blue-500/30 text-blue-300' },
  { mode: 'scent', emoji: '👃', key: 'btn_scent', style: 'bg-emerald-800/20 hover:bg-emerald-800/40 border-emerald-500/30 text-emerald-300' },
  { mode: 'job', emoji: '👔', key: 'btn_job', style: 'bg-indigo-800/20 hover:bg-indigo-800/40 border-indigo-500/30 text-indigo-300' },
  { mode: 'totem', emoji: '🕊️', key: 'btn_totem', style: 'bg-orange-800/20 hover:bg-orange-800/40 border-orange-500/30 text-orange-300' },
  { mode: 'gift', emoji: '🎁', key: 'btn_gift', style: 'bg-pink-800/20 hover:bg-pink-800/40 border-pink-500/30 text-pink-300' },

  { mode: 'architecture', emoji: '🏙️', key: 'btn_arch', style: 'bg-slate-500/20 hover:bg-slate-500/40 border-slate-400/30 text-slate-200' },
  { mode: 'cocktail', emoji: '☕', key: 'btn_drink', style: 'bg-rose-500/20 hover:bg-rose-500/40 border-rose-400/30 text-rose-200' },
  { mode: 'law', emoji: '👮', key: 'btn_law', style: 'bg-red-900/40 hover:bg-red-900/60 border-red-500/30 text-red-200' },
  { mode: 'faction', emoji: '⚽', key: 'btn_faction', style: 'bg-neutral-600/20 hover:bg-neutral-600/40 border-neutral-400/30 text-neutral-300' },
  { mode: 'pet', emoji: '🐕', key: 'btn_pet', style: 'bg-lime-800/20 hover:bg-lime-800/40 border-lime-500/30 text-lime-300' },
  { mode: 'glitch', emoji: '⚠️', key: 'btn_glitch', style: 'bg-white/10 hover:bg-white/20 border-white/50 text-white' },

  { mode: 'trivia', emoji: '❓', key: 'btn_trivia', style: 'bg-amber-500/20 hover:bg-amber-500/40 border-amber-400/30 text-amber-200' },
  { mode: 'book', emoji: '📚', key: 'btn_book', style: 'bg-sky-800/20 hover:bg-sky-800/40 border-sky-500/30 text-sky-300' },
  { mode: 'slogan', emoji: '📣', key: 'btn_slogan', style: 'bg-orange-500/20 hover:bg-orange-500/40 border-orange-400/30 text-orange-200' },
  { mode: 'color', emoji: '🎨', key: 'btn_color', style: 'bg-pink-500/20 hover:bg-pink-500/40 border-pink-400/30 text-pink-200' },
  { mode: 'horror', emoji: '👻', key: 'btn_horror', style: 'bg-red-950/40 hover:bg-red-900/60 border-red-700/50 text-red-500' },
  { mode: 'riddle', emoji: '🧩', key: 'btn_riddle', style: 'bg-violet-800/20 hover:bg-violet-800/40 border-violet-500/30 text-violet-300' },

  { mode: 'philosophy', emoji: '🦉', key: 'btn_philosophy', style: 'bg-gray-500/20 hover:bg-gray-500/40 border-gray-400/30 text-gray-200' },
  { mode: 'ambience', emoji: '🔊', key: 'btn_ambience', style: 'bg-cyan-800/20 hover:bg-cyan-800/40 border-cyan-500/30 text-cyan-300' },
  { mode: 'market', emoji: '💵', key: 'btn_market', style: 'bg-green-900/40 hover:bg-green-900/60 border-green-500/30 text-green-400' },
  { mode: 'weather', emoji: '🌦️', key: 'btn_weather', style: 'bg-blue-300/10 hover:bg-blue-300/20 border-blue-200/30 text-blue-100' },
  { mode: 'tarot', emoji: '🃏', key: 'btn_tarot', style: 'bg-purple-900/40 hover:bg-purple-900/60 border-purple-500/50 text-purple-200' },
  { mode: 'crime', emoji: '🚓', key: 'btn_crime', style: 'bg-red-600/30 hover:bg-red-600/50 border-red-500/50 text-white' },

  { mode: 'alias', emoji: '🆔', key: 'btn_alias', style: 'bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/30 text-blue-200' },
  { mode: 'relic', emoji: '🏺', key: 'btn_relic', style: 'bg-amber-700/20 hover:bg-amber-700/40 border-amber-600/30 text-amber-300' },
  { mode: 'ad', emoji: '📺', key: 'btn_ad', style: 'bg-pink-500/20 hover:bg-pink-500/40 border-pink-400/30 text-pink-200' },
  { mode: 'bio', emoji: '📈', key: 'btn_bio', style: 'bg-teal-500/20 hover:bg-teal-500/40 border-teal-400/30 text-teal-200' },
  { mode: 'cult', emoji: '🤝', key: 'btn_cult', style: 'bg-red-900/40 hover:bg-red-900/60 border-red-700/50 text-red-300' },
  { mode: 'emoji', emoji: '😀', key: 'btn_emoji', style: 'bg-yellow-400/20 hover:bg-yellow-400/40 border-yellow-300/30 text-yellow-100' },

  { mode: 'visa', emoji: '🛂', key: 'btn_visa', style: 'bg-zinc-700/20 hover:bg-zinc-700/40 border-zinc-600/30 text-zinc-300' },
  { mode: 'socket', emoji: '🔌', key: 'btn_socket', style: 'bg-cyan-700/20 hover:bg-cyan-700/40 border-cyan-600/30 text-cyan-300' },
  { mode: 'tip', emoji: '💰', key: 'btn_tip', style: 'bg-emerald-700/20 hover:bg-emerald-700/40 border-emerald-600/30 text-emerald-300' },
  { mode: 'water', emoji: '💧', key: 'btn_water', style: 'bg-blue-700/20 hover:bg-blue-700/40 border-blue-600/30 text-blue-300' },
  { mode: 'sos', emoji: '🆘', key: 'btn_sos', style: 'bg-red-700/30 hover:bg-red-700/50 border-red-600/30 text-red-200' },
  { mode: 'data', emoji: '📶', key: 'btn_data', style: 'bg-purple-700/20 hover:bg-purple-700/40 border-purple-600/30 text-purple-300' },

  { mode: 'budget', emoji: '💵', key: 'btn_budget', style: 'bg-lime-700/20 hover:bg-lime-700/40 border-lime-600/30 text-lime-300' },
  { mode: 'taboo', emoji: '🚫', key: 'btn_taboo', style: 'bg-red-900/30 hover:bg-red-900/50 border-red-700/40 text-red-300' },
  { mode: 'pack', emoji: '🎒', key: 'btn_pack', style: 'bg-indigo-700/20 hover:bg-indigo-700/40 border-indigo-600/30 text-indigo-300' },
  { mode: 'festival', emoji: '🎉', key: 'btn_festival', style: 'bg-yellow-600/20 hover:bg-yellow-600/40 border-yellow-500/30 text-yellow-300' },
  { mode: 'kids', emoji: '🧸', key: 'btn_kids', style: 'bg-blue-400/20 hover:bg-blue-400/40 border-blue-300/30 text-blue-200' },
  { mode: 'date', emoji: '❤️', key: 'btn_date', style: 'bg-rose-700/20 hover:bg-rose-700/40 border-rose-600/30 text-rose-300' },

  { mode: 'work', emoji: '💻', key: 'btn_work', style: 'bg-slate-600/20 hover:bg-slate-600/40 border-slate-500/30 text-slate-200' },
  { mode: 'walk', emoji: '🚶', key: 'btn_walk', style: 'bg-emerald-600/20 hover:bg-emerald-600/40 border-emerald-500/30 text-emerald-200' },
  { mode: 'hack', emoji: '🔓', key: 'btn_hack', style: 'bg-amber-500/20 hover:bg-amber-500/40 border-amber-400/30 text-amber-200' },
  { mode: 'night', emoji: '🌙', key: 'btn_night', style: 'bg-indigo-600/20 hover:bg-indigo-600/40 border-indigo-500/30 text-indigo-200' },
  { mode: 'friend', emoji: '🥂', key: 'btn_friend', style: 'bg-rose-500/20 hover:bg-rose-500/40 border-rose-400/30 text-rose-200' },
  { mode: 'quiet', emoji: '🧘', key: 'btn_quiet', style: 'bg-teal-600/20 hover:bg-teal-600/40 border-teal-500/30 text-teal-200' },

  { mode: 'breakfast', emoji: '🍳', key: 'btn_breakfast', style: 'bg-orange-400/20 hover:bg-orange-400/40 border-orange-300/30 text-orange-100' },
  { mode: 'dessert', emoji: '🍰', key: 'btn_dessert', style: 'bg-pink-400/20 hover:bg-pink-400/40 border-pink-300/30 text-pink-100' },
  { mode: 'bazaar', emoji: '🛒', key: 'btn_bazaar', style: 'bg-amber-600/20 hover:bg-amber-600/40 border-amber-500/30 text-amber-200' },
  { mode: 'library', emoji: '📚', key: 'btn_library', style: 'bg-slate-500/20 hover:bg-slate-500/40 border-slate-400/30 text-slate-300' },
  { mode: 'view', emoji: '🔭', key: 'btn_view', style: 'bg-sky-500/20 hover:bg-sky-500/40 border-sky-400/30 text-sky-200' },
  { mode: 'escape', emoji: '🌲', key: 'btn_escape', style: 'bg-teal-500/20 hover:bg-teal-500/40 border-teal-400/30 text-teal-100' },

  { mode: 'workout', emoji: '💪', key: 'btn_workout', style: 'bg-red-500/20 hover:bg-red-500/40 border-red-400/30 text-red-200' },
  { mode: 'podcast', emoji: '🎙️', key: 'btn_podcast', style: 'bg-violet-500/20 hover:bg-violet-500/40 border-violet-400/30 text-violet-200' },
  { mode: 'app', emoji: '📱', key: 'btn_app', style: 'bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/30 text-blue-100' },
  { mode: 'challenge', emoji: '🏆', key: 'btn_challenge', style: 'bg-orange-600/20 hover:bg-orange-600/40 border-orange-500/30 text-orange-200' },
  { mode: 'zen', emoji: '🧘‍♂️', key: 'btn_zen', style: 'bg-stone-500/20 hover:bg-stone-500/40 border-stone-400/30 text-stone-200' },
  { mode: 'playlist', emoji: '🎧', key: 'btn_playlist', style: 'bg-green-500/20 hover:bg-green-500/40 border-green-400/30 text-green-200' },

  { mode: 'aura', emoji: '✨', key: 'btn_aura', style: 'bg-fuchsia-400/20 hover:bg-fuchsia-400/40 border-fuchsia-300/30 text-fuchsia-100' },
  { mode: 'karma', emoji: '🌀', key: 'btn_karma', style: 'bg-indigo-400/20 hover:bg-indigo-400/40 border-indigo-300/30 text-indigo-100' },
  { mode: 'element', emoji: '🔥', key: 'btn_element', style: 'bg-amber-400/20 hover:bg-amber-400/40 border-amber-300/30 text-amber-100' },
  { mode: 'chakra', emoji: '☸️', key: 'btn_chakra', style: 'bg-rose-400/20 hover:bg-rose-400/40 border-rose-300/30 text-rose-100' },
  { mode: 'spirit', emoji: '👻', key: 'btn_spirit', style: 'bg-cyan-400/20 hover:bg-cyan-400/40 border-cyan-300/30 text-cyan-100' },
  { mode: 'omen', emoji: '👁️‍🗨️', key: 'btn_omen', style: 'bg-slate-400/20 hover:bg-slate-400/40 border-slate-300/30 text-slate-100' },

  { mode: 'coffee', emoji: '☕', key: 'btn_coffee', style: 'bg-amber-700/20 hover:bg-amber-700/40 border-amber-600/30 text-amber-100' },
  { mode: 'tea', emoji: '🍵', key: 'btn_tea', style: 'bg-red-700/20 hover:bg-red-700/40 border-red-600/30 text-red-100' },
  { mode: 'vintage', emoji: '🕰️', key: 'btn_vintage', style: 'bg-orange-700/20 hover:bg-orange-700/40 border-orange-600/30 text-orange-100' },
  { mode: 'vinyl', emoji: '💿', key: 'btn_vinyl', style: 'bg-gray-700/20 hover:bg-gray-700/40 border-gray-600/30 text-gray-300' },
  { mode: 'wifi', emoji: '📶', key: 'btn_wifi', style: 'bg-blue-400/20 hover:bg-blue-400/40 border-blue-300/30 text-blue-200' },
  { mode: 'pharmacy', emoji: '💊', key: 'btn_pharmacy', style: 'bg-red-500/20 hover:bg-red-500/40 border-red-400/30 text-red-200' },
  { mode: 'hospital', emoji: '🏥', key: 'btn_hospital', style: 'bg-red-600/20 hover:bg-red-600/40 border-red-500/30 text-red-100' },
  { mode: 'police', emoji: '👮', key: 'btn_police', style: 'bg-blue-800/20 hover:bg-blue-800/40 border-blue-600/30 text-blue-200' },
  { mode: 'embassy', emoji: '🏛️', key: 'btn_embassy', style: 'bg-slate-400/20 hover:bg-slate-400/40 border-slate-300/30 text-slate-200' },
  { mode: 'student', emoji: '🎒', key: 'btn_student', style: 'bg-yellow-500/20 hover:bg-yellow-500/40 border-yellow-400/30 text-yellow-200' },
  { mode: 'vegan', emoji: '🥗', key: 'btn_vegan', style: 'bg-green-400/20 hover:bg-green-400/40 border-green-300/30 text-green-200' },
  { mode: 'yoga', emoji: '🧘‍♀️', key: 'btn_yoga', style: 'bg-teal-400/20 hover:bg-teal-400/40 border-teal-300/30 text-teal-200' },
  { mode: 'gym', emoji: '🏋️', key: 'btn_gym', style: 'bg-gray-500/20 hover:bg-gray-500/40 border-gray-400/30 text-gray-200' },
  { mode: 'park', emoji: '🌳', key: 'btn_park', style: 'bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-400/30 text-emerald-100' },
  { mode: 'cat', emoji: '🐱', key: 'btn_cat', style: 'bg-orange-300/20 hover:bg-orange-300/40 border-orange-200/30 text-orange-200' },
  { mode: 'dog', emoji: '🐶', key: 'btn_dog', style: 'bg-amber-300/20 hover:bg-amber-300/40 border-amber-200/30 text-amber-200' },

  { mode: 'plot', emoji: '🎬', key: 'btn_plot', style: 'bg-indigo-900/40 hover:bg-indigo-900/60 border-indigo-700/50 text-indigo-100' },
  { mode: 'hero', emoji: '🦸', key: 'btn_hero', style: 'bg-yellow-600/30 hover:bg-yellow-600/50 border-yellow-500/50 text-yellow-100' },
  { mode: 'villain', emoji: '🦹', key: 'btn_villain', style: 'bg-red-950/60 hover:bg-red-950/80 border-red-800/50 text-red-500' },
  { mode: 'dialog', emoji: '💬', key: 'btn_dialog', style: 'bg-slate-500/30 hover:bg-slate-500/50 border-slate-400/30 text-slate-200' },
  { mode: 'genre', emoji: '🎭', key: 'btn_genre', style: 'bg-pink-700/30 hover:bg-pink-700/50 border-pink-600/30 text-pink-200' },
  { mode: 'twist', emoji: '🌀', key: 'btn_twist', style: 'bg-fuchsia-800/30 hover:bg-fuchsia-800/50 border-fuchsia-600/30 text-fuchsia-200' },

  { mode: 'parallel', emoji: '🌌', key: 'btn_parallel', style: 'bg-violet-900/40 hover:bg-violet-900/60 border-violet-700/50 text-violet-200' },
  { mode: 'pastlife', emoji: '🕰️', key: 'btn_pastlife', style: 'bg-amber-900/40 hover:bg-amber-900/60 border-amber-700/50 text-amber-200' },
  { mode: 'zodiac', emoji: '♋', key: 'btn_zodiac', style: 'bg-purple-800/40 hover:bg-purple-800/60 border-purple-600/50 text-purple-100' },
  { mode: 'prophecy', emoji: '📜', key: 'btn_prophecy', style: 'bg-cyan-900/40 hover:bg-cyan-900/60 border-cyan-700/50 text-cyan-200' },
  { mode: 'dream_meaning', emoji: '💤', key: 'btn_dream_meaning', style: 'bg-blue-900/40 hover:bg-blue-900/60 border-blue-700/50 text-blue-100' },
  { mode: 'talisman', emoji: '🧿', key: 'btn_talisman', style: 'bg-emerald-900/40 hover:bg-emerald-900/60 border-emerald-700/50 text-emerald-200' },
]

const translations: Record<TranslationLang, Record<string, string>> = {
  tr: {
    btn_analyze: 'ANALİZ',
    btn_voice: 'ŞİVE',
    btn_character: 'İNSAN',
    btn_visual: 'FOTO',
    btn_dream: 'VİZYON',
    btn_fashion: 'MODA',
    btn_history: 'TARİH',
    btn_menu: 'MENÜ',
    btn_lang: 'DİL',
    btn_legend: 'EFSANE',
    btn_music: 'MÜZİK',
    btn_ritual: 'ADET',
    btn_news: 'MANŞET',
    btn_excuse: 'TRAFİK',
    btn_startup: 'İŞ',
    btn_summary: 'DÜNYA',
    btn_route: 'GEZİ',
    btn_tech: 'ALTYAPI',
    btn_haiku: 'ŞİİR',
    btn_fortune: 'FAL',
    btn_encounter: 'GÖZLEM',
    btn_item: 'ALIŞVERİŞ',
    btn_quest: 'AKTİVİTE',
    btn_secret: 'BİLİNMEYEN',
    btn_graffiti: 'SANAT',
    btn_film: 'SİNEMA',
    btn_scent: 'KOKU',
    btn_job: 'MESLEK',
    btn_totem: 'SEMBOL',
    btn_gift: 'HEDİYELİK',
    btn_arch: 'MİMARİ',
    btn_drink: 'İÇECEK',
    btn_law: 'KURAL',
    btn_faction: 'TAKIM',
    btn_pet: 'CANLI',
    btn_glitch: 'SORUN',
    btn_trivia: 'BİLGİ',
    btn_book: 'KİTAP',
    btn_slogan: 'SLOGAN',
    btn_color: 'RENK',
    btn_horror: 'KORKU',
    btn_riddle: 'BİLMECE',
    btn_philosophy: 'FİKİR',
    btn_ambience: 'SESLER',
    btn_market: 'EKONOMİ',
    btn_weather: 'HAVA',
    btn_tarot: 'TAROT',
    btn_crime: 'GÜVENLİK',
    btn_alias: 'YEREL İSİM',
    btn_relic: 'ANTİKA',
    btn_ad: 'REKLAM',
    btn_bio: 'TREND',
    btn_cult: 'TOPLULUK',
    btn_emoji: 'EMOJI',
    btn_visa: 'VİZE',
    btn_socket: 'PRİZ',
    btn_tip: 'BAHŞİŞ',
    btn_water: 'SU',
    btn_sos: 'ACİL',
    btn_data: 'DATA',
    btn_budget: 'BÜTÇE',
    btn_taboo: 'YASAK',
    btn_pack: 'VALİZ',
    btn_festival: 'FESTİVAL',
    btn_kids: 'AİLE',
    btn_date: 'RANDEVU',
    btn_work: 'OFİS',
    btn_walk: 'YÜRÜYÜŞ',
    btn_hack: 'HİLE',
    btn_night: 'GECE',
    btn_friend: 'TANIŞ',
    btn_quiet: 'HUZUR',
    btn_breakfast: 'KAHVALTI',
    btn_dessert: 'TATLI',
    btn_bazaar: 'PAZAR',
    btn_library: 'KİTAPÇI',
    btn_view: 'MANZARA',
    btn_escape: 'KAÇIŞ',
    btn_workout: 'EGZERSİZ',
    btn_podcast: 'PODCAST',
    btn_app: 'UYGULAMA',
    btn_challenge: 'MEYDAN',
    btn_zen: 'ZEN',
    btn_playlist: 'LİSTE',
    btn_aura: 'AURA',
    btn_karma: 'KARMA',
    btn_element: 'ELEMENT',
    btn_chakra: 'ÇAKRA',
    btn_spirit: 'RUH',
    btn_omen: 'İŞARET',
    btn_coffee: 'KAHVE',
    btn_tea: 'ÇAY',
    btn_vintage: 'VINTAGE',
    btn_vinyl: 'PLAK',
    btn_wifi: 'WI-FI',
    btn_pharmacy: 'ECZANE',
    btn_hospital: 'HASTANE',
    btn_police: 'POLİS',
    btn_embassy: 'ELÇİLİK',
    btn_student: 'ÖĞRENCİ',
    btn_vegan: 'VEGAN',
    btn_yoga: 'YOGA',
    btn_gym: 'SPOR',
    btn_park: 'PARK',
    btn_cat: 'KEDİ',
    btn_dog: 'KÖPEK',
    btn_plot: 'SENARYO',
    btn_hero: 'KAHRAMAN',
    btn_villain: 'KÖTÜ',
    btn_dialog: 'DİYALOG',
    btn_genre: 'TÜR',
    btn_twist: 'SÜRPRİZ',
    btn_parallel: 'PARALEL',
    btn_pastlife: 'GEÇMİŞ',
    btn_zodiac: 'BURÇ',
    btn_prophecy: 'KEHANET',
    btn_dream_meaning: 'TABİR',
    btn_talisman: 'TILSIM',
    search_placeholder: "Şehir Taraması: 'Ucuz yemek olan yerler'...",
    btn_scan: 'ARA',
    btn_reset: 'SIFIRLA',
    ctl_copy: 'KOPYALA',
    ctl_fullscreen: 'TAM EKRAN',
    ctl_settings: 'AYARLAR',
    ctl_panel: 'AI PANEL',
    source_local: 'Yerel Veri Akışı',
    loading_text: 'Veri Çekiliyor...',
    chat_welcome: 'Merhaba. Ben Rot. Şehrin gerçek bir yerlisi gibi sana rehberlik edeceğim. Ne bilmek istersin?',
    chat_placeholder: 'Mesaj gönder...',
    lbl_settings_title: 'ROT AYARLAR',
    lbl_language: '🌐 DİL',
    lbl_persona: '🎭 KİMLİK',
    lbl_persona_ph: 'Örn: Yerel Esnaf, Tarihçi, Gurme...',
    lbl_api_key: '🔑 GEMINI API KEY',
    lbl_active: 'Aktif:',
    lbl_model: '🤖 AI MODEL',
    btn_custom: 'ÖZEL',
    btn_list: 'LİSTE',
    btn_saved: '✓ KAYDEDİLDİ',
    btn_save: '💾 KAYDET',
    lbl_footer: 'ROT SİSTEMLERİ • HİKAYE ANLATICISI GÜNCELLEMESİ',
    lbl_privacy: 'GİZLİLİK & ŞARTLAR',
    privacy_title: 'Gizlilik ve Şartlar',
    privacy_p1: 'ROT Sistemleri, kullanıcı gizliliğine mutlak saygı duyar:',
    privacy_p2: '1. Girdiğiniz Gemini API anahtarı sadece kendi tarayıcınızın yerel hafızasında (Local Storage) saklanır.',
    privacy_p3: '2. Veri veya konuşma geçmişiniz hiçbir sunucuya kaydedilmez. Tüm iletişim doğrudan açık kaynaklı kod üzerinden Google API\'si ile gerçekleşir.',
    privacy_p4: '3. Bu proje eğitim ve kişisel kullanım amaçlı, %100 açık kaynak kodludur.',
    privacy_p5: 'Açık kaynak destekçisi:',
    lbl_github: 'Geliştiriciyi Takip Et',
  },
  en: {
    btn_analyze: 'ANALYZE',
    btn_voice: 'SLANG',
    btn_character: 'PEOPLE',
    btn_visual: 'PHOTO',
    btn_dream: 'VISION',
    btn_fashion: 'FASHION',
    btn_history: 'HISTORY',
    btn_menu: 'MENU',
    btn_lang: 'LANGUAGE',
    btn_legend: 'LEGEND',
    btn_music: 'MUSIC',
    btn_ritual: 'CUSTOM',
    btn_news: 'NEWS',
    btn_excuse: 'TRAFFIC',
    btn_startup: 'BUSINESS',
    btn_summary: 'WORLD',
    btn_route: 'TRIP',
    btn_tech: 'INFRA',
    btn_haiku: 'POEM',
    btn_fortune: 'FORTUNE',
    btn_encounter: 'OBSERVE',
    btn_item: 'SHOPPING',
    btn_quest: 'ACTIVITY',
    btn_secret: 'SECRET',
    btn_graffiti: 'ART',
    btn_film: 'CINEMA',
    btn_scent: 'SCENT',
    btn_job: 'JOB',
    btn_totem: 'SYMBOL',
    btn_gift: 'SOUVENIR',
    btn_arch: 'ARCH',
    btn_drink: 'DRINK',
    btn_law: 'RULE',
    btn_faction: 'TEAM',
    btn_pet: 'ANIMAL',
    btn_glitch: 'ISSUE',
    btn_trivia: 'TRIVIA',
    btn_book: 'BOOK',
    btn_slogan: 'SLOGAN',
    btn_color: 'COLOR',
    btn_horror: 'HORROR',
    btn_riddle: 'RIDDLE',
    btn_philosophy: 'IDEA',
    btn_ambience: 'SOUNDS',
    btn_market: 'ECONOMY',
    btn_weather: 'WEATHER',
    btn_tarot: 'TAROT',
    btn_crime: 'SAFETY',
    btn_alias: 'LOCAL NAME',
    btn_relic: 'ANTIQUE',
    btn_ad: 'ADVERT',
    btn_bio: 'TREND',
    btn_cult: 'GROUP',
    btn_emoji: 'EMOJI',
    btn_visa: 'VISA',
    btn_socket: 'PLUG',
    btn_tip: 'TIPPING',
    btn_water: 'WATER',
    btn_sos: 'EMERGENCY',
    btn_data: 'DATA',
    btn_budget: 'BUDGET',
    btn_taboo: 'TABOO',
    btn_pack: 'PACKING',
    btn_festival: 'FESTIVAL',
    btn_kids: 'KIDS',
    btn_date: 'DATE',
    btn_work: 'WORK',
    btn_walk: 'WALK',
    btn_hack: 'HACK',
    btn_night: 'NIGHT',
    btn_friend: 'SOCIAL',
    btn_quiet: 'QUIET',
    btn_breakfast: 'BREAKFAST',
    btn_dessert: 'DESSERT',
    btn_bazaar: 'MARKET',
    btn_library: 'LIBRARY',
    btn_view: 'VIEW',
    btn_escape: 'ESCAPE',
    btn_workout: 'WORKOUT',
    btn_podcast: 'PODCAST',
    btn_app: 'APP',
    btn_challenge: 'CHALLENGE',
    btn_zen: 'ZEN',
    btn_playlist: 'PLAYLIST',
    btn_aura: 'AURA',
    btn_karma: 'KARMA',
    btn_element: 'ELEMENT',
    btn_chakra: 'CHAKRA',
    btn_spirit: 'SPIRIT',
    btn_omen: 'OMEN',
    btn_coffee: 'COFFEE',
    btn_tea: 'TEA',
    btn_vintage: 'VINTAGE',
    btn_vinyl: 'VINYL',
    btn_wifi: 'WI-FI',
    btn_pharmacy: 'PHARMACY',
    btn_hospital: 'HOSPITAL',
    btn_police: 'POLICE',
    btn_embassy: 'EMBASSY',
    btn_student: 'STUDENT',
    btn_vegan: 'VEGAN',
    btn_yoga: 'YOGA',
    btn_gym: 'GYM',
    btn_park: 'PARK',
    btn_cat: 'CAT',
    btn_dog: 'DOG',
    btn_plot: 'PLOT',
    btn_hero: 'HERO',
    btn_villain: 'VILLAIN',
    btn_dialog: 'DIALOG',
    btn_genre: 'GENRE',
    btn_twist: 'TWIST',
    btn_parallel: 'PARALLEL',
    btn_pastlife: 'PAST LIFE',
    btn_zodiac: 'ZODIAC',
    btn_prophecy: 'PROPHECY',
    btn_dream_meaning: 'DREAM',
    btn_talisman: 'TALISMAN',
    search_placeholder: "City Search: 'Places with cheap food'...",
    btn_scan: 'SEARCH',
    btn_reset: 'RESET',
    ctl_copy: 'COPY',
    ctl_fullscreen: 'FULLSCREEN',
    ctl_settings: 'SETTINGS',
    ctl_panel: 'AI PANEL',
    source_local: 'Local Data Stream',
    loading_text: 'Fetching Data...',
    chat_welcome: 'Hello. I am Rot. I will guide you like a true local. What do you want to know?',
    chat_placeholder: 'Send a message...',
    lbl_settings_title: 'ROT SETTINGS',
    lbl_language: '🌐 LANGUAGE',
    lbl_persona: '🎭 PERSONA',
    lbl_persona_ph: 'Ex: Historian, Foodie, Local...',
    lbl_api_key: '🔑 GEMINI API KEY',
    lbl_active: 'Active:',
    lbl_model: '🤖 AI MODEL',
    btn_custom: 'CUSTOM',
    btn_list: 'LIST',
    btn_saved: '✓ SAVED',
    btn_save: '💾 SAVE',
    lbl_footer: 'ROT SYSTEMS • STORYTELLER UPDATE',
    lbl_privacy: 'PRIVACY & TERMS',
    privacy_title: 'Privacy and Terms',
    privacy_p1: 'ROT Systems deeply respects user privacy:',
    privacy_p2: '1. Your Gemini API key safely stays only in your browser\'s local storage.',
    privacy_p3: '2. We have no backend. All prompts and AI interactions flow directly from your device to Google\'s API.',
    privacy_p4: '3. This is a 100% open-source project intended for educational and personal use.',
    privacy_p5: 'Open source software by:',
    lbl_github: 'Follow Developer',
  },
  es: {
    btn_analyze: 'ANÁLISIS',
    btn_voice: 'DIALECTO',
    btn_character: 'PERSONAS',
    btn_visual: 'FOTO',
    btn_dream: 'VISIÓN',
    btn_fashion: 'MODA',
    btn_history: 'HISTORIA',
    btn_menu: 'MENÚ',
    btn_lang: 'IDIOMA',
    btn_legend: 'LEYENDA',
    btn_music: 'MÚSICA',
    btn_ritual: 'COSTUMBRE',
    btn_news: 'NOTICIAS',
    btn_excuse: 'TRÁFICO',
    btn_startup: 'NEGOCIO',
    btn_summary: 'MUNDO',
    btn_route: 'VIAJE',
    btn_tech: 'INFRA',
    btn_haiku: 'POEMA',
    btn_fortune: 'FORTUNA',
    btn_encounter: 'OBSERVAR',
    btn_item: 'COMPRAS',
    btn_quest: 'ACTIVIDAD',
    btn_secret: 'SECRETO',
    btn_graffiti: 'ARTE',
    btn_film: 'CINE',
    btn_scent: 'AROMA',
    btn_job: 'TRABAJO',
    btn_totem: 'SÍMBOLO',
    btn_gift: 'REGALO',
    btn_arch: 'ARQT.',
    btn_drink: 'BEBIDA',
    btn_law: 'REGLA',
    btn_faction: 'EQUIPO',
    btn_pet: 'ANIMAL',
    btn_glitch: 'PROBLEMA',
    btn_trivia: 'TRIVIA',
    btn_book: 'LIBRO',
    btn_slogan: 'ESLOGAN',
    btn_color: 'COLOR',
    btn_horror: 'TERROR',
    btn_riddle: 'ACERTIJO',
    btn_philosophy: 'FILOSOFÍA',
    btn_ambience: 'SONIDOS',
    btn_market: 'ECONOMÍA',
    btn_weather: 'CLIMA',
    btn_tarot: 'TAROT',
    btn_crime: 'SEGURIDAD',
    btn_alias: 'NOMBRE',
    btn_relic: 'ANTIGÜEDAD',
    btn_ad: 'ANUNCIO',
    btn_bio: 'TENDENCIA',
    btn_cult: 'GRUPO',
    btn_emoji: 'EMOJI',
    btn_visa: 'VISA',
    btn_socket: 'ENCHUFE',
    btn_tip: 'PROPINA',
    btn_water: 'AGUA',
    btn_sos: 'EMERGENCIA',
    btn_data: 'DATOS',
    btn_budget: 'PRESUPUESTO',
    btn_taboo: 'TABÚ',
    btn_pack: 'MALETA',
    btn_festival: 'FESTIVAL',
    btn_kids: 'FAMILIA',
    btn_date: 'CITA',
    btn_work: 'TRABAJO',
    btn_walk: 'PASEO',
    btn_hack: 'TRUCO',
    btn_night: 'NOCHE',
    btn_friend: 'SOCIAL',
    btn_quiet: 'PAZ',
    btn_breakfast: 'DESAYUNO',
    btn_dessert: 'POSTRE',
    btn_bazaar: 'MERCADO',
    btn_library: 'LIBRERÍA',
    btn_view: 'VISTA',
    btn_escape: 'ESCAPADA',
    btn_workout: 'EJERCICIO',
    btn_podcast: 'PODCAST',
    btn_app: 'APP',
    btn_challenge: 'RETO',
    btn_zen: 'ZEN',
    btn_playlist: 'LISTA',
    btn_aura: 'AURA',
    btn_karma: 'KARMA',
    btn_element: 'ELEMENTO',
    btn_chakra: 'CHAKRA',
    btn_spirit: 'ESPÍRITU',
    btn_omen: 'PRESAGIO',
    btn_coffee: 'CAFÉ',
    btn_tea: 'TÉ',
    btn_vintage: 'VINTAGE',
    btn_vinyl: 'VINILO',
    btn_wifi: 'WI-FI',
    btn_pharmacy: 'FARMACIA',
    btn_hospital: 'HOSPITAL',
    btn_police: 'POLICÍA',
    btn_embassy: 'EMBAJADA',
    btn_student: 'ESTUDIANTE',
    btn_vegan: 'VEGANO',
    btn_yoga: 'YOGA',
    btn_gym: 'GIMNASIO',
    btn_park: 'PARQUE',
    btn_cat: 'GATO',
    btn_dog: 'PERRO',
    btn_plot: 'TRAMA',
    btn_hero: 'HÉROE',
    btn_villain: 'VILLANO',
    btn_dialog: 'DIÁLOGO',
    btn_genre: 'GÉNERO',
    btn_twist: 'GIRO',
    btn_parallel: 'PARALELO',
    btn_pastlife: 'PASADO',
    btn_zodiac: 'ZODÍACO',
    btn_prophecy: 'PROFECÍA',
    btn_dream_meaning: 'SUEÑO',
    btn_talisman: 'TALISMÁN',
    search_placeholder: "Búsqueda: 'Lugares con comida barata'...",
    btn_scan: 'BUSCAR',
    btn_reset: 'RESET',
    ctl_copy: 'COPIAR',
    ctl_fullscreen: 'PANTALLA',
    ctl_settings: 'AJUSTES',
    ctl_panel: 'PANEL IA',
    source_local: 'Flujo de Datos Local',
    loading_text: 'Cargando...',
    chat_welcome: 'Hola. Soy Rot. Te guiaré como un local de verdad. ¿Qué quieres saber?',
    chat_placeholder: 'Enviar mensaje...',
    lbl_settings_title: 'AJUSTES ROT',
    lbl_language: '🌐 IDIOMA',
    lbl_persona: '🎭 PERSONAJE',
    lbl_persona_ph: 'Ej: Historiador, Chef, Local...',
    lbl_api_key: '🔑 CLAVE API GEMINI',
    lbl_active: 'Activo:',
    lbl_model: '🤖 MODELO IA',
    btn_custom: 'PERSONAL.',
    btn_list: 'LISTA',
    btn_saved: '✓ GUARDADO',
    btn_save: '💾 GUARDAR',
    lbl_footer: 'SISTEMAS ROT • ACTUALIZACIÓN CUENTACUENTOS',
    lbl_privacy: 'PRIVACIDAD',
    privacy_title: 'Privacidad y Términos',
    privacy_p1: 'Los Sistemas ROT respetan la privacidad del usuario:',
    privacy_p2: '1. Su clave API de Gemini permanece segura sólo en el almacenamiento local de su navegador.',
    privacy_p3: '2. No tenemos servidores. Todas las interacciones fluyen directamente desde su dispositivo a la API de Google.',
    privacy_p4: '3. Este es un proyecto 100% de código abierto para uso personal.',
    privacy_p5: 'Software de código abierto por:',
    lbl_github: 'Seguir Desarrollador',
  },
  ru: {
    btn_analyze: 'АНАЛИЗ',
    btn_voice: 'ДИАЛЕКТ',
    btn_character: 'ЛЮДИ',
    btn_visual: 'ФОТО',
    btn_dream: 'ВИДЕНИЕ',
    btn_fashion: 'МОДА',
    btn_history: 'ИСТОРИЯ',
    btn_menu: 'МЕНЮ',
    btn_lang: 'ЯЗЫК',
    btn_legend: 'ЛЕГЕНДА',
    btn_music: 'МУЗЫКА',
    btn_ritual: 'ОБЫЧАЙ',
    btn_news: 'НОВОСТИ',
    btn_excuse: 'ТРАФИК',
    btn_startup: 'БИЗНЕС',
    btn_summary: 'МИР',
    btn_route: 'ПОЕЗДКА',
    btn_tech: 'ИНФРА',
    btn_haiku: 'ПОЭЗИЯ',
    btn_fortune: 'ГАДАНИЕ',
    btn_encounter: 'НАБЛЮДЕНИЕ',
    btn_item: 'ПОКУПКИ',
    btn_quest: 'АКТИВНОСТЬ',
    btn_secret: 'СЕКРЕТ',
    btn_graffiti: 'ИСКУССТВО',
    btn_film: 'КИНО',
    btn_scent: 'АРОМАТ',
    btn_job: 'РАБОТА',
    btn_totem: 'СИМВОЛ',
    btn_gift: 'СУВЕНИР',
    btn_arch: 'АРХИТ.',
    btn_drink: 'НАПИТОК',
    btn_law: 'ПРАВИЛО',
    btn_faction: 'КОМАНДА',
    btn_pet: 'ЖИВОТНОЕ',
    btn_glitch: 'ПРОБЛЕМА',
    btn_trivia: 'ФАКТЫ',
    btn_book: 'КНИГА',
    btn_slogan: 'СЛОГАН',
    btn_color: 'ЦВЕТ',
    btn_horror: 'УЖАС',
    btn_riddle: 'ЗАГАДКА',
    btn_philosophy: 'ФИЛОСОФИЯ',
    btn_ambience: 'ЗВУКИ',
    btn_market: 'ЭКОНОМИКА',
    btn_weather: 'ПОГОДА',
    btn_tarot: 'ТАРО',
    btn_crime: 'БЕЗОПАСНОСТЬ',
    btn_alias: 'МЕСТНОЕ ИМЯ',
    btn_relic: 'АНТИКВАРИАТ',
    btn_ad: 'РЕКЛАМА',
    btn_bio: 'ТРЕНД',
    btn_cult: 'ГРУППА',
    btn_emoji: 'ЭМОДЗИ',
    btn_visa: 'ВИЗА',
    btn_socket: 'РОЗЕТКА',
    btn_tip: 'ЧАЕВЫЕ',
    btn_water: 'ВОДА',
    btn_sos: 'ЭКСТРЕННЫЙ',
    btn_data: 'ДАННЫЕ',
    btn_budget: 'БЮДЖЕТ',
    btn_taboo: 'ТАБУ',
    btn_pack: 'БАГАЖ',
    btn_festival: 'ФЕСТИВАЛЬ',
    btn_kids: 'СЕМЬЯ',
    btn_date: 'СВИДАНИЕ',
    btn_work: 'РАБОТА',
    btn_walk: 'ПРОГУЛКА',
    btn_hack: 'ЛАЙФХАК',
    btn_night: 'НОЧЬ',
    btn_friend: 'ОБЩЕСТВО',
    btn_quiet: 'ПОКОЙ',
    btn_breakfast: 'ЗАВТРАК',
    btn_dessert: 'ДЕСЕРТ',
    btn_bazaar: 'РЫНОК',
    btn_library: 'КНИЖНЫЙ',
    btn_view: 'ВИД',
    btn_escape: 'ПОБЕГ',
    btn_workout: 'ТРЕНИРОВКА',
    btn_podcast: 'ПОДКАСТ',
    btn_app: 'ПРИЛОЖЕНИЕ',
    btn_challenge: 'ВЫЗОВ',
    btn_zen: 'ДЗЕН',
    btn_playlist: 'ПЛЕЙЛИСТ',
    btn_aura: 'АУРА',
    btn_karma: 'КАРМА',
    btn_element: 'ЭЛЕМЕНТ',
    btn_chakra: 'ЧАКРА',
    btn_spirit: 'ДУХ',
    btn_omen: 'ЗНАК',
    btn_coffee: 'КОФЕ',
    btn_tea: 'ЧАЙ',
    btn_vintage: 'ВИНТАЖ',
    btn_vinyl: 'ВИНИЛ',
    btn_wifi: 'WI-FI',
    btn_pharmacy: 'АПТЕКА',
    btn_hospital: 'БОЛЬНИЦА',
    btn_police: 'ПОЛИЦИЯ',
    btn_embassy: 'ПОСОЛЬСТВО',
    btn_student: 'СТУДЕНТ',
    btn_vegan: 'ВЕГАН',
    btn_yoga: 'ЙОГА',
    btn_gym: 'СПОРТЗАЛ',
    btn_park: 'ПАРК',
    btn_cat: 'КОТ',
    btn_dog: 'СОБАКА',
    btn_plot: 'СЮЖЕТ',
    btn_hero: 'ГЕРОЙ',
    btn_villain: 'ЗЛОДЕЙ',
    btn_dialog: 'ДИАЛОГ',
    btn_genre: 'ЖАНР',
    btn_twist: 'ПОВОРОТ',
    btn_parallel: 'ПАРАЛЛЕЛЬ',
    btn_pastlife: 'ПРОШЛОЕ',
    btn_zodiac: 'ЗОДИАК',
    btn_prophecy: 'ПРОРОЧЕСТВО',
    btn_dream_meaning: 'ТОЛКОВАНИЕ',
    btn_talisman: 'ТАЛИСМАН',
    search_placeholder: "Поиск: 'Места с дешёвой едой'...",
    btn_scan: 'ПОИСК',
    btn_reset: 'СБРОС',
    ctl_copy: 'КОПИРОВАТЬ',
    ctl_fullscreen: 'ЭКРАН',
    ctl_settings: 'НАСТРОЙКИ',
    ctl_panel: 'ПАНЕЛЬ ИИ',
    source_local: 'Локальный поток данных',
    loading_text: 'Загрузка...',
    chat_welcome: 'Привет. Я Rot. Буду твоим местным гидом. Что хочешь узнать?',
    chat_placeholder: 'Отправить сообщение...',
    lbl_settings_title: 'НАСТРОЙКИ ROT',
    lbl_language: '🌐 ЯЗЫК',
    lbl_persona: '🎭 ХАРАКТЕР',
    lbl_persona_ph: 'Напр: Историк, Гурман, Местный...',
    lbl_api_key: '🔑 КЛЮЧ API GEMINI',
    lbl_active: 'Активен:',
    lbl_model: '🤖 МОДЕЛЬ ИИ',
    btn_custom: 'СВОЯ',
    btn_list: 'СПИСОК',
    btn_saved: '✓ СОХРАНЕНО',
    btn_save: '💾 СОХРАНИТЬ',
    lbl_footer: 'СИСТЕМЫ ROT • ОБНОВЛЕНИЕ РАССКАЗЧИКА',
    lbl_privacy: 'КОНФИДЕНЦИАЛЬНОСТЬ',
    privacy_title: 'Политика Конфиденциальности',
    privacy_p1: 'ROT Systems уважает конфиденциальность:',
    privacy_p2: '1. Ваш ключ API Gemini хранится только в локальной памяти браузера.',
    privacy_p3: '2. У нас нет серверов. Все данные передаются напрямую между вами и Google API.',
    privacy_p4: '3. Это 100% проект с открытым исходным кодом.',
    privacy_p5: 'Открытый исходный код от:',
    lbl_github: 'Подписаться',
  },
}

const defaultFlavor: Record<TranslationLang, string> = {
  tr: 'Şehir verileri analiz ediliyor.',
  en: 'Analyzing city data.',
  es: 'Analizando datos de la ciudad.',
  ru: 'Анализ данных города.',
}

const flavorMap: Record<string, Partial<Record<TranslationLang, string[]>>> = {
  istanbul: { tr: ["Boğaz'ın serin suları ve martı sesleri.", 'Tarih ve kaosun muhteşem uyumu.'] },
  new_york: { tr: ['Asla uyumayan şehrin dijital nabzı.', 'Beton kanyonlarda rüzgarın sesi.'], en: ['The digital pulse of the city that never sleeps.', 'Wind echoing through concrete canyons.'] },
  tokyo: { tr: ['Neon ışıkları altında sessiz bir disiplin.', 'Gelecek ve gelenek iç içe.'], en: ['Quiet discipline under neon lights.', 'Future and tradition intertwined.'] },
  london: { tr: ['Gri gökyüzü altında asil bir duruş.', 'Tarihin derin izleri.'], en: ['A dignified stance under gray skies.', 'Deep traces of history.'] },
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const Clock = () => {
  const { apiKey, model, setApiKey, setModel } = useGeminiStore()

  const [lang, setLang] = useState<string>(() => localStorage.getItem('rot_language') || 'tr')

  const [persona, setPersona] = useState(() => localStorage.getItem('rot_persona') || '')

  const [currentCity, setCurrentCity] = useState<City>(() => cityData[0])
  const [scanQuery, setScanQuery] = useState('')
  const [scanMatches, setScanMatches] = useState<string[] | null>(null)

  const [timeText, setTimeText] = useState('00:00:00')
  const [dateText, setDateText] = useState('-')
  const [bgGradient, setBgGradient] = useState('from-slate-950 to-black')

  const [panelOpen, setPanelOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const [contextText, setContextText] = useState<string>('')
  const [subContextText, setSubContextText] = useState<string>(() => translations.tr.source_local)

  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [{
    id: makeId(),
    sender: 'bot',
    text: translations.tr.chat_welcome,
  }])
  const [chatInput, setChatInput] = useState('')

  // Settings panel locals
  const [localApiKey, setLocalApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [localModel, setLocalModel] = useState(model)
  const [isCustomModel, setIsCustomModel] = useState(false)
  const [customModelInput, setCustomModelInput] = useState('')
  const [settingsSaved, setSettingsSaved] = useState(false)

  const chatHistoryRef = useRef<HTMLDivElement | null>(null)

  const dictLang = useMemo<TranslationLang>(() => (translations[lang as TranslationLang] ? (lang as TranslationLang) : 'en'), [lang])

  const languageName = useMemo(() => supportedLanguages[dictLang] || supportedLanguages.en, [dictLang])

  const t = useMemo(() => {
    return (key: string) => translations[dictLang][key] || key
  }, [dictLang])

  useEffect(() => {
    localStorage.setItem('rot_language', lang)
    setSubContextText(t('source_local'))
    setChatMessages([{ id: makeId(), sender: 'bot', text: t('chat_welcome') }])
  }, [lang, t])

  useEffect(() => {
    localStorage.setItem('rot_persona', persona)
  }, [persona])

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const loc = dictLang === 'tr' ? 'tr-TR' : dictLang === 'es' ? 'es-ES' : dictLang === 'ru' ? 'ru-RU' : 'en-US'
      const fmt = new Intl.DateTimeFormat(loc, {
        timeZone: currentCity.region,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })

      const parts = fmt.formatToParts(now)
      const hourPart = parts.find((p) => p.type === 'hour')?.value
      const hour = hourPart ? Number.parseInt(hourPart, 10) : now.getHours()
      const timeStr = fmt.format(now)

      const dateStr = new Intl.DateTimeFormat(loc, {
        timeZone: currentCity.region,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(now)

      setTimeText(timeStr)
      setDateText(dateStr)

      if (hour >= 0 && hour < 5) setBgGradient('from-black via-slate-900 to-slate-950')
      else if (hour >= 5 && hour < 8) setBgGradient('from-slate-900 via-indigo-900 to-orange-900')
      else if (hour >= 8 && hour < 12) setBgGradient('from-blue-900 via-sky-800 to-slate-800')
      else if (hour >= 12 && hour < 17) setBgGradient('from-sky-700 via-blue-800 to-indigo-900')
      else if (hour >= 17 && hour < 20) setBgGradient('from-indigo-900 via-purple-900 to-slate-900')
      else setBgGradient('from-slate-950 via-gray-900 to-black')
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [currentCity.region, dictLang])

  useEffect(() => {
    chatHistoryRef.current?.scrollTo({ top: chatHistoryRef.current.scrollHeight })
  }, [chatMessages, chatOpen])

  const randomFlavor = () => {
    const list = flavorMap[currentCity.flavor]?.[dictLang]
    if (list && list.length) return list[Math.floor(Math.random() * list.length)]
    return defaultFlavor[dictLang]
  }

  useEffect(() => {
    setContextText(`> ${randomFlavor()}`)
    setSubContextText(t('source_local'))
    setScanMatches(null)
  }, [currentCity, dictLang, t])

  const trigger = async (mode: ModuleMode, extraData?: string) => {
    setErrorText('')

    if (!apiKey) {
      setErrorText('Gemini API key is missing. Please set it in Settings.')
      setSettingsOpen(true)
      return
    }

    if (mode !== 'chat') {
      setLoading(true)
      setSubContextText(dictLang === 'tr' ? 'BAĞLANTI KURULUYOR...' : 'ESTABLISHING CONNECTION...')
    }

    const api = new GeminiAPI(apiKey, model)

    const now = new Date()
    const timeStr = new Intl.DateTimeFormat(dictLang === 'tr' ? 'tr-TR' : 'en-US', {
      timeZone: currentCity.region,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now)

    const personaTrait = persona
      ? `PERSONALITY: "${persona}". Act exactly like this persona.`
      : 'PERSONALITY: Experienced local guide, historian, and cultural expert. Tone: Realistic, helpful, factual, observant. Provides actual data and real recommendations. NO sci-fi or fantasy.'

    const commonInstruction = `Language: ${languageName} ONLY. Context: Real-world, present-day facts. Be an expert local guide. No sci-fi, no fiction unless asked for legends. ${personaTrait}`

    const citiesList = cityData.map((c) => c.name).join(', ')

    const prompt = (() => {
      if (mode === 'chat') {
        return `System: You are 'Rot', a helpful local guide for ${currentCity.name}. Time: ${timeStr}. ${personaTrait} User asks: "${extraData || ''}". Reply in ${languageName}. Keep it under 50 words. Be factual and helpful. Return ONLY valid JSON: { "text": "YOUR_REPLY" }`
      }

      if (mode === 'global_report') {
        return `Compare the current time/status of ${currentCity.name} with other major hubs. ${commonInstruction} Return ONLY valid JSON: { "text": "COMPARISON", "fact": "TIMEZONES" }`
      }

      if (mode === 'scan') {
        return `Criteria: "${extraData || ''}". Cities: ${citiesList}. Find real matching cities based on actual data. ${commonInstruction} Return ONLY valid JSON: { "matches": ["City1"], "reason": "REASON" }`
      }

      return `Mode: ${mode}. City: ${currentCity.name}. Local time: ${timeStr}. ${commonInstruction} Return ONLY valid JSON: { "text": "TEXT", "fact": "FACT" }`
    })()

    try {
      const raw = await api.generateContent(prompt)
      const parsed = safeJsonParse(raw)

      if (!parsed) {
        throw new Error('Invalid JSON response')
      }

      if (mode === 'chat') {
        setChatMessages((prev) => [...prev, { id: makeId(), sender: 'bot', text: String(parsed.text || '') }])
        return
      }

      if (mode === 'scan') {
        const matches = Array.isArray(parsed.matches) ? parsed.matches.map((s: any) => String(s)) : []
        setScanMatches(matches)
        setContextText(`${parsed.reason || ''}`)
        setSubContextText(`${dictLang === 'tr' ? 'Bulunan Hedefler' : 'Targets'}: ${matches.length}`)
        return
      }

      setContextText(`${String(parsed.text || '')}`)
      setSubContextText(String(parsed.fact || ''))
    } catch (e) {
      setContextText(`> ${randomFlavor()}`)
      setSubContextText(t('source_local'))
      setErrorText(e instanceof Error ? e.message : 'Request failed')
    } finally {
      if (mode !== 'chat') setLoading(false)
    }
  }

  const applyScanHighlight = (cityName: string) => {
    if (!scanMatches || scanMatches.length === 0) return 'normal'
    const targets = scanMatches.map((m) => m.toLowerCase().trim())
    const c = cityName.toLowerCase().trim()
    const isMatch = targets.some((t) => c.includes(t) || t.includes(c))
    return isMatch ? 'highlight' : 'dim'
  }

  const onScan = async () => {
    const q = scanQuery.trim()
    if (!q) return
    await trigger('scan', q)
  }

  const resetScan = () => {
    setScanMatches(null)
    setScanQuery('')
    setContextText(`> ${randomFlavor()}`)
    setSubContextText(t('source_local'))
  }

  const copyTime = async () => {
    try {
      await navigator.clipboard.writeText(timeText)
    } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = timeText
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      } catch {
      }
    }
  }

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
    }
  }

  const sendChat = async () => {
    const msg = chatInput.trim()
    if (!msg) return

    setChatMessages((prev) => [...prev, { id: makeId(), sender: 'user', text: msg }])
    setChatInput('')
    await trigger('chat', msg)
  }

  const shuffledCities = useMemo(() => {
    const arr = [...cityData]
    arr.sort(() => Math.random() - 0.5)
    return arr
  }, [])

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden -m-6">
      <div className={cn('fixed top-0 left-0 w-full h-full -z-20 transition-all duration-1000 bg-gradient-to-br', bgGradient)} />
      <div
        className="fixed inset-0 -z-10 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="p-6 md:pt-12 flex flex-col items-center justify-center relative z-10 w-full">
        <div className="text-center w-full max-w-5xl">
          <h2 className="text-sm md:text-lg text-blue-400 font-bold tracking-[0.4em] uppercase mb-4 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">
            {currentCity.name}, {currentCity.country}
          </h2>

          <div className="font-mono text-6xl md:text-[9rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl select-all transition-all duration-100">
            {timeText}
          </div>

          <p className="text-lg md:text-2xl text-slate-400 font-light mt-4 mb-8 tracking-wide">{dateText}</p>

          <div className="relative group bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 w-full mx-auto transition-all hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3 mb-2 md:mb-0">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                </div>
                <span className="text-xs font-bold text-blue-400 tracking-[0.2em] uppercase">Rot v12.1 [STORYTELLER]</span>
              </div>

              <div className={cn('w-full', !panelOpen && 'hidden')}>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 w-full max-h-[50vh] overflow-y-auto pr-2">
                  {modules.map((m) => (
                    <button
                      key={m.mode}
                      onClick={() => void trigger(m.mode)}
                      className={cn(
                        'px-2 py-1.5 border rounded text-[9px] md:text-[10px] tracking-wider transition-all flex items-center justify-center gap-1',
                        m.style
                      )}
                      type="button"
                    >
                      <span>{m.emoji}</span>
                      <span>{t(m.key)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-h-[4rem] flex flex-col justify-center">
              <p className="text-slate-200 text-sm md:text-lg leading-relaxed font-medium flex items-center justify-center md:justify-start gap-2">
                <span className="text-slate-500 font-bold">›</span>
                <span>{contextText}</span>
              </p>
              {errorText ? <div className="mt-2 text-xs text-red-300 font-mono">{errorText}</div> : null}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center gap-2 text-xs text-slate-500 font-mono justify-between">
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">SOURCE:</span>
                <span>{subContextText}</span>
              </div>
              <div className={cn('flex items-center gap-2 text-blue-400', !loading && 'hidden')}>
                <span className="inline-block w-3.5 h-3.5 rounded-full border border-white/10 border-l-blue-500 animate-spin" />
                <span>{t('loading_text')}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-6 opacity-50 hover:opacity-100 transition-opacity items-center justify-center">
            <button onClick={() => void copyTime()} className="group text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors flex items-center gap-2" type="button">
              <span className="group-hover:rotate-12 transition-transform">📋</span> <span>{t('ctl_copy')}</span>
            </button>
            <button onClick={() => void toggleFullScreen()} className="group text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors flex items-center gap-2" type="button">
              <span className="group-hover:scale-110 transition-transform">⛶</span> <span>{t('ctl_fullscreen')}</span>
            </button>
            <button onClick={() => setSettingsOpen(true)} className="group text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors flex items-center gap-2 ml-4" type="button">
              <span className="group-hover:rotate-90 transition-transform duration-300">⚙️</span> <span>{t('ctl_settings')}</span>
            </button>
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className={cn(
                'group text-[10px] uppercase tracking-[0.2em] transition-colors flex items-center gap-2 ml-4 border px-2 py-1 rounded',
                panelOpen ? 'bg-blue-900 text-white border-blue-600' : 'text-blue-400 border-blue-900 hover:bg-blue-900/50 hover:text-white'
              )}
              type="button"
            >
              <span className="group-hover:scale-110 transition-transform">🎛️</span> <span>{t('ctl_panel')}</span>
            </button>
          </div>

          <div className="max-w-xl mx-auto mt-8 mb-4 px-4">
            <div className="relative flex items-center group">
              <span className="absolute left-4 text-slate-500 text-lg">🧠</span>
              <input
                value={scanQuery}
                onChange={(e) => setScanQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void onScan()
                }}
                placeholder={t('search_placeholder')}
                className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 text-sm py-3 pl-12 pr-24 rounded-full transition-all placeholder:text-slate-600 focus:bg-slate-900 focus:outline-none"
              />
              <button
                onClick={() => void onScan()}
                className="absolute right-1 top-1 bottom-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-200 text-xs font-bold px-4 rounded-full transition-all border border-blue-500/30 flex items-center gap-1"
                type="button"
              >
                <span>{t('btn_scan')}</span> <span className="text-[10px]">🔎</span>
              </button>
            </div>

            <div className={cn('text-center mt-2', !scanMatches && 'hidden')}>
              <button onClick={resetScan} className="text-[10px] text-slate-500 hover:text-white underline tracking-widest uppercase" type="button">
                <span>{t('btn_reset')}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center p-4 md:p-8 pb-24">
            <div className="max-w-[90rem] w-full text-center select-none">
              {shuffledCities.map((c) => {
                const sizeClass =
                  c.size === 1
                    ? 'text-5xl md:text-8xl opacity-100 font-black'
                    : c.size === 2
                      ? 'text-3xl md:text-6xl opacity-80 font-bold'
                      : c.size === 3
                        ? 'text-xl md:text-4xl opacity-60 font-semibold'
                        : 'text-lg md:text-2xl opacity-40 font-medium'

                const scanState = applyScanHighlight(c.name)

                return (
                  <button
                    key={`${c.name}-${c.region}`}
                    onClick={() => setCurrentCity(c)}
                    className={cn(
                      'inline-block m-3 md:m-6 select-none leading-none transition-all duration-300',
                      sizeClass,
                      currentCity.region === c.region
                        ? 'text-pink-400 drop-shadow-[0_0_30px_rgba(244,114,182,0.6)] scale-[1.03]'
                        : 'text-slate-200 hover:text-sky-300 hover:scale-[1.08] hover:drop-shadow-[0_0_25px_rgba(56,189,248,0.6)]',
                      scanState === 'dim' && 'opacity-10 blur-sm scale-95',
                      scanState === 'highlight' && 'text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)] opacity-100'
                    )}
                    type="button"
                  >
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-12 right-6 z-50 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-blue-400 transition-all hover:scale-110"
        type="button"
      >
        <span className="text-2xl">💬</span>
      </button>

      <div className="fixed bottom-4 left-0 w-full flex justify-center items-center gap-3 pointer-events-none z-50">
        <span className="bg-black/80 text-white text-[9px] px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur tracking-widest uppercase">{t('lbl_footer')}</span>
        <button 
          onClick={() => setPrivacyOpen(true)}
          className="pointer-events-auto bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-[9px] px-3 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 backdrop-blur tracking-widest uppercase transition-all"
          type="button"
        >
          🛡️ {t('lbl_privacy')}
        </button>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity',
          !settingsOpen && 'opacity-0 pointer-events-none'
        )}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setSettingsOpen(false)
        }}
      >
        <div className="bg-slate-900/95 border border-slate-700/60 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="text-base font-bold text-white tracking-[0.3em] uppercase">{t('lbl_settings_title')}</h3>
            </div>
            <button onClick={() => setSettingsOpen(false)} className="text-slate-500 hover:text-white transition-colors text-lg leading-none" type="button">✕</button>
          </div>

          <div className="space-y-5">
            {/* Language */}
            <div>
              <label className="block text-[10px] text-blue-400 font-bold tracking-[0.25em] mb-2 uppercase">{t('lbl_language')}</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:border-blue-500 outline-none transition-colors"
              >
                {Object.entries(supportedLanguages).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            {/* Persona */}
            <div>
              <label className="block text-[10px] text-fuchsia-400 font-bold tracking-[0.25em] mb-2 uppercase">{t('lbl_persona')}</label>
              <input
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder={t('lbl_persona_ph')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:border-fuchsia-500 outline-none transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-[10px] text-emerald-400 font-bold tracking-[0.25em] mb-2 uppercase">{t('lbl_api_key')}</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={localApiKey || apiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:border-emerald-500 outline-none font-mono pr-20 transition-colors placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300 px-1.5 py-1 transition-colors"
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
              {apiKey && (
                <p className="text-[10px] text-emerald-600 mt-1 font-mono">
                  ✓ {t('lbl_active')} {apiKey.slice(0, 8)}{'•'.repeat(8)}
                </p>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="block text-[10px] text-amber-400 font-bold tracking-[0.25em] mb-2 uppercase">{t('lbl_model')}</label>
              {!isCustomModel ? (
                <div className="flex gap-2">
                  <select
                    value={localModel}
                    onChange={(e) => setLocalModel(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:border-amber-500 outline-none transition-colors"
                  >
                    {PRESET_MODELS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => { setIsCustomModel(true); setCustomModelInput(localModel) }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-400 hover:text-white tracking-widest transition-colors"
                  >
                    {t('btn_custom')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                    placeholder="gemini-..."
                    className="flex-1 bg-slate-950 border border-amber-800/50 rounded-lg px-3 py-2.5 text-sm text-amber-200 focus:border-amber-500 outline-none font-mono transition-colors placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => { setIsCustomModel(false); setLocalModel(customModelInput || model) }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-400 hover:text-white tracking-widest transition-colors"
                  >
                    {t('btn_list')}
                  </button>
                </div>
              )}
              <p className="text-[10px] text-slate-600 mt-1">{t('lbl_active')} <span className="text-slate-400 font-mono">{model}</span></p>
            </div>

            {/* Save */}
            <button
              type="button"
              onClick={() => {
                const finalModel = isCustomModel ? (customModelInput.trim() || model) : localModel
                const finalKey = localApiKey.trim() || apiKey
                setApiKey(finalKey)
                setModel(finalModel)
                setLocalModel(finalModel)
                setSettingsSaved(true)
                setTimeout(() => setSettingsSaved(false), 2000)
              }}
              className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 hover:text-white font-bold text-[11px] tracking-[0.3em] uppercase py-3 rounded-lg transition-all"
            >
              {settingsSaved ? t('btn_saved') : t('btn_save')}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md transition-opacity',
          !chatOpen && 'opacity-0 pointer-events-none'
        )}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setChatOpen(false)
        }}
      >
        <div className="bg-slate-950/90 border border-blue-900/50 md:rounded-2xl rounded-t-2xl w-full max-w-lg h-[80vh] md:h-[600px] shadow-2xl relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <h3 className="text-sm font-bold text-blue-300 tracking-widest uppercase">
                {dictLang === 'tr' ? 'CANLI REHBER:' : 'LIVE GUIDE:'} <span className="text-white">// {currentCity.name}</span>
              </h3>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white transition-colors" type="button">
              ✕
            </button>
          </div>

          <div ref={chatHistoryRef} className="flex-grow overflow-y-auto p-4 space-y-4 font-mono text-sm scroll-smooth">
            <div className="text-center text-xs text-slate-600 mt-4 mb-4">--- {dictLang === 'tr' ? 'BAĞLANTI KURULDU' : 'CONNECTED'} ---</div>
            {chatMessages.map((m) =>
              m.sender === 'user' ? (
                <div key={m.id} className="flex items-start gap-3 flex-row-reverse">
                  <div className="w-6 h-6 rounded bg-emerald-700 flex items-center justify-center text-[10px]">YOU</div>
                  <div className="bg-emerald-900/40 border border-emerald-800 p-3 rounded-tl-lg rounded-bl-lg rounded-br-lg text-emerald-100 text-right max-w-[85%]">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-blue-900 flex items-center justify-center text-[10px]">🤖</div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-tr-lg rounded-bl-lg rounded-br-lg text-slate-300 max-w-[85%]">
                    {m.text}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/30">
            <div className="relative flex items-center">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void sendChat()
                }}
                placeholder={t('chat_placeholder')}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none pr-12 font-mono"
              />
              <button onClick={() => void sendChat()} className="absolute right-2 text-blue-400 hover:text-white p-2 transition-colors" type="button">
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Privacy / Terms Modal */}
      <div
        className={cn(
          'fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity',
          !privacyOpen && 'opacity-0 pointer-events-none'
        )}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setPrivacyOpen(false)
        }}
      >
        <div className="bg-slate-900/95 border border-slate-700/60 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-60" />
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 text-lg">🛡️</span>
              <h3 className="text-sm font-bold text-white tracking-[0.2em] uppercase">{t('privacy_title')}</h3>
            </div>
            <button onClick={() => setPrivacyOpen(false)} className="text-slate-500 hover:text-white transition-colors text-lg leading-none" type="button">✕</button>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-mono">
            <p className="text-emerald-400 font-bold">{t('privacy_p1')}</p>
            <p className="bg-slate-950/50 p-2 rounded border border-slate-800">{t('privacy_p2')}</p>
            <p className="bg-slate-950/50 p-2 rounded border border-slate-800">{t('privacy_p3')}</p>
            <p className="bg-slate-950/50 p-2 rounded border border-slate-800">{t('privacy_p4')}</p>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 tracking-wider mb-2 uppercase">{t('privacy_p5')}</p>
              <a 
                href="https://github.com/AllLiveSupport" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-white hover:text-black text-slate-200 px-4 py-2 rounded-lg font-bold transition-all border border-slate-700 mt-2"
              >
                <span>🐙</span> {t('lbl_github')} (@AllLiveSupport)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
