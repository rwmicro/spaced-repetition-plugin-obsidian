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

    // Navigation
    'previous_week': 'Previous week',
    'next_week': 'Next week',
    'go_to_today': 'Go to today',
    'overdue_note': 'overdue note',
    'overdue_notes': 'overdue notes',
    'more': 'more',

    // Add note modal
    'add_note_to_sr': 'Add Note to Spaced Repetition',
    'first_review_in': 'First review in',
    'day': 'day',
    'days': 'days',
    'cancel': 'Cancel',
    'add_to_reviews': 'Add to Reviews',

    // Review buttons
    'again': 'Again',
    'hard': 'Hard',
    'good': 'Good',
    'easy': 'Easy',
    'press_key': 'Press',

    // Empty states
    'no_notes_in_system': 'No notes in spaced repetition system',

    // Activity heatmap
    'activity_stats': 'Activity & Stats',
    'review_activity': 'Review Activity',
    'total_reviews': 'Total Reviews',
    'last_30_days': 'Last 30 Days',
    'current_streak': 'Current Streak',
    'longest_streak': 'Longest Streak',
    'less': 'Less',

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

    // Navigation
    'previous_week': 'Semana anterior',
    'next_week': 'Semana siguiente',
    'go_to_today': 'Ir a hoy',
    'overdue_note': 'nota atrasada',
    'overdue_notes': 'notas atrasadas',
    'more': 'más',

    // Add note modal
    'add_note_to_sr': 'Añadir Nota a Repetición Espaciada',
    'first_review_in': 'Primera revisión en',
    'day': 'día',
    'days': 'días',
    'cancel': 'Cancelar',
    'add_to_reviews': 'Añadir a Revisiones',

    // Review buttons
    'again': 'Otra vez',
    'hard': 'Difícil',
    'good': 'Bien',
    'easy': 'Fácil',
    'press_key': 'Pulsa',

    // Empty states
    'no_notes_in_system': 'No hay notas en el sistema de repetición espaciada',

    // Activity heatmap
    'activity_stats': 'Actividad y Estadísticas',
    'review_activity': 'Actividad de Revisión',
    'total_reviews': 'Revisiones Totales',
    'last_30_days': 'Últimos 30 Días',
    'current_streak': 'Racha Actual',
    'longest_streak': 'Racha Más Larga',
    'less': 'Menos',

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

    // Navigation
    'previous_week': 'Semaine précédente',
    'next_week': 'Semaine suivante',
    'go_to_today': "Aller à aujourd'hui",
    'overdue_note': 'note en retard',
    'overdue_notes': 'notes en retard',
    'more': 'plus',

    // Add note modal
    'add_note_to_sr': 'Ajouter à la Répétition Espacée',
    'first_review_in': 'Première révision dans',
    'day': 'jour',
    'days': 'jours',
    'cancel': 'Annuler',
    'add_to_reviews': 'Ajouter aux Révisions',

    // Review buttons
    'again': 'Encore',
    'hard': 'Difficile',
    'good': 'Bien',
    'easy': 'Facile',
    'press_key': 'Appuyer',

    // Empty states
    'no_notes_in_system': 'Aucune note dans le système de répétition espacée',

    // Activity heatmap
    'activity_stats': 'Activité et Stats',
    'review_activity': 'Activité de Révision',
    'total_reviews': 'Révisions Totales',
    'last_30_days': '30 Derniers Jours',
    'current_streak': 'Série Actuelle',
    'longest_streak': 'Plus Longue Série',
    'less': 'Moins',

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

    // Navigation
    'previous_week': 'Vorherige Woche',
    'next_week': 'Nächste Woche',
    'go_to_today': 'Zu heute gehen',
    'overdue_note': 'überfällige Notiz',
    'overdue_notes': 'überfällige Notizen',
    'more': 'mehr',

    // Add note modal
    'add_note_to_sr': 'Zur Wiederholung hinzufügen',
    'first_review_in': 'Erste Wiederholung in',
    'day': 'Tag',
    'days': 'Tagen',
    'cancel': 'Abbrechen',
    'add_to_reviews': 'Zu Wiederholungen hinzufügen',

    // Review buttons
    'again': 'Nochmal',
    'hard': 'Schwer',
    'good': 'Gut',
    'easy': 'Leicht',
    'press_key': 'Drücke',

    // Empty states
    'no_notes_in_system': 'Keine Notizen im Wiederholungssystem',

    // Activity heatmap
    'activity_stats': 'Aktivität & Statistiken',
    'review_activity': 'Wiederholungsaktivität',
    'total_reviews': 'Gesamte Wiederholungen',
    'last_30_days': 'Letzte 30 Tage',
    'current_streak': 'Aktuelle Serie',
    'longest_streak': 'Längste Serie',
    'less': 'Weniger',

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

    // Navigation
    'previous_week': '前の週',
    'next_week': '次の週',
    'go_to_today': '今日に移動',
    'overdue_note': '期限切れのノート',
    'overdue_notes': '期限切れのノート',
    'more': 'もっと',

    // Add note modal
    'add_note_to_sr': '間隔反復に追加',
    'first_review_in': '最初の復習まで',
    'day': '日',
    'days': '日',
    'cancel': 'キャンセル',
    'add_to_reviews': '復習に追加',

    // Review buttons
    'again': 'もう一度',
    'hard': '難しい',
    'good': '良い',
    'easy': '簡単',
    'press_key': 'キー',

    // Empty states
    'no_notes_in_system': '間隔反復システムにノートがありません',

    // Activity heatmap
    'activity_stats': 'アクティビティと統計',
    'review_activity': '復習アクティビティ',
    'total_reviews': '総復習数',
    'last_30_days': '過去30日間',
    'current_streak': '現在の連続',
    'longest_streak': '最長連続',
    'less': '少',

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