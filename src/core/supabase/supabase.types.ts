export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  analytics: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      crop_establishment_method_summary: {
        Args: { p_season_id?: number }
        Returns: Json
      }
      damage_by_cause: {
        Args: {
          p_barangay?: string
          p_method?: string
          p_municipality?: string
          p_province?: string
          p_season_id?: number
          p_variety?: string
        }
        Returns: Json
      }
      damage_by_location: {
        Args: {
          p_barangay?: string
          p_cause?: string
          p_municipality?: string
          p_province?: string
          p_season_id?: number
        }
        Returns: Json
      }
      dashboard_barangay_yield_rankings: {
        Args: { p_season_id?: number }
        Returns: Json
      }
      dashboard_summary: { Args: { p_season_id?: number }; Returns: Json }
      fertilizer_type_summary: {
        Args: {
          p_barangay?: string
          p_method?: string
          p_municipality?: string
          p_province?: string
          p_season_id?: number
          p_variety?: string
        }
        Returns: Json
      }
      province_yields: { Args: { p_season_id?: number }; Returns: Json }
      rice_variety_summary: { Args: { p_season_id?: number }; Returns: Json }
      summary_form_count: { Args: { p_season_id?: number }; Returns: Json }
      summary_form_progress: { Args: { p_season_id?: number }; Returns: Json }
      trend_data_collection: { Args: { p_season_id?: number }; Returns: Json }
      trend_overall_yield: { Args: { p_season_id?: number }; Returns: Json }
      yield_by_location: {
        Args: {
          p_barangay?: string
          p_method?: string
          p_municipality?: string
          p_province?: string
          p_season_id?: number
          p_variety?: string
        }
        Returns: Json
      }
      yield_by_method: {
        Args: {
          p_barangay?: string
          p_method?: string
          p_municipality?: string
          p_province?: string
          p_season_id?: number
          p_variety?: string
        }
        Returns: Json
      }
      yield_by_variety: {
        Args: {
          p_barangay?: string
          p_method?: string
          p_municipality?: string
          p_province?: string
          p_season_id?: number
          p_variety?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      barangays: {
        Row: {
          city_municipality_id: number
          code: string
          id: number
          name: string
        }
        Insert: {
          city_municipality_id: number
          code: string
          id?: number
          name: string
        }
        Update: {
          city_municipality_id?: number
          code?: string
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "barangays_city_municipality_id_fkey"
            columns: ["city_municipality_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["city_municipality_id"]
          },
          {
            foreignKeyName: "barangays_city_municipality_id_fkey"
            columns: ["city_municipality_id"]
            isOneToOne: false
            referencedRelation: "cities_municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      cities_municipalities: {
        Row: {
          code: string
          id: number
          name: string
          province_id: number
        }
        Insert: {
          code: string
          id?: number
          name: string
          province_id: number
        }
        Update: {
          code?: string
          id?: number
          name?: string
          province_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "cities_municipalities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["province_id"]
          },
          {
            foreignKeyName: "cities_municipalities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_establishments: {
        Row: {
          actual_crop_establishment_date: string
          actual_crop_establishment_method: string
          direct_seeding_method: string | null
          distance_between_plant_row_1: number | null
          distance_between_plant_row_2: number | null
          distance_between_plant_row_3: number | null
          distance_within_plant_row_1: number | null
          distance_within_plant_row_2: number | null
          distance_within_plant_row_3: number | null
          ecosystem: string
          id: number
          monitoring_field_area_sqm: number
          num_plants_1: number | null
          num_plants_2: number | null
          num_plants_3: number | null
          rice_variety: string
          rice_variety_maturity_duration: number
          rice_variety_no: string | null
          seed_class: string
          seeding_rate_kg_ha: number | null
          seedling_age_at_transplanting: number | null
          sowing_date: string | null
        }
        Insert: {
          actual_crop_establishment_date: string
          actual_crop_establishment_method: string
          direct_seeding_method?: string | null
          distance_between_plant_row_1?: number | null
          distance_between_plant_row_2?: number | null
          distance_between_plant_row_3?: number | null
          distance_within_plant_row_1?: number | null
          distance_within_plant_row_2?: number | null
          distance_within_plant_row_3?: number | null
          ecosystem: string
          id: number
          monitoring_field_area_sqm: number
          num_plants_1?: number | null
          num_plants_2?: number | null
          num_plants_3?: number | null
          rice_variety: string
          rice_variety_maturity_duration: number
          rice_variety_no?: string | null
          seed_class: string
          seeding_rate_kg_ha?: number | null
          seedling_age_at_transplanting?: number | null
          sowing_date?: string | null
        }
        Update: {
          actual_crop_establishment_date?: string
          actual_crop_establishment_method?: string
          direct_seeding_method?: string | null
          distance_between_plant_row_1?: number | null
          distance_between_plant_row_2?: number | null
          distance_between_plant_row_3?: number | null
          distance_within_plant_row_1?: number | null
          distance_within_plant_row_2?: number | null
          distance_within_plant_row_3?: number | null
          ecosystem?: string
          id?: number
          monitoring_field_area_sqm?: number
          num_plants_1?: number | null
          num_plants_2?: number | null
          num_plants_3?: number | null
          rice_variety?: string
          rice_variety_maturity_duration?: number
          rice_variety_no?: string | null
          seed_class?: string
          seeding_rate_kg_ha?: number | null
          seedling_age_at_transplanting?: number | null
          sowing_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_establishments_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_establishments_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activity_details"
            referencedColumns: ["id"]
          },
        ]
      }
      damage_assessments: {
        Row: {
          affected_area_ha: number
          cause: string
          crop_stage: string
          id: number
          observed_pest: string | null
          severity: string
          soil_type: string
        }
        Insert: {
          affected_area_ha: number
          cause: string
          crop_stage: string
          id: number
          observed_pest?: string | null
          severity: string
          soil_type: string
        }
        Update: {
          affected_area_ha?: number
          cause?: string
          crop_stage?: string
          id?: number
          observed_pest?: string | null
          severity?: string
          soil_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "damage_assessments_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_assessments_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activity_details"
            referencedColumns: ["id"]
          },
        ]
      }
      farmers: {
        Row: {
          cellphone_no: string | null
          created_at: string
          date_of_birth: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          id: number
          last_name: string
          updated_at: string
        }
        Insert: {
          cellphone_no?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: number
          last_name: string
          updated_at?: string
        }
        Update: {
          cellphone_no?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: number
          last_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fertilization_records: {
        Row: {
          applied_area_sqm: number
          id: number
        }
        Insert: {
          applied_area_sqm: number
          id: number
        }
        Update: {
          applied_area_sqm?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fertilization_records_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fertilization_records_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activity_details"
            referencedColumns: ["id"]
          },
        ]
      }
      fertilizer_applications: {
        Row: {
          amount_applied: number
          amount_unit: string
          brand: string
          crop_stage_on_application: string
          fertilization_record_id: number
          fertilizer_type: string
          id: number
          nitrogen_content_pct: number
          phosphorus_content_pct: number
          potassium_content_pct: number
        }
        Insert: {
          amount_applied: number
          amount_unit: string
          brand: string
          crop_stage_on_application: string
          fertilization_record_id: number
          fertilizer_type: string
          id?: number
          nitrogen_content_pct: number
          phosphorus_content_pct: number
          potassium_content_pct: number
        }
        Update: {
          amount_applied?: number
          amount_unit?: string
          brand?: string
          crop_stage_on_application?: string
          fertilization_record_id?: number
          fertilizer_type?: string
          id?: number
          nitrogen_content_pct?: number
          phosphorus_content_pct?: number
          potassium_content_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "fertilizer_applications_fertilization_record_id_fkey"
            columns: ["fertilization_record_id"]
            isOneToOne: false
            referencedRelation: "fertilization_records"
            referencedColumns: ["id"]
          },
        ]
      }
      field_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          collected_at: string | null
          collected_by: string | null
          field_id: number
          id: number
          image_urls: Json | null
          remarks: string | null
          season_id: number
          synced_at: string | null
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          collected_at?: string | null
          collected_by?: string | null
          field_id: number
          id?: number
          image_urls?: Json | null
          remarks?: string | null
          season_id: number
          synced_at?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          collected_at?: string | null
          collected_by?: string | null
          field_id?: number
          id?: number
          image_urls?: Json | null
          remarks?: string | null
          season_id?: number
          synced_at?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_activities_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "field_details"
            referencedColumns: ["field_id"]
          },
          {
            foreignKeyName: "field_activities_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "latest_season"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      field_plannings: {
        Row: {
          current_field_condition: string
          est_crop_establishment_date: string
          est_crop_establishment_method: string
          id: number
          land_preparation_start_date: string
          soil_type: string | null
          total_field_area_ha: number
        }
        Insert: {
          current_field_condition: string
          est_crop_establishment_date: string
          est_crop_establishment_method: string
          id: number
          land_preparation_start_date: string
          soil_type?: string | null
          total_field_area_ha: number
        }
        Update: {
          current_field_condition?: string
          est_crop_establishment_date?: string
          est_crop_establishment_method?: string
          id?: number
          land_preparation_start_date?: string
          soil_type?: string | null
          total_field_area_ha?: number
        }
        Relationships: [
          {
            foreignKeyName: "field_plannings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_plannings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activity_details"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          barangay_id: number
          created_at: string
          farmer_id: number
          id: number
          location: unknown
          mfid_id: number
          updated_at: string
        }
        Insert: {
          barangay_id: number
          created_at?: string
          farmer_id: number
          id?: number
          location?: unknown
          mfid_id: number
          updated_at?: string
        }
        Update: {
          barangay_id?: number
          created_at?: string
          farmer_id?: number
          id?: number
          location?: unknown
          mfid_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fields_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["barangay_id"]
          },
          {
            foreignKeyName: "fields_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fields_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fields_mfid_id_fkey"
            columns: ["mfid_id"]
            isOneToOne: true
            referencedRelation: "mfids"
            referencedColumns: ["id"]
          },
        ]
      }
      harvest_records: {
        Row: {
          area_harvested_ha: number
          avg_bag_weight_kg: number
          bags_harvested: number
          harvest_date: string
          harvesting_method: Database["public"]["Enums"]["harvesting_method"]
          id: number
          irrigation_supply: Database["public"]["Enums"]["irrigation_supply"]
        }
        Insert: {
          area_harvested_ha: number
          avg_bag_weight_kg: number
          bags_harvested: number
          harvest_date: string
          harvesting_method: Database["public"]["Enums"]["harvesting_method"]
          id: number
          irrigation_supply: Database["public"]["Enums"]["irrigation_supply"]
        }
        Update: {
          area_harvested_ha?: number
          avg_bag_weight_kg?: number
          bags_harvested?: number
          harvest_date?: string
          harvesting_method?: Database["public"]["Enums"]["harvesting_method"]
          id?: number
          irrigation_supply?: Database["public"]["Enums"]["irrigation_supply"]
        }
        Relationships: [
          {
            foreignKeyName: "harvest_records_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvest_records_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activity_details"
            referencedColumns: ["id"]
          },
        ]
      }
      mfids: {
        Row: {
          created_at: string
          id: number
          mfid: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          mfid: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          mfid?: string
          used_at?: string | null
        }
        Relationships: []
      }
      monitoring_visits: {
        Row: {
          avg_plant_height: number | null
          crop_stage: string
          date_monitored: string
          id: number
          soil_moisture_status: string
        }
        Insert: {
          avg_plant_height?: number | null
          crop_stage: string
          date_monitored: string
          id: number
          soil_moisture_status: string
        }
        Update: {
          avg_plant_height?: number | null
          crop_stage?: string
          date_monitored?: string
          id?: number
          soil_moisture_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_visits_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_visits_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activity_details"
            referencedColumns: ["id"]
          },
        ]
      }
      predicted_yields: {
        Row: {
          field_id: number
          generated_at: string
          id: number
          predicted_yield_t_ha: number
          season_id: number
        }
        Insert: {
          field_id: number
          generated_at?: string
          id?: number
          predicted_yield_t_ha: number
          season_id: number
        }
        Update: {
          field_id?: number
          generated_at?: string
          id?: number
          predicted_yield_t_ha?: number
          season_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "predicted_yields_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "field_details"
            referencedColumns: ["field_id"]
          },
          {
            foreignKeyName: "predicted_yields_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predicted_yields_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "latest_season"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predicted_yields_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          code: string
          id: number
          name: string
        }
        Insert: {
          code: string
          id?: number
          name: string
        }
        Update: {
          code?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          end_date: string
          id: number
          season_year: string
          semester: Database["public"]["Enums"]["semester"]
          start_date: string
        }
        Insert: {
          end_date: string
          id?: number
          season_year: string
          semester: Database["public"]["Enums"]["semester"]
          start_date: string
        }
        Update: {
          end_date?: string
          id?: number
          season_year?: string
          semester?: Database["public"]["Enums"]["semester"]
          start_date?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          date_of_birth: string
          first_name: string
          id: string
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          first_name: string
          id: string
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          first_name?: string
          id?: string
          last_name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      addresses: {
        Row: {
          barangay: string | null
          barangay_id: number | null
          city_municipality: string | null
          city_municipality_id: number | null
          province: string | null
          province_id: number | null
        }
        Relationships: []
      }
      field_activity_details: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"] | null
          barangay: string | null
          collected_at: string | null
          collected_by: string | null
          farmer_name: string | null
          field_id: number | null
          form_data: Json | null
          id: number | null
          mfid: string | null
          municipality: string | null
          province: string | null
          remarks: string | null
          season_id: number | null
          season_year: string | null
          semester: Database["public"]["Enums"]["semester"] | null
          synced_at: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          verified_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_activities_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "field_details"
            referencedColumns: ["field_id"]
          },
          {
            foreignKeyName: "field_activities_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "latest_season"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      field_details: {
        Row: {
          barangay: string | null
          created_at: string | null
          farmer_first_name: string | null
          farmer_last_name: string | null
          field_id: number | null
          mfid: string | null
          municipality: string | null
          province: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      latest_season: {
        Row: {
          end_date: string | null
          id: number | null
          season_year: string | null
          semester: Database["public"]["Enums"]["semester"] | null
          start_date: string | null
        }
        Relationships: []
      }
      mfid_details: {
        Row: {
          barangay: string | null
          city_municipality: string | null
          created_at: string | null
          farmer_name: string | null
          mfid: string | null
          province: string | null
          status: string | null
          used_at: string | null
        }
        Relationships: []
      }
      user_details: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          last_sign_in_at: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_duplicate_activities: {
        Args: { p_activity_type: string; p_rows: Json }
        Returns: Json
      }
      create_seed_user: {
        Args: {
          p_created_at?: string
          p_date_of_birth: string
          p_email: string
          p_first_name: string
          p_id: string
          p_last_name: string
          p_password: string
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      find_barangay_id: {
        Args: { p_barangay: string; p_municity: string; p_province: string }
        Returns: number
      }
      find_or_create_collector_id: {
        Args: { p_collector_json: Json }
        Returns: string
      }
      find_or_create_farmer: {
        Args: {
          p_cellphone_no?: string
          p_date_of_birth?: string
          p_first_name: string
          p_gender?: string
          p_last_name: string
        }
        Returns: number
      }
      find_season_id_by_date:
        | {
            Args: { p_date: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.find_season_id_by_date(p_date => text), public.find_season_id_by_date(p_date => date). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { p_date: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.find_season_id_by_date(p_date => text), public.find_season_id_by_date(p_date => date). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      generate_mfid: {
        Args: { p_municity: string; p_province: string }
        Returns: string
      }
      handle_mfid: {
        Args: {
          p_auto_create_mfid?: boolean
          p_barangay_id: number
          p_farmer_id: number
          p_location?: unknown
          p_mfid: string
        }
        Returns: number
      }
      import_crop_establishments: {
        Args: { p_auto_create_mfid?: boolean; p_data: Json }
        Returns: Json
      }
      import_damage_assessments: {
        Args: { p_auto_create_mfid?: boolean; p_data: Json }
        Returns: Json
      }
      import_data_transaction: {
        Args: {
          p_auto_create_mfid?: boolean
          p_data: Json
          p_dataset_type: string
        }
        Returns: Json
      }
      import_fertilization_records: {
        Args: { p_auto_create_mfid?: boolean; p_data: Json }
        Returns: Json
      }
      import_field_plannings: {
        Args: { p_auto_create_mfid?: boolean; p_data: Json }
        Returns: Json
      }
      import_harvest_records: {
        Args: { p_auto_create_mfid?: boolean; p_data: Json }
        Returns: Json
      }
      parse_date: { Args: { date_str: string }; Returns: string }
      parse_timestamptz: { Args: { timestamptz_str: string }; Returns: string }
    }
    Enums: {
      activity_type:
        | "field-data"
        | "cultural-management"
        | "nutrient-management"
        | "crop_cut"
        | "production"
        | "monitoring-visit"
        | "damage-assessment"
        | "rice-non-rice"
      gender: "male" | "female" | "other"
      harvesting_method: "Manual" | "Mechanical" | "Other"
      irrigation_supply:
        | "Not Enough"
        | "Not Sufficient"
        | "Sufficient"
        | "Excessive"
      semester: "first" | "second"
      user_role:
        | "admin"
        | "data_manager"
        | "data_collector"
        | "pending"
        | "inactive"
      verification_status: "pending" | "approved" | "rejected" | "unknown"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  analytics: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_type: [
        "field-data",
        "cultural-management",
        "nutrient-management",
        "crop_cut",
        "production",
        "monitoring-visit",
        "damage-assessment",
        "rice-non-rice",
      ],
      gender: ["male", "female", "other"],
      harvesting_method: ["Manual", "Mechanical", "Other"],
      irrigation_supply: [
        "Not Enough",
        "Not Sufficient",
        "Sufficient",
        "Excessive",
      ],
      semester: ["first", "second"],
      user_role: [
        "admin",
        "data_manager",
        "data_collector",
        "pending",
        "inactive",
      ],
      verification_status: ["pending", "approved", "rejected", "unknown"],
    },
  },
} as const

