class CreateDispatchers < ActiveRecord::Migration
  def change
    create_table :dispatchers do |t|
      t.string  :name
      t.string  :phone
      t.string  :device
      t.integer :cr
      t.boolean :active, default: true

      t.timestamps null: false
    end
  end
end
