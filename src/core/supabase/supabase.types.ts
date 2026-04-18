export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string | null
          details: Json | null
          event_type: string
          id: number
          new_data: Json | null
          occurred_at: string
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          details?: Json | null
          event_type: string
          id?: number
          new_data?: Json | null
          occurred_at?: string
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          details?: Json | null
          event_type?: string
          id?: number
          new_data?: Json | null
          occurred_at?: string
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_errors: {
        Row: {
          error_text: string | null
          function_name: string | null
          id: number
          occurred_at: string
          payload: Json | null
        }
        Insert: {
          error_text?: string | null
          function_name?: string | null
          id?: number
          occurred_at?: string
          payload?: Json | null
        }
        Update: {
          error_text?: string | null
          function_name?: string | null
          id?: number
          occurred_at?: string
          payload?: Json | null
        }
        Relationships: []
      }
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
      collection_tasks: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          assigned_at: string | null
          can_retake: boolean | null
          collector_id: string
          created_at: string
          end_date: string
          id: number
          mfid_id: number
          retake_of: number | null
          season_id: number
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          assigned_at?: string | null
          can_retake?: boolean | null
          collector_id: string
          created_at?: string
          end_date: string
          id?: number
          mfid_id: number
          retake_of?: number | null
          season_id: number
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          assigned_at?: string | null
          can_retake?: boolean | null
          collector_id?: string
          created_at?: string
          end_date?: string
          id?: number
          mfid_id?: number
          retake_of?: number | null
          season_id?: number
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_tasks_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "user_backup_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_mfid_id_fkey"
            columns: ["mfid_id"]
            isOneToOne: false
            referencedRelation: "flattened_field_data"
            referencedColumns: ["mfid_id"]
          },
          {
            foreignKeyName: "collection_tasks_mfid_id_fkey"
            columns: ["mfid_id"]
            isOneToOne: false
            referencedRelation: "mfids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_retake_of_fkey"
            columns: ["retake_of"]
            isOneToOne: false
            referencedRelation: "collection_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_retake_of_fkey"
            columns: ["retake_of"]
            isOneToOne: false
            referencedRelation: "collection_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "latest_season"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons_with_data"
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
            referencedRelation: "collection_details"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "crop_establishments_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "collection_details"
            referencedColumns: ["original_activity_id"]
          },
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
          {
            foreignKeyName: "crop_establishments_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activity_details"
            referencedColumns: ["original_activity_id"]
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
            referencedRelation: "collection_details"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "damage_assessments_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "collection_details"
            referencedColumns: ["original_activity_id"]
          },
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
          {
            foreignKeyName: "damage_assessments_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activity_details"
            referencedColumns: ["original_activity_id"]
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
            referencedRelation: "collection_details"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "fertilization_records_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "collection_details"
            referencedColumns: ["original_activity_id"]
          },
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
          {
            foreignKeyName: "fertilization_records_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activity_details"
            referencedColumns: ["original_activity_id"]
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
          collection_task_id: number | null
          field_id: number
          id: number
          image_urls: Json | null
          monitoring_visit_id: number | null
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
          collection_task_id?: number | null
          field_id: number
          id?: number
          image_urls?: Json | null
          monitoring_visit_id?: number | null
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
          collection_task_id?: number | null
          field_id?: number
          id?: number
          image_urls?: Json | null
          monitoring_visit_id?: number | null
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
            referencedRelation: "user_backup_view"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "field_activities_collection_task_id_fkey"
            columns: ["collection_task_id"]
            isOneToOne: true
            referencedRelation: "collection_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_collection_task_id_fkey"
            columns: ["collection_task_id"]
            isOneToOne: true
            referencedRelation: "collection_tasks"
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
            foreignKeyName: "field_activities_monitoring_visit_id_fkey"
            columns: ["monitoring_visit_id"]
            isOneToOne: false
            referencedRelation: "monitoring_visits"
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
            foreignKeyName: "field_activities_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons_with_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_backup_view"
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
            referencedRelation: "collection_details"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "field_plannings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "collection_details"
            referencedColumns: ["original_activity_id"]
          },
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
          {
            foreignKeyName: "field_plannings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activity_details"
            referencedColumns: ["original_activity_id"]
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
            referencedRelation: "flattened_field_data"
            referencedColumns: ["mfid_id"]
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
            referencedRelation: "collection_details"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "harvest_records_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "collection_details"
            referencedColumns: ["original_activity_id"]
          },
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
          {
            foreignKeyName: "harvest_records_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "field_activity_details"
            referencedColumns: ["original_activity_id"]
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
          id?: number
          soil_moisture_status: string
        }
        Update: {
          avg_plant_height?: number | null
          crop_stage?: string
          date_monitored?: string
          id?: number
          soil_moisture_status?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          is_read: boolean | null
          message: string
          related_entity_id: string | null
          target_role: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          message: string
          related_entity_id?: string | null
          target_role?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          message?: string
          related_entity_id?: string | null
          target_role?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_backup_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      predicted_yields: {
        Row: {
          generated_at: string
          id: number
          mfid_id: number
          predicted_yield_t_ha: number
          season_id: number
        }
        Insert: {
          generated_at?: string
          id?: number
          mfid_id: number
          predicted_yield_t_ha: number
          season_id: number
        }
        Update: {
          generated_at?: string
          id?: number
          mfid_id?: number
          predicted_yield_t_ha?: number
          season_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "predicted_yields_mfid_id_fkey"
            columns: ["mfid_id"]
            isOneToOne: false
            referencedRelation: "flattened_field_data"
            referencedColumns: ["mfid_id"]
          },
          {
            foreignKeyName: "predicted_yields_mfid_id_fkey"
            columns: ["mfid_id"]
            isOneToOne: false
            referencedRelation: "mfids"
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
          {
            foreignKeyName: "predicted_yields_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons_with_data"
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
      system_audit_logs: {
        Row: {
          action: string | null
          details: Json | null
          event_type: string
          id: number
          occurred_at: string
          record_id: string | null
          table_name: string | null
          target_user_id: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          details?: Json | null
          event_type: string
          id?: number
          occurred_at?: string
          record_id?: string | null
          table_name?: string | null
          target_user_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          details?: Json | null
          event_type?: string
          id?: number
          occurred_at?: string
          record_id?: string | null
          table_name?: string | null
          target_user_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          date_of_birth: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          first_name: string
          id: string
          is_active?: boolean
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      activity_logs_view: {
        Row: {
          action: string | null
          details: Json | null
          event_type: string | null
          id: number | null
          new_data: Json | null
          occurred_at: string | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: []
      }
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
      collection_details: {
        Row: {
          activity_id: number | null
          activity_type: Database["public"]["Enums"]["activity_type"] | null
          assigned_at: string | null
          barangay: string | null
          can_retake: boolean | null
          city_municipality: string | null
          collected_at: string | null
          collected_by: string | null
          collector_id: string | null
          collector_name: string | null
          created_at: string | null
          dependency_data: Json | null
          end_date: string | null
          farmer_name: string | null
          full_address: string | null
          id: number | null
          image_urls: Json | null
          is_overdue: boolean | null
          is_retake: boolean | null
          mfid: string | null
          mfid_id: number | null
          original_activity_id: number | null
          province: string | null
          remarks: string | null
          retake_of: number | null
          season_end_date: string | null
          season_id: number | null
          season_start_date: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          verified_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_tasks_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "user_backup_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_mfid_id_fkey"
            columns: ["mfid_id"]
            isOneToOne: false
            referencedRelation: "flattened_field_data"
            referencedColumns: ["mfid_id"]
          },
          {
            foreignKeyName: "collection_tasks_mfid_id_fkey"
            columns: ["mfid_id"]
            isOneToOne: false
            referencedRelation: "mfids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_retake_of_fkey"
            columns: ["retake_of"]
            isOneToOne: false
            referencedRelation: "collection_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_retake_of_fkey"
            columns: ["retake_of"]
            isOneToOne: false
            referencedRelation: "collection_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "latest_season"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_tasks_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons_with_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "user_backup_view"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "field_activities_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_backup_view"
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
      field_activity_details: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"] | null
          barangay: string | null
          collected_at: string | null
          collected_by: Json | null
          collection_task_id: number | null
          farmer_name: string | null
          field_id: number | null
          form_data: Json | null
          id: number | null
          image_urls: Json | null
          is_retake: boolean | null
          mfid: string | null
          municipality: string | null
          original_activity_id: number | null
          province: string | null
          remarks: string | null
          season_id: number | null
          season_year: string | null
          semester: Database["public"]["Enums"]["semester"] | null
          synced_at: string | null
          updated_at: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          verified_by: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "field_activities_collection_task_id_fkey"
            columns: ["collection_task_id"]
            isOneToOne: true
            referencedRelation: "collection_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_activities_collection_task_id_fkey"
            columns: ["collection_task_id"]
            isOneToOne: true
            referencedRelation: "collection_tasks"
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
            foreignKeyName: "field_activities_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons_with_data"
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
      flattened_field_data: {
        Row: {
          actual_crop_establishment_date: string | null
          actual_crop_establishment_method: string | null
          affected_area_ha: number | null
          amount_applied_1: number | null
          amount_applied_2: number | null
          amount_applied_3: number | null
          amount_unit_1: string | null
          amount_unit_2: string | null
          amount_unit_3: string | null
          applied_area_sqm: number | null
          area_harvested_ha: number | null
          average_number_of_plants: number | null
          avg_bag_weight_kg: number | null
          bags_harvested: number | null
          barangay: string | null
          brand_1: string | null
          brand_2: string | null
          brand_3: string | null
          cause: string | null
          cellphone_no: string | null
          crop_planted: string | null
          crop_stage: string | null
          crop_stage_on_application_1: string | null
          crop_stage_on_application_2: string | null
          crop_stage_on_application_3: string | null
          crop_status: string | null
          current_field_condition: string | null
          date_of_birth: string | null
          direct_seeding_method: string | null
          distance_between_plant_row_1: number | null
          distance_between_plant_row_2: number | null
          distance_between_plant_row_3: number | null
          distance_within_plant_row_1: number | null
          distance_within_plant_row_2: number | null
          distance_within_plant_row_3: number | null
          ecosystem: string | null
          est_crop_establishment_date: string | null
          est_crop_establishment_method: string | null
          fertilizer_type_1: string | null
          fertilizer_type_2: string | null
          fertilizer_type_3: string | null
          first_name: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          gps_latitude: number | null
          gps_longitude: number | null
          harvest_date: string | null
          harvesting_method:
            | Database["public"]["Enums"]["harvesting_method"]
            | null
          irrigation_supply:
            | Database["public"]["Enums"]["irrigation_supply"]
            | null
          land_preparation_start_date: string | null
          last_name: string | null
          m1_collected_at: string | null
          m1_collected_by: string | null
          m2_collected_at: string | null
          m2_collected_by: string | null
          m3_collected_at: string | null
          m3_collected_by: string | null
          m4_collected_at: string | null
          m4_collected_by: string | null
          m6_collected_at: string | null
          m6_collected_by: string | null
          m6_soil_type: string | null
          mfid: string | null
          mfid_id: number | null
          monitoring_field_area_sqm: number | null
          municity: string | null
          nitrogen_content_pct_1: number | null
          nitrogen_content_pct_2: number | null
          nitrogen_content_pct_3: number | null
          num_plants_1: number | null
          num_plants_2: number | null
          num_plants_3: number | null
          observed_pest: string | null
          phosphorus_content_pct_1: number | null
          phosphorus_content_pct_2: number | null
          phosphorus_content_pct_3: number | null
          potassium_content_pct_1: number | null
          potassium_content_pct_2: number | null
          potassium_content_pct_3: number | null
          province: string | null
          rice_variety: string | null
          rice_variety_maturity_duration: number | null
          rice_variety_no: string | null
          season_id: number | null
          seed_class: string | null
          seeding_rate_kg_ha: number | null
          seedling_age_at_transplanting: number | null
          severity: string | null
          soil_problem: string | null
          soil_type: string | null
          source_of_good_seeds: string | null
          source_of_irrigation: string | null
          sowing_date: string | null
          total_field_area_ha: number | null
          type_of_irrigation: string | null
        }
        Relationships: [
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
            foreignKeyName: "field_activities_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons_with_data"
            referencedColumns: ["id"]
          },
        ]
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
          coordinates: string | null
          created_at: string | null
          farmer_cellphone_no: string | null
          farmer_date_of_birth: string | null
          farmer_gender: Database["public"]["Enums"]["gender"] | null
          farmer_name: string | null
          mfid: string | null
          province: string | null
          status: string | null
          used_at: string | null
        }
        Relationships: []
      }
      seasons_with_data: {
        Row: {
          end_date: string | null
          id: number | null
          season_year: string | null
          semester: Database["public"]["Enums"]["semester"] | null
          start_date: string | null
        }
        Relationships: []
      }
      system_audit_logs_view: {
        Row: {
          action: string | null
          details: Json | null
          event_type: string | null
          id: number | null
          occurred_at: string | null
          record_id: string | null
          table_name: string | null
          target_user_email: string | null
          target_user_id: string | null
          target_user_name: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: []
      }
      user_backup_view: {
        Row: {
          auth_created_at: string | null
          auth_updated_at: string | null
          date_of_birth: string | null
          email: string | null
          encrypted_password: string | null
          first_name: string | null
          id: string | null
          is_active: boolean | null
          last_name: string | null
          last_sign_in_at: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          user_created_at: string | null
          user_updated_at: string | null
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
          is_active: boolean | null
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
      create_field_with_new_mfid: {
        Args: {
          p_barangay_id: number
          p_farmer_id: number
          p_location?: unknown
          p_municity: string
          p_province: string
        }
        Returns: number
      }
      create_mfid: {
        Args: {
          p_barangay_name?: string
          p_farmer_cellphone?: string
          p_farmer_dob?: string
          p_farmer_first_name?: string
          p_farmer_gender?: Database["public"]["Enums"]["gender"]
          p_farmer_last_name?: string
          p_municity: string
          p_province: string
        }
        Returns: string
      }
      create_seed_user: {
        Args: {
          p_created_at?: string
          p_date_of_birth: string
          p_email: string
          p_first_name: string
          p_id: string
          p_is_active?: boolean
          p_last_name: string
          p_password: string
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
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
      get_available_locations: { Args: { p_season_id?: number }; Returns: Json }
      get_available_locations_for_predictions: {
        Args: { p_season_id?: number }
        Returns: Json
      }
      get_mfid_location: {
        Args: { p_mfid: string }
        Returns: {
          municipality: string
          province: string
        }[]
      }
      get_planting_season_for_harvest: {
        Args: { p_field_id: number; p_harvest_date: string }
        Returns: number
      }
      get_rice_varieties_for_predictions: {
        Args: {
          p_municipality?: string
          p_province?: string
          p_season_id?: number
        }
        Returns: Json
      }
      get_soil_types_for_predictions: {
        Args: {
          p_municipality?: string
          p_province?: string
          p_season_id?: number
        }
        Returns: Json
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
      has_new_forms: {
        Args: { p_updated_after: string; p_user_id: string }
        Returns: boolean
      }
      has_new_tasks: {
        Args: { p_updated_after: string; p_user_id: string }
        Returns: boolean
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
      predicted_yield_forecast: {
        Args: {
          p_barangay?: string
          p_method?: string
          p_municipality?: string
          p_province?: string
          p_rice_variety_name?: string
          p_season_id?: number
          p_soil_type?: string
        }
        Returns: Json
      }
      province_yields: { Args: { p_season_id?: number }; Returns: Json }
      reset_sequence: { Args: { table_name: string }; Returns: undefined }
      restore_backup: { Args: { p_backup: Json }; Returns: Json }
      rice_variety_summary: { Args: { p_season_id?: number }; Returns: Json }
      summary_form_count: { Args: { p_season_id?: number }; Returns: Json }
      summary_form_progress: { Args: { p_season_id?: number }; Returns: Json }
      sync_auth_audit_entries: { Args: never; Returns: number }
      trend_data_collection: { Args: { p_season_id?: number }; Returns: Json }
      trend_overall_yield: { Args: { p_season_id?: number }; Returns: Json }
      upload_cultural_management: { Args: { data: Json }; Returns: number }
      upload_damage_assessment: { Args: { data: Json }; Returns: number }
      upload_field_data: { Args: { data: Json }; Returns: number }
      upload_form_data: { Args: { data: Json }; Returns: number }
      upload_nutrient_management: { Args: { data: Json }; Returns: number }
      upload_production: { Args: { data: Json }; Returns: number }
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
      activity_type:
        | "field-data"
        | "cultural-management"
        | "nutrient-management"
        | "production"
        | "monitoring-visit"
        | "damage-assessment"
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
  public: {
    Enums: {
      activity_type: [
        "field-data",
        "cultural-management",
        "nutrient-management",
        "production",
        "monitoring-visit",
        "damage-assessment",
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

