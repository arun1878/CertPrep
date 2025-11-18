export interface Topic {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  topics: Topic[];
}

export interface StudyPlan {
  id: string;
  title: string;
  examName: string;
  targetDate: string; // ISO date string
  createdAt: number;
  description: string;
  estimatedHours: number;
  modules: Module[];
  completedTopicsCount: number;
  totalTopicsCount: number;
}

// API Response types (before client-side hydration)
export interface ApiTopic {
  title: string;
}

export interface ApiModule {
  title: string;
  description: string;
  topics: string[];
}

export interface ApiStudyPlanResponse {
  title: string;
  description: string;
  estimatedHours: number;
  modules: ApiModule[];
}