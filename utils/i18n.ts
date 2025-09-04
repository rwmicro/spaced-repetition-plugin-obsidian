import { getLanguage } from 'obsidian';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Header
    'spaced_repetition_reviews': 'Spaced Repetition Reviews',
    'calendar_view': 'Calendar View',
    'table_view': 'Table View',
    
    // Stats
    'overdue': 'Overdue',
    'today': 'Today',
    'avg_difficulty': 'Avg Difficulty',
    'total': 'Total',
    
    // Calendar
    'no_reviews_scheduled': 'No reviews scheduled',
    'note': 'Note',
    'notes': 'notes',
    'folder': 'Folder',
    'next_review': 'Next Review',
    'difficulty': 'Difficulty',
    'streak': 'Streak',
    'root': 'Root',
    
    // Empty states
    'no_notes_in_system': 'No notes in spaced repetition system',
    
    // Days of week
    'sun': 'Sun',
    'mon': 'Mon',
    'tue': 'Tue',
    'wed': 'Wed',
    'thu': 'Thu',
    'fri': 'Fri',
    'sat': 'Sat',
  },
  es: {
    // Header
    'spaced_repetition_reviews': 'Revisiones de Repetición Espaciada',
    'calendar_view': 'Vista de Calendario',
    'table_view': 'Vista de Tabla',
    
    // Stats
    'overdue': 'Atrasado',
    'today': 'Hoy',
    'avg_difficulty': 'Dificultad Promedio',
    'total': 'Total',
    
    // Calendar
    'no_reviews_scheduled': 'No hay revisiones programadas',
    'note': 'Nota',
    'notes': 'notas',
    'folder': 'Carpeta',
    'next_review': 'Próxima Revisión',
    'difficulty': 'Dificultad',
    'streak': 'Racha',
    'root': 'Raíz',
    
    // Empty states
    'no_notes_in_system': 'No hay notas en el sistema de repetición espaciada',
    
    // Days of week
    'sun': 'Dom',
    'mon': 'Lun',
    'tue': 'Mar',
    'wed': 'Mié',
    'thu': 'Jue',
    'fri': 'Vie',
    'sat': 'Sáb',
  },
  fr: {
    // Header
    'spaced_repetition_reviews': 'Révisions à venir',
    'calendar_view': 'Vue Calendrier',
    'table_view': 'Vue Tableau',
    
    // Stats
    'overdue': 'En retard',
    'today': "Aujourd'hui",
    'avg_difficulty': 'Difficulté Moyenne',
    'total': 'Total',
    
    // Calendar
    'no_reviews_scheduled': 'Aucune révision programmée',
    'note': 'Note',
    'notes': 'notes',
    'folder': 'Dossier',
    'next_review': 'Prochaine Révision',
    'difficulty': 'Difficulté',
    'streak': 'Série',
    'root': 'Racine',
    
    // Empty states
    'no_notes_in_system': 'Aucune note dans le système de répétition espacée',
    
    // Days of week
    'sun': 'Dim',
    'mon': 'Lun',
    'tue': 'Mar',
    'wed': 'Mer',
    'thu': 'Jeu',
    'fri': 'Ven',
    'sat': 'Sam',
  },
  de: {
    // Header
    'spaced_repetition_reviews': 'Wiederholungen mit Abständen',
    'calendar_view': 'Kalenderansicht',
    'table_view': 'Tabellenansicht',
    
    // Stats
    'overdue': 'Überfällig',
    'today': 'Heute',
    'avg_difficulty': 'Ø-Schwierigkeit',
    'total': 'Gesamt',
    
    // Calendar
    'no_reviews_scheduled': 'Keine Wiederholungen geplant',
    'note': 'Notiz',
    'notes': 'Notizen',
    'folder': 'Ordner',
    'next_review': 'Nächste Wiederholung',
    'difficulty': 'Schwierigkeit',
    'streak': 'Serie',
    'root': 'Wurzel',
    
    // Empty states
    'no_notes_in_system': 'Keine Notizen im Wiederholungssystem',
    
    // Days of week
    'sun': 'So',
    'mon': 'Mo',
    'tue': 'Di',
    'wed': 'Mi',
    'thu': 'Do',
    'fri': 'Fr',
    'sat': 'Sa',
  },
  ja: {
    // Header
    'spaced_repetition_reviews': '間隔反復復習',
    'calendar_view': 'カレンダービュー',
    'table_view': 'テーブルビュー',
    
    // Stats
    'overdue': '期限切れ',
    'today': '今日',
    'avg_difficulty': '平均難易度',
    'total': '合計',
    
    // Calendar
    'no_reviews_scheduled': '復習の予定はありません',
    'note': 'ノート',
    'notes': 'ノート',
    'folder': 'フォルダ',
    'next_review': '次の復習',
    'difficulty': '難易度',
    'streak': 'ストリーク',
    'root': 'ルート',
    
    // Empty states
    'no_notes_in_system': '間隔反復システムにノートがありません',
    
    // Days of week
    'sun': '日',
    'mon': '月',
    'tue': '火',
    'wed': '水',
    'thu': '木',
    'fri': '金',
    'sat': '土',
  }
};

export function t(key: string): string {
  const currentLanguage = getLanguage();
  const langCode = currentLanguage.toLowerCase();
  
  // Try exact match first
  if (translations[langCode] && translations[langCode][key]) {
    return translations[langCode][key];
  }
  
  // Try language prefix (e.g., 'en-US' -> 'en')
  const langPrefix = langCode.split('-')[0];
  if (translations[langPrefix] && translations[langPrefix][key]) {
    return translations[langPrefix][key];
  }
  
  // Fallback to English
  if (translations.en && translations.en[key]) {
    return translations.en[key];
  }
  
  // If all else fails, return the key itself
  return key;
}

export function getDayNames(): string[] {
  return [
    t('sun'),
    t('mon'),
    t('tue'),
    t('wed'),
    t('thu'),
    t('fri'),
    t('sat')
  ];
}

export function getFormattedDateRange(startDate: Date, endDate: Date): string {
  const currentLanguage = getLanguage();
  const locale = currentLanguage.toLowerCase() === 'en' ? 'en-US' : currentLanguage;
  
  try {
    return `${startDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } catch {
    // Fallback to English formatting if locale is not supported
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
}

export function getFormattedDate(date: Date): string {
  const currentLanguage = getLanguage();
  const locale = currentLanguage.toLowerCase() === 'en' ? 'en-US' : currentLanguage;
  
  try {
    return date.toLocaleDateString(locale);
  } catch {
    // Fallback to English formatting if locale is not supported
    return date.toLocaleDateString('en-US');
  }
}