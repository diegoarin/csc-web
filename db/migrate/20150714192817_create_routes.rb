class CreateRoutes < ActiveRecord::Migration
  def change
    create_table   :routes do |t|
      t.datetime   :start
      t.datetime   :end
      t.datetime   :duration
      t.string     :status, default: 'PENDING'
      t.references :dispatcher, index: true

      t.timestamps null: false
    end
  end
end
