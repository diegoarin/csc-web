class AddPositionToRouteClients < ActiveRecord::Migration
  def change
    add_column :route_clients, :position, :int
  end
end
