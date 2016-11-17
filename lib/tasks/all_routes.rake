require 'csv'

task :all_routes => :environment do
  CSV.foreach('data/historicos.csv', :headers => true, :col_sep => ';') do |row|
    year = row['Fecha'].slice(0, 4)
    month = row['Fecha'].slice(4,2)
    day = row['Fecha'].slice(6,2)
    #Ver si nos pueden mandar un 0 cuando la hora es menor a 10
    if row['Hora'].length == 3
        hour = row['Hora'].slice(0,1)
        minute = row['Hora'].slice(1,2)
    else
        hour = row['Hora'].slice(0,2)
        minute = row['Hora'].slice(2,2)
    end
    date_time = DateTime.parse(year + '-' + month + '-' + day + ' ' + hour + ':' + minute)
    order_id = row['Documento']
    client_id = row['Cliente']
    #client_name = row['Nombre']
    user = row['Usuario']
    action = row['Accion']
    status = row['Estado']

    #Obtengo objetos
    client = Client.find_by_cr(client_id)
    order = Order.find_by_cr(order_id)
    #dispather = Dispatcher.find_by_cr(dispatcher_id)

    #Random para que asigne pedidos a los distintos transportistas
    random_dispatcher_number = (1...10).sort_by{rand}[1]

    if Route.exists?(dispatcher_id: random_dispatcher_number)
      route = Route.find_by_dispatcher_id(random_dispatcher_number)
    else
      route = Route.new(start: DateTime.now, dispatcher_id: random_dispatcher_number)
      route.save!
    end

    route_clients = route.route_clients
    exist = false
    route_clients.each do |route_client|
      if route_client.client_id == client.id
        exist = true
        route_client.orders << order
        break
      end
    end
    if !exist
      route_client = RouteClient.new(route_id: route.id, client_id: client.id, date: DateTime.now)
      route_client.save!
      route_client.orders << order
      route.route_clients << route_client
    end

  end
end
