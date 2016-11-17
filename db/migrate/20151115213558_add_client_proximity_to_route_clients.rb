class AddClientProximityToRouteClients < ActiveRecord::Migration
  def change
    add_column :route_clients, :client_proximity, :integer, default: 0
  end
end
