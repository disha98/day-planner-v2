export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  description: string | null;
  meeting_url: string | null;
  date: string;
  start_hour: number;
  end_hour: number;
  category_id: string | null;
  category_name: string | null;
  category_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  completed: number;
  priority: "high" | "medium" | "low";
  date: string | null;
  sort_order: number;
  category_id: string | null;
  category_name: string | null;
  category_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteSection {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface NotePage {
  id: string;
  section_id: string;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DailyNote {
  id: string;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Holiday {
  date: string;
  name: string;
  localName: string;
}

export interface DayWeather {
  date: string;
  tempMin: number;
  tempMax: number;
  weatherCode: number;
  precipProbability: number;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  country_code: string;
  latitude: number;
  longitude: number;
  temp_unit: "celsius" | "fahrenheit";
  created_at: string;
  updated_at: string;
}
