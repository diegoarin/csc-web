# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160906011158) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "clients", force: :cascade do |t|
    t.integer  "cr"
    t.string   "business"
    t.string   "fantasy"
    t.string   "rut"
    t.string   "address"
    t.string   "phone"
    t.float    "lat"
    t.float    "long"
    t.text     "comment"
    t.string   "qr"
    t.boolean  "active",      default: true
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.integer  "branch_cr"
    t.string   "branch_name"
  end

  add_index "clients", ["cr"], name: "index_clients_on_cr", using: :btree

  create_table "dispatchers", force: :cascade do |t|
    t.string   "name"
    t.string   "phone"
    t.string   "device"
    t.integer  "cr"
    t.boolean  "active",     default: true
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  create_table "order_summaries", force: :cascade do |t|
    t.datetime "event"
    t.integer  "action"
    t.string   "user"
    t.integer  "status"
    t.integer  "client_id"
    t.integer  "order_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "order_summaries", ["client_id"], name: "index_order_summaries_on_client_id", using: :btree
  add_index "order_summaries", ["order_id"], name: "index_order_summaries_on_order_id", using: :btree

  create_table "orders", force: :cascade do |t|
    t.integer  "cr"
    t.datetime "created"
    t.datetime "finalized"
    t.string   "status",          default: "PENDING"
    t.integer  "client_id"
    t.integer  "route_client_id"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
  end

  add_index "orders", ["client_id"], name: "index_orders_on_client_id", using: :btree
  add_index "orders", ["cr"], name: "index_orders_on_cr", using: :btree
  add_index "orders", ["route_client_id"], name: "index_orders_on_route_client_id", using: :btree

  create_table "route_clients", force: :cascade do |t|
    t.integer  "route_id"
    t.integer  "client_id"
    t.string   "status",           default: "PENDING"
    t.datetime "date"
    t.datetime "created_at",                           null: false
    t.datetime "updated_at",                           null: false
    t.integer  "position"
    t.boolean  "near",             default: false
    t.integer  "client_proximity", default: 0
  end

  add_index "route_clients", ["client_id"], name: "index_route_clients_on_client_id", using: :btree
  add_index "route_clients", ["route_id"], name: "index_route_clients_on_route_id", using: :btree

  create_table "route_summaries", force: :cascade do |t|
    t.datetime "event"
    t.integer  "route_id"
    t.integer  "client_id"
    t.string   "client_status"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.string   "event_type"
  end

  create_table "routes", force: :cascade do |t|
    t.datetime "start"
    t.datetime "end"
    t.string   "status",                  default: "PENDING"
    t.integer  "dispatcher_id"
    t.datetime "created_at",                                   null: false
    t.datetime "updated_at",                                   null: false
    t.float    "latitude",                default: -34.873584
    t.float    "longitude",               default: -56.151004
    t.integer  "duration",      limit: 8
    t.datetime "last_update"
    t.integer  "cr"
  end

  add_index "routes", ["dispatcher_id"], name: "index_routes_on_dispatcher_id", using: :btree

  create_table "user_sessions", force: :cascade do |t|
    t.string   "session_id", null: false
    t.text     "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "user_sessions", ["session_id"], name: "index_user_sessions_on_session_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "login",                               null: false
    t.string   "email",                               null: false
    t.string   "name"
    t.boolean  "active",              default: true
    t.boolean  "admin",               default: false
    t.boolean  "adm_users",           default: false
    t.boolean  "adm_clients",         default: false
    t.boolean  "adm_dispatchers",     default: false
    t.boolean  "reports",             default: false
    t.boolean  "queries",             default: true
    t.string   "crypted_password",                    null: false
    t.string   "password_salt",                       null: false
    t.string   "persistence_token",                   null: false
    t.string   "single_access_token",                 null: false
    t.string   "perishable_token",                    null: false
    t.integer  "login_count",         default: 0,     null: false
    t.integer  "failed_login_count",  default: 0,     null: false
    t.datetime "last_request_at"
    t.datetime "current_login_at"
    t.datetime "last_login_at"
    t.string   "current_login_ip"
    t.string   "last_login_ip"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
  end

  add_index "users", ["login"], name: "index_users_on_login", using: :btree
  add_index "users", ["perishable_token"], name: "index_users_on_perishable_token", using: :btree

end
