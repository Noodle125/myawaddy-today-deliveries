export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      active_users: {
        Row: {
          created_at: string | null
          id: string
          last_active: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_active?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_active?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ad_deliveries: {
        Row: {
          ad_id: string
          bot_id: string
          delivered_at: string
          id: string
          user_telegram_id: string
        }
        Insert: {
          ad_id: string
          bot_id: string
          delivered_at?: string
          id?: string
          user_telegram_id: string
        }
        Update: {
          ad_id?: string
          bot_id?: string
          delivered_at?: string
          id?: string
          user_telegram_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_deliveries_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_deliveries_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ads: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          send_to_all_free_bots: boolean | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          send_to_all_free_bots?: boolean | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          send_to_all_free_bots?: boolean | null
          title?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          is_important: boolean | null
          is_published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          is_published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          category: string
          content: string
          created_at: string | null
          excerpt: string
          id: string
          image_url: string | null
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          excerpt: string
          id?: string
          image_url?: string | null
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string
          id?: string
          image_url?: string | null
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bot_conversations: {
        Row: {
          bot_id: string
          created_at: string
          id: string
          message_text: string
          response_text: string | null
          user_telegram_id: string
        }
        Insert: {
          bot_id: string
          created_at?: string
          id?: string
          message_text: string
          response_text?: string | null
          user_telegram_id: string
        }
        Update: {
          bot_id?: string
          created_at?: string
          id?: string
          message_text?: string
          response_text?: string | null
          user_telegram_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_conversations_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_feeds: {
        Row: {
          bot_id: string
          channel_username: string
          created_at: string
          id: string
          is_active: boolean | null
          last_posted_at: string | null
          post_format: string | null
          source_type: string
          source_url: string
        }
        Insert: {
          bot_id: string
          channel_username: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_posted_at?: string | null
          post_format?: string | null
          source_type: string
          source_url: string
        }
        Update: {
          bot_id?: string
          channel_username?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_posted_at?: string | null
          post_format?: string | null
          source_type?: string
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_feeds_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_games: {
        Row: {
          best_score: number | null
          bot_id: string
          created_at: string
          game_type: string
          games_played: number | null
          id: string
          score: number | null
          updated_at: string
          user_telegram_id: string
        }
        Insert: {
          best_score?: number | null
          bot_id: string
          created_at?: string
          game_type: string
          games_played?: number | null
          id?: string
          score?: number | null
          updated_at?: string
          user_telegram_id: string
        }
        Update: {
          best_score?: number | null
          bot_id?: string
          created_at?: string
          game_type?: string
          games_played?: number | null
          id?: string
          score?: number | null
          updated_at?: string
          user_telegram_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_games_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_giveaway_participants: {
        Row: {
          giveaway_id: string
          id: string
          joined_at: string
          referral_count: number | null
          user_telegram_id: string
          username: string | null
        }
        Insert: {
          giveaway_id: string
          id?: string
          joined_at?: string
          referral_count?: number | null
          user_telegram_id: string
          username?: string | null
        }
        Update: {
          giveaway_id?: string
          id?: string
          joined_at?: string
          referral_count?: number | null
          user_telegram_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_giveaway_participants_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "bot_giveaways"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_giveaways: {
        Row: {
          bot_id: string
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          max_participants: number | null
          prize: string
          require_membership: boolean | null
          required_channels: string[] | null
          title: string
        }
        Insert: {
          bot_id: string
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          prize: string
          require_membership?: boolean | null
          required_channels?: string[] | null
          title: string
        }
        Update: {
          bot_id?: string
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          prize?: string
          require_membership?: boolean | null
          required_channels?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_giveaways_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_notes: {
        Row: {
          bot_id: string
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_telegram_id: string
        }
        Insert: {
          bot_id: string
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_telegram_id: string
        }
        Update: {
          bot_id?: string
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_telegram_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_notes_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bots: {
        Row: {
          active_ai_api: string | null
          ai_api_type: string | null
          bot_name: string
          bot_settings: Json | null
          bot_type: string
          created_at: string
          deepseek_key: string | null
          expires_at: string
          gemini_key: string | null
          id: string
          is_active: boolean | null
          openai_key: string | null
          telegram_bot_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_ai_api?: string | null
          ai_api_type?: string | null
          bot_name: string
          bot_settings?: Json | null
          bot_type: string
          created_at?: string
          deepseek_key?: string | null
          expires_at: string
          gemini_key?: string | null
          id?: string
          is_active?: boolean | null
          openai_key?: string | null
          telegram_bot_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_ai_api?: string | null
          ai_api_type?: string | null
          bot_name?: string
          bot_settings?: Json | null
          bot_type?: string
          created_at?: string
          deepseek_key?: string | null
          expires_at?: string
          gemini_key?: string | null
          id?: string
          is_active?: boolean | null
          openai_key?: string | null
          telegram_bot_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_owners: {
        Row: {
          business_name: string
          created_at: string
          id: string
          logo_url: string | null
          telegram_alerts_enabled: boolean | null
          telegram_bot_token: string | null
          telegram_chat_id: string | null
          theme_color: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          business_name: string
          created_at?: string
          id?: string
          logo_url?: string | null
          telegram_alerts_enabled?: boolean | null
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          theme_color?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          business_name?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          telegram_alerts_enabled?: boolean | null
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          theme_color?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      cake_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      cake_orders: {
        Row: {
          cake_id: string
          created_at: string
          customer_name: string
          delivery_address: string
          id: string
          phone_number: string
          special_instructions: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cake_id: string
          created_at?: string
          customer_name: string
          delivery_address: string
          id?: string
          phone_number: string
          special_instructions?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cake_id?: string
          created_at?: string
          customer_name?: string
          delivery_address?: string
          id?: string
          phone_number?: string
          special_instructions?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cake_orders_cake_id_fkey"
            columns: ["cake_id"]
            isOneToOne: false
            referencedRelation: "cakes"
            referencedColumns: ["id"]
          },
        ]
      }
      cakes: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_available: boolean
          is_featured: boolean
          name: string
          price: number
          slug: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_available?: boolean
          is_featured?: boolean
          name: string
          price: number
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_available?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cakes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "cake_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      car_orders: {
        Row: {
          created_at: string
          from_location: string
          id: string
          is_city_trip: boolean
          location_type: string
          name: string
          people_count: number
          price: number
          status: string
          telegram_username: string
          to_location: string
          trip_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_location: string
          id?: string
          is_city_trip?: boolean
          location_type: string
          name: string
          people_count: number
          price: number
          status?: string
          telegram_username: string
          to_location: string
          trip_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_location?: string
          id?: string
          is_city_trip?: boolean
          location_type?: string
          name?: string
          people_count?: number
          price?: number
          status?: string
          telegram_username?: string
          to_location?: string
          trip_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cashback_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_used: boolean | null
          type: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_used?: boolean | null
          type: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_used?: boolean | null
          type?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_categories_type"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "category_types"
            referencedColumns: ["name"]
          },
        ]
      }
      category_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      exchange_rate_history: {
        Row: {
          buy_change: number | null
          buy_rate: number
          created_at: string
          currency: string
          id: string
          sell_change: number | null
          sell_rate: number
        }
        Insert: {
          buy_change?: number | null
          buy_rate: number
          created_at?: string
          currency: string
          id?: string
          sell_change?: number | null
          sell_rate: number
        }
        Update: {
          buy_change?: number | null
          buy_rate?: number
          created_at?: string
          currency?: string
          id?: string
          sell_change?: number | null
          sell_rate?: number
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          buy_rate: string
          currency: string
          id: string
          sell_rate: string
          updated_at: string | null
        }
        Insert: {
          buy_rate: string
          currency: string
          id?: string
          sell_rate: string
          updated_at?: string | null
        }
        Update: {
          buy_rate?: string
          currency?: string
          id?: string
          sell_rate?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string | null
          id: string
          name: string
          path: string
          size: number
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          path: string
          size: number
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          path?: string
          size?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      game_players: {
        Row: {
          id: string
          joined_at: string | null
          room_id: string | null
          symbol: string
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          room_id?: string | null
          symbol: string
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          room_id?: string | null
          symbol?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rooms: {
        Row: {
          board: string[] | null
          code: string
          created_at: string | null
          current_turn: string | null
          difficulty: string | null
          id: string
          mode: string
          status: string
          updated_at: string | null
          winner: string | null
        }
        Insert: {
          board?: string[] | null
          code: string
          created_at?: string | null
          current_turn?: string | null
          difficulty?: string | null
          id?: string
          mode: string
          status?: string
          updated_at?: string | null
          winner?: string | null
        }
        Update: {
          board?: string[] | null
          code?: string
          created_at?: string | null
          current_turn?: string | null
          difficulty?: string | null
          id?: string
          mode?: string
          status?: string
          updated_at?: string | null
          winner?: string | null
        }
        Relationships: []
      }
      gold_prices: {
        Row: {
          category: string
          change: number
          id: string
          price: number
          type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          change: number
          id?: string
          price: number
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          change?: number
          id?: string
          price?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          accuracy: number
          created_at: string | null
          id: string
          language: string
          mistakes: number
          mode: string
          overall_score: number | null
          username: string
          wpm: number
        }
        Insert: {
          accuracy: number
          created_at?: string | null
          id?: string
          language: string
          mistakes?: number
          mode: string
          overall_score?: number | null
          username: string
          wpm: number
        }
        Update: {
          accuracy?: number
          created_at?: string | null
          id?: string
          language?: string
          mistakes?: number
          mode?: string
          overall_score?: number | null
          username?: string
          wpm?: number
        }
        Relationships: []
      }
      lottery_results_2d: {
        Row: {
          created_at: string | null
          date: string
          id: string
          result_number: string
          set_index: number
          time: string
          updated_at: string | null
          volume: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          result_number: string
          set_index: number
          time: string
          updated_at?: string | null
          volume: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          result_number?: string
          set_index?: number
          time?: string
          updated_at?: string | null
          volume?: number
        }
        Relationships: []
      }
      lottery_results_3d: {
        Row: {
          created_at: string | null
          date: string
          id: string
          result_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          result_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          result_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          business_owner_id: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          business_owner_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          business_owner_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_business_owner_id_fkey"
            columns: ["business_owner_id"]
            isOneToOne: false
            referencedRelation: "business_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_business_owner_id_fkey"
            columns: ["business_owner_id"]
            isOneToOne: false
            referencedRelation: "business_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_orders: {
        Row: {
          business_owner_id: string
          created_at: string
          customer_name: string
          id: string
          items: Json
          status: string
          table_number: string
          total: number
          updated_at: string
        }
        Insert: {
          business_owner_id: string
          created_at?: string
          customer_name: string
          id?: string
          items: Json
          status?: string
          table_number: string
          total: number
          updated_at?: string
        }
        Update: {
          business_owner_id?: string
          created_at?: string
          customer_name?: string
          id?: string
          items?: Json
          status?: string
          table_number?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_orders_business_owner_id_fkey"
            columns: ["business_owner_id"]
            isOneToOne: false
            referencedRelation: "business_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_orders_business_owner_id_fkey"
            columns: ["business_owner_id"]
            isOneToOne: false
            referencedRelation: "business_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_status: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_status_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          reply_to: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          reply_to?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          reply_to?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          published: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          published?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          published?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_address: string | null
          id: string
          order_type: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          id?: string
          order_type: string
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          id?: string
          order_type?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          games_lost: number | null
          games_played: number | null
          games_won: number | null
          id: string
          points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          games_lost?: number | null
          games_played?: number | null
          games_won?: number | null
          id?: string
          points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          games_lost?: number | null
          games_played?: number | null
          games_won?: number | null
          id?: string
          points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      playlists: {
        Row: {
          artist: string
          artwork_url: string | null
          created_at: string | null
          id: string
          order: number
          title: string
          url: string
        }
        Insert: {
          artist: string
          artwork_url?: string | null
          created_at?: string | null
          id?: string
          order: number
          title: string
          url: string
        }
        Update: {
          artist?: string
          artwork_url?: string | null
          created_at?: string | null
          id?: string
          order?: number
          title?: string
          url?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          media_type: string | null
          media_url: string | null
          published: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          published?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          published?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          type: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          type: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_type"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "category_types"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          phone_number: string | null
          profile_picture_url: string | null
          role: string
          telegram_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone_number?: string | null
          profile_picture_url?: string | null
          role?: string
          telegram_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone_number?: string | null
          profile_picture_url?: string | null
          role?: string
          telegram_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          id: string
          product_id: string
          rating: number
          review: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          rating: number
          review?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          review?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      set_holidays: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      typing_status: {
        Row: {
          id: string
          last_typed: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          last_typed?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          last_typed?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          codes_collected: number | null
          codes_required: number
          created_at: string
          id: string
          is_redeemed: boolean | null
          redeemed_at: string | null
          reward_type: string
          user_id: string
        }
        Insert: {
          codes_collected?: number | null
          codes_required: number
          created_at?: string
          id?: string
          is_redeemed?: boolean | null
          redeemed_at?: string | null
          reward_type: string
          user_id: string
        }
        Update: {
          codes_collected?: number | null
          codes_required?: number
          created_at?: string
          id?: string
          is_redeemed?: boolean | null
          redeemed_at?: string | null
          reward_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          gender: string | null
          id: string
          is_premium: boolean | null
          payment_status: string | null
          premium_expiry: string | null
          relationship_status: string | null
          username: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          gender?: string | null
          id: string
          is_premium?: boolean | null
          payment_status?: string | null
          premium_expiry?: string | null
          relationship_status?: string | null
          username?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          gender?: string | null
          id?: string
          is_premium?: boolean | null
          payment_status?: string | null
          premium_expiry?: string | null
          relationship_status?: string | null
          username?: string | null
        }
        Relationships: []
      }
      visitor_notes: {
        Row: {
          author: string
          content: string
          created_at: string | null
          id: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string | null
          id?: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      business_directory: {
        Row: {
          business_name: string | null
          created_at: string | null
          id: string | null
          logo_url: string | null
          theme_color: string | null
          username: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          id?: string | null
          logo_url?: string | null
          theme_color?: string | null
          username?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          id?: string | null
          logo_url?: string | null
          theme_color?: string | null
          username?: string | null
        }
        Relationships: []
      }
      game_leaderboard: {
        Row: {
          games_lost: number | null
          games_played: number | null
          games_won: number | null
          points: number | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bulk_update_gold_prices: {
        Args: { prices: Json[] }
        Returns: undefined
      }
      bulk_update_rates: {
        Args: { rates: Json[] }
        Returns: undefined
      }
      cleanup_inactive_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      count_user_active_bots: {
        Args: { user_uuid: string }
        Returns: number
      }
      extend_bot_expiry: {
        Args: { bot_uuid: string; days: number }
        Returns: undefined
      }
      get_active_users_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_bot_by_token: {
        Args: { bot_token: string }
        Returns: {
          active_ai_api: string
          bot_name: string
          bot_settings: Json
          bot_type: string
          deepseek_key: string
          expires_at: string
          gemini_key: string
          id: string
          is_active: boolean
          openai_key: string
          user_id: string
        }[]
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_user_premium: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      safe_delete_category: {
        Args: { category_id: string }
        Returns: Json
      }
      safe_delete_product: {
        Args: { product_id: string }
        Returns: Json
      }
      should_inject_ads: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
