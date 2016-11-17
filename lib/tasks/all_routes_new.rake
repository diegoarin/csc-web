require 'csv'

task :all_routes_new => :environment do
  CSV.foreach('data/routes_new.csv', :headers => true, :col_sep => ';') do |row|
    # year = row['Fecha'].slice(0, 4)
    # month = row['Fecha'].slice(4,2)
    # day = row['Fecha'].slice(6,2)
    # date_time = DateTime.parse(year + '-' + month + '-' + day)
    order_id = row['IdPedido']
    dispatcher_id = row['Camion']
    route_id = row['IdRecorrido']

    #Obtengo objetos
    if Route.exists?(cr: route_id)
      route = Route.where(cr: route_id).first
    else
      route = Route.new(start: DateTime.now, dispatcher_id: dispatcher_id, cr: route_id)
      route.save!
    end

    #Ahora me fijo si existe un pedido con este id, si existe creo un nuevo route client para esta ruta y ese cliente
    if Order.exists?(cr: order_id)# TODO: Estado?
      order = Order.where(cr: order_id).first

      route_clients = route.route_clients
      exist = false
      route_clients.each do |route_client|
        if route_client.client_id == order.client_id
          exist = true
          route_client.orders << order
          break
        end
      end
      if !exist
        route_client = RouteClient.new(route_id: route.id, client_id: order.client_id, date: DateTime.now)
        route_client.save!
        route_client.orders << order
        route.route_clients << route_client
      end
    end
  end
end
