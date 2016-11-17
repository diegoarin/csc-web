class CreateRouteSummaries < ActiveRecord::Migration
  def change
    create_table :route_summaries do |t|
      t.datetime :event
      t.integer :route_id
      t.integer :client_id
      t.integer :event_type
      t.string :client_status

      t.timestamps null: false
    end
  end
end
