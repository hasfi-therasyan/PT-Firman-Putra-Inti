type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          company_address: string | null
          company_bank_account: string | null
          company_name: string
          company_npwp: string | null
          created_at: string
          default_payment_terms_days: number
          id: string
          invoice_number_format: string
          kode_unik_enabled: boolean
          last_gmail_history_id: string | null
          last_gmail_synced_at: string | null
          reconciliation_tolerance: number
          updated_at: string
        }
        Insert: {
          company_address?: string | null
          company_bank_account?: string | null
          company_name?: string
          company_npwp?: string | null
          created_at?: string
          default_payment_terms_days?: number
          id?: string
          invoice_number_format?: string
          kode_unik_enabled?: boolean
          last_gmail_history_id?: string | null
          last_gmail_synced_at?: string | null
          reconciliation_tolerance?: number
          updated_at?: string
        }
        Update: {
          company_address?: string | null
          company_bank_account?: string | null
          company_name?: string
          company_npwp?: string | null
          created_at?: string
          default_payment_terms_days?: number
          id?: string
          invoice_number_format?: string
          kode_unik_enabled?: boolean
          last_gmail_history_id?: string | null
          last_gmail_synced_at?: string | null
          reconciliation_tolerance?: number
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          reason: string | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      company_accounts: {
        Row: {
          bank: string
          created_at: string
          id: string
          is_active: boolean
          nama_rekening: string
          nomor_rekening_masked: string
          prefix: string
          updated_at: string
        }
        Insert: {
          bank?: string
          created_at?: string
          id?: string
          is_active?: boolean
          nama_rekening: string
          nomor_rekening_masked: string
          prefix: string
          updated_at?: string
        }
        Update: {
          bank?: string
          created_at?: string
          id?: string
          is_active?: boolean
          nama_rekening?: string
          nomor_rekening_masked?: string
          prefix?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_schedules: {
        Row: {
          catatan: string | null
          created_at: string
          created_by: string | null
          id: string
          jumlah_tabung: string | null
          nomor_kendaraan: string | null
          pangkalan_id: string
          sopir: string | null
          status: string | null
          tanggal_aktual: string | null
          tanggal_rencana: string
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          jumlah_tabung?: string | null
          nomor_kendaraan?: string | null
          pangkalan_id: string
          sopir?: string | null
          status?: string | null
          tanggal_aktual?: string | null
          tanggal_rencana: string
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          jumlah_tabung?: string | null
          nomor_kendaraan?: string | null
          pangkalan_id?: string
          sopir?: string | null
          status?: string | null
          tanggal_aktual?: string | null
          tanggal_rencana?: string
          updated_at?: string
        }
        Relationships: [{ foreignKeyName: "delivery_schedules_pangkalan_id_fkey"; columns: ["pangkalan_id"]; isOneToOne: false; referencedRelation: "pangkalan"; referencedColumns: ["id"] }]
      }
      invoice_items: {
        Row: {
          created_at: string
          deskripsi: string
          id: string
          invoice_id: string
          line_total: number | null
          qty: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          deskripsi: string
          id?: string
          invoice_id: string
          qty: number
          unit_price: number
        }
        Update: {
          created_at?: string
          deskripsi?: string
          id?: string
          invoice_id?: string
          qty?: number
          unit_price?: number
        }
        Relationships: [{ foreignKeyName: "invoice_items_invoice_id_fkey"; columns: ["invoice_id"]; isOneToOne: false; referencedRelation: "invoices"; referencedColumns: ["id"] }]
      }
      invoices: {
        Row: {
          created_at: string
          created_by: string | null
          delivery_schedule_id: string | null
          id: string
          kode_unik: number
          nomor_invoice: string
          pangkalan_id: string
          penyesuaian: number
          sisa: number | null
          status: string | null
          subtotal: number
          tanggal_invoice: string
          tanggal_jatuh_tempo: string
          total: number
          total_dibayar: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivery_schedule_id?: string | null
          id?: string
          kode_unik?: number
          nomor_invoice: string
          pangkalan_id: string
          penyesuaian?: number
          status?: string | null
          subtotal?: number
          tanggal_invoice?: string
          tanggal_jatuh_tempo: string
          total?: number
          total_dibayar?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivery_schedule_id?: string | null
          id?: string
          kode_unik?: number
          nomor_invoice?: string
          pangkalan_id?: string
          penyesuaian?: number
          status?: string | null
          subtotal?: number
          tanggal_invoice?: string
          tanggal_jatuh_tempo?: string
          total?: number
          total_dibayar?: number
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: "invoices_delivery_schedule_id_fkey"; columns: ["delivery_schedule_id"]; isOneToOne: false; referencedRelation: "delivery_schedules"; referencedColumns: ["id"] },
          { foreignKeyName: "invoices_pangkalan_id_fkey"; columns: ["pangkalan_id"]; isOneToOne: false; referencedRelation: "pangkalan"; referencedColumns: ["id"] }
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean
          judul: string
          pesan: string | null
          read_at: string | null
          severity: string
          tipe: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          judul: string
          pesan?: string | null
          read_at?: string | null
          severity?: string
          tipe: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          judul?: string
          pesan?: string | null
          read_at?: string | null
          severity?: string
          tipe?: string
        }
        Relationships: []
      }
      pangkalan: {
        Row: {
          alamat: string | null
          catatan: string | null
          created_at: string
          created_by: string | null
          harga_per_tabung: number
          id: string
          kecamatan: string | null
          kode: string
          kota: string | null
          kuota_tabung_bulanan: number | null
          nama: string
          nama_pic: string | null
          status: string
          telepon: string | null
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          catatan?: string | null
          created_at?: string
          created_by?: string | null
          harga_per_tabung?: number
          id?: string
          kecamatan?: string | null
          kode: string
          kota?: string | null
          kuota_tabung_bulanan?: number | null
          nama: string
          nama_pic?: string | null
          status?: string
          telepon?: string | null
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          catatan?: string | null
          created_at?: string
          created_by?: string | null
          harga_per_tabung?: number
          id?: string
          kecamatan?: string | null
          kode?: string
          kota?: string | null
          kuota_tabung_bulanan?: number | null
          nama?: string
          nama_pic?: string | null
          status?: string
          telepon?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_matches: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          invoice_id: string
          matched_at: string
          matched_by: string
          metode: string
          nominal_dialokasikan: number
          notes: string | null
          payment_transaction_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          invoice_id: string
          matched_at?: string
          matched_by?: string
          metode: string
          nominal_dialokasikan: number
          notes?: string | null
          payment_transaction_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          invoice_id?: string
          matched_at?: string
          matched_by?: string
          metode?: string
          nominal_dialokasikan?: number
          notes?: string | null
          payment_transaction_id?: string
        }
        Relationships: [
          { foreignKeyName: "payment_matches_invoice_id_fkey"; columns: ["invoice_id"]; isOneToOne: false; referencedRelation: "invoices"; referencedColumns: ["id"] },
          { foreignKeyName: "payment_matches_payment_transaction_id_fkey"; columns: ["payment_transaction_id"]; isOneToOne: false; referencedRelation: "payment_transactions"; referencedColumns: ["id"] }
        ]
      }
      payment_transactions: {
        Row: {
          arah: string
          bank: string
          berita: string | null
          content_hash: string
          created_at: string
          created_by: string | null
          email_received_at: string | null
          gmail_message_id: string | null
          id: string
          jenis: string | null
          nama_pengirim: string | null
          nama_tujuan: string | null
          nominal: number
          parse_errors: Json | null
          parse_status: string
          raw_body: string | null
          raw_subject: string | null
          rekening_pengirim_masked: string | null
          rekening_tujuan_masked: string | null
          sumber: string
          status: string
          status_bank: string | null
          tanggal_transaksi: string | null
          updated_at: string
        }
        Insert: {
          arah: string
          bank?: string
          berita?: string | null
          content_hash: string
          created_at?: string
          created_by?: string | null
          email_received_at?: string | null
          gmail_message_id?: string | null
          id?: string
          jenis?: string | null
          nama_pengirim?: string | null
          nama_tujuan?: string | null
          nominal: number
          parse_errors?: Json | null
          parse_status?: string
          raw_body?: string | null
          raw_subject?: string | null
          rekening_pengirim_masked?: string | null
          rekening_tujuan_masked?: string | null
          sumber?: string
          status?: string
          status_bank?: string | null
          tanggal_transaksi?: string | null
          updated_at?: string
        }
        Update: {
          arah?: string
          bank?: string
          berita?: string | null
          content_hash?: string
          created_at?: string
          created_by?: string | null
          email_received_at?: string | null
          gmail_message_id?: string | null
          id?: string
          jenis?: string | null
          nama_pengirim?: string | null
          nama_tujuan?: string | null
          nominal?: number
          parse_errors?: Json | null
          parse_status?: string
          raw_body?: string | null
          raw_subject?: string | null
          rekening_pengirim_masked?: string | null
          rekening_tujuan_masked?: string | null
          sumber?: string
          status?: string
          status_bank?: string | null
          tanggal_transaksi?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [key: string]: unknown }
    Functions: { [key: string]: unknown }
    Enums: {
      app_role: "owner" | "admin" | "finance" | "auditor" | "pangkalan"
      delivery_status: "draft" | "dijadwalkan" | "dikirim" | "selesai" | "dibatalkan"
      invoice_status: "draft" | "issued" | "partial" | "paid" | "overdue" | "cancelled"
      match_method: "auto_exact" | "auto_kode_unik" | "auto_berita" | "auto_nama" | "manual"
      payment_direction: "masuk" | "keluar"
    }
    CompositeTypes: { [key: string]: unknown }
  }
}
