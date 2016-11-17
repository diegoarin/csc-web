class CreateRouteClients < ActiveRecord::Migration
  def change
    create_table :route_clients do |t|
        t.belongs_to :route, index: true
        t.references :client, index: true
        t.string     :status, default: 'PENDING'
        t.datetime   :date
        
        t.timestamps null: false
    end
  end
end
