class CreateClients < ActiveRecord::Migration
  def change
    create_table :clients do |t|
      t.integer :cr, index: true
      t.string :business
      t.string :fantasy
      t.string :rut
      t.string :address
      t.string :phone
      t.float :lat
      t.float :long
      t.text :comment
      t.string :qr
      t.boolean :active, default: true

      t.timestamps null: false
    end
  end
end
