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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      account: {
        Row: {
          accessToken: string | null
          accessTokenExpiresAt: string | null
          accountId: string
          createdAt: string
          id: string
          idToken: string | null
          password: string | null
          providerId: string
          refreshToken: string | null
          refreshTokenExpiresAt: string | null
          scope: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId: string
          createdAt?: string
          id: string
          idToken?: string | null
          password?: string | null
          providerId: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt: string
          userId: string
        }
        Update: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId?: string
          createdAt?: string
          id?: string
          idToken?: string | null
          password?: string | null
          providerId?: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      Group: {
        Row: {
          code: string
          createdAt: string
          dailyHour: number
          dailyMinute: number
          deletedAt: string | null
          id: string
          imageUrl: string | null
          maxMembers: number
          name: string
          ownerId: string
          type: Database["public"]["Enums"]["GroupType"]
        }
        Insert: {
          code: string
          createdAt?: string
          dailyHour?: number
          dailyMinute?: number
          deletedAt?: string | null
          id: string
          imageUrl?: string | null
          maxMembers?: number
          name: string
          ownerId: string
          type?: Database["public"]["Enums"]["GroupType"]
        }
        Update: {
          code?: string
          createdAt?: string
          dailyHour?: number
          dailyMinute?: number
          deletedAt?: string | null
          id?: string
          imageUrl?: string | null
          maxMembers?: number
          name?: string
          ownerId?: string
          type?: Database["public"]["Enums"]["GroupType"]
        }
        Relationships: [
          {
            foreignKeyName: "Group_ownerId_fkey"
            columns: ["ownerId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      Membership: {
        Row: {
          avatarUrl: string | null
          createdAt: string
          displayName: string | null
          groupId: string
          id: string
          nickname: string | null
          role: Database["public"]["Enums"]["MembershipRole"]
          status: Database["public"]["Enums"]["MembershipStatus"]
          userId: string
        }
        Insert: {
          avatarUrl?: string | null
          createdAt?: string
          displayName?: string | null
          groupId: string
          id: string
          nickname?: string | null
          role?: Database["public"]["Enums"]["MembershipRole"]
          status?: Database["public"]["Enums"]["MembershipStatus"]
          userId: string
        }
        Update: {
          avatarUrl?: string | null
          createdAt?: string
          displayName?: string | null
          groupId?: string
          id?: string
          nickname?: string | null
          role?: Database["public"]["Enums"]["MembershipRole"]
          status?: Database["public"]["Enums"]["MembershipStatus"]
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Membership_groupId_fkey"
            columns: ["groupId"]
            isOneToOne: false
            referencedRelation: "Group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Membership_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      passkey: {
        Row: {
          aaguid: string | null
          backedUp: boolean
          counter: number
          createdAt: string
          credentialID: string
          deviceType: string
          id: string
          name: string | null
          publicKey: string
          transports: string | null
          userId: string
        }
        Insert: {
          aaguid?: string | null
          backedUp: boolean
          counter: number
          createdAt?: string
          credentialID: string
          deviceType: string
          id: string
          name?: string | null
          publicKey: string
          transports?: string | null
          userId: string
        }
        Update: {
          aaguid?: string | null
          backedUp?: boolean
          counter?: number
          createdAt?: string
          credentialID?: string
          deviceType?: string
          id?: string
          name?: string | null
          publicKey?: string
          transports?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "passkey_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      Prompt: {
        Row: {
          closesAt: string | null
          createdAt: string
          createdBy: string
          deletedAt: string | null
          groupId: string
          id: string
          localDate: string
          opensAt: string
          optionCounts: number[] | null
          options: string[] | null
          resultsFinalizedAt: string | null
          status: Database["public"]["Enums"]["PromptStatus"]
          text: string
          type: Database["public"]["Enums"]["PromptType"]
        }
        Insert: {
          closesAt?: string | null
          createdAt?: string
          createdBy: string
          deletedAt?: string | null
          groupId: string
          id: string
          localDate: string
          opensAt: string
          optionCounts?: number[] | null
          options?: string[] | null
          resultsFinalizedAt?: string | null
          status?: Database["public"]["Enums"]["PromptStatus"]
          text: string
          type: Database["public"]["Enums"]["PromptType"]
        }
        Update: {
          closesAt?: string | null
          createdAt?: string
          createdBy?: string
          deletedAt?: string | null
          groupId?: string
          id?: string
          localDate?: string
          opensAt?: string
          optionCounts?: number[] | null
          options?: string[] | null
          resultsFinalizedAt?: string | null
          status?: Database["public"]["Enums"]["PromptStatus"]
          text?: string
          type?: Database["public"]["Enums"]["PromptType"]
        }
        Relationships: [
          {
            foreignKeyName: "Prompt_createdBy_fkey"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Prompt_groupId_fkey"
            columns: ["groupId"]
            isOneToOne: false
            referencedRelation: "Group"
            referencedColumns: ["id"]
          },
        ]
      }
      session: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          ipAddress: string | null
          token: string
          updatedAt: string
          userAgent: string | null
          userId: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          ipAddress?: string | null
          token: string
          updatedAt: string
          userAgent?: string | null
          userId: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          ipAddress?: string | null
          token?: string
          updatedAt?: string
          userAgent?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      Submission: {
        Row: {
          createdAt: string
          deletedAt: string | null
          editedAt: string | null
          flagged: boolean
          id: string
          isEdited: boolean
          moderationState: Database["public"]["Enums"]["ModerationState"]
          optionIndex: number | null
          promptId: string
          proofId: string | null
          textAnswer: string | null
          updatedAt: string
          userId: string
          voteTargetUserId: string | null
        }
        Insert: {
          createdAt?: string
          deletedAt?: string | null
          editedAt?: string | null
          flagged?: boolean
          id: string
          isEdited?: boolean
          moderationState?: Database["public"]["Enums"]["ModerationState"]
          optionIndex?: number | null
          promptId: string
          proofId?: string | null
          textAnswer?: string | null
          updatedAt: string
          userId: string
          voteTargetUserId?: string | null
        }
        Update: {
          createdAt?: string
          deletedAt?: string | null
          editedAt?: string | null
          flagged?: boolean
          id?: string
          isEdited?: boolean
          moderationState?: Database["public"]["Enums"]["ModerationState"]
          optionIndex?: number | null
          promptId?: string
          proofId?: string | null
          textAnswer?: string | null
          updatedAt?: string
          userId?: string
          voteTargetUserId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Submission_promptId_fkey"
            columns: ["promptId"]
            isOneToOne: false
            referencedRelation: "Prompt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Submission_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Submission_voteTargetUserId_fkey"
            columns: ["voteTargetUserId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          createdAt: string
          email: string | null
          emailVerified: boolean
          id: string
          image: string | null
          name: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email?: string | null
          emailVerified: boolean
          id: string
          image?: string | null
          name?: string | null
          updatedAt: string
        }
        Update: {
          createdAt?: string
          email?: string | null
          emailVerified?: boolean
          id?: string
          image?: string | null
          name?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      verification: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          identifier: string
          updatedAt: string
          value: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          identifier: string
          updatedAt: string
          value: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          identifier?: string
          updatedAt?: string
          value?: string
        }
        Relationships: []
      }
      VerificationToken: {
        Row: {
          expires: string
          identifier: string
          token: string
        }
        Insert: {
          expires: string
          identifier: string
          token: string
        }
        Update: {
          expires?: string
          identifier?: string
          token?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      GroupType: "FRIENDS" | "COUPLE"
      MembershipRole: "OWNER" | "ADMIN" | "MEMBER"
      MembershipStatus: "ACTIVE" | "LEFT" | "BANNED"
      ModerationState: "PENDING" | "APPROVED" | "REJECTED"
      PromptStatus: "SCHEDULED" | "OPEN" | "CLOSED" | "CANCELLED"
      PromptType: "QUESTION" | "VOTE" | "CHALLENGE"
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
      GroupType: ["FRIENDS", "COUPLE"],
      MembershipRole: ["OWNER", "ADMIN", "MEMBER"],
      MembershipStatus: ["ACTIVE", "LEFT", "BANNED"],
      ModerationState: ["PENDING", "APPROVED", "REJECTED"],
      PromptStatus: ["SCHEDULED", "OPEN", "CLOSED", "CANCELLED"],
      PromptType: ["QUESTION", "VOTE", "CHALLENGE"],
    },
  },
} as const
