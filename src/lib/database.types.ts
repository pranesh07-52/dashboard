export interface Database {
  public: {
    Tables: {
      elections: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          start_date: string;
          end_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          election_id: string;
          name: string;
          description: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          name: string;
          description?: string;
          emoji?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          name?: string;
          description?: string;
          emoji?: string;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          election_id: string;
          candidate_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          candidate_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          candidate_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
