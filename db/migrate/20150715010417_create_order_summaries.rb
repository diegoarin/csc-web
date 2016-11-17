class CreateOrderSummaries < ActiveRecord::Migration
  def change
    create_table :order_summaries do |t|
      t.datetime :event
      t.integer :action
      t.string :user
      t.integer :status
      t.references :client, index: true
      t.references :order, index: true

      t.timestamps null: false
    end
  end
end
