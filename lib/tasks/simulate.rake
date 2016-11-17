task :simulate => :environment do |t,args| #correr asi: rake simulate[1,2,3]
  #VARIABLES
  route_ids = Array.new
  args.extras.each{|a| route_ids << a}
  client_statuses = ["DELIVERED","DELIVERED","NOT_DELIVERED"]

  route_ids.each do |route_id|
    ############################## START ROUTE
    route = Route.find(route_id)
    #Actualizo recorrido
    route.update_attribute(:status, 'IN_TRANSIT')
    route.update_attribute(:start, DateTime.now)

    route_clients = RouteClient.where(route_id: route.id)

    #Optimizo orden de clientes
    waypoints = "optimize:true"
    route_clients.each do |r|
      client = Client.find(r.client_id)
      waypoints += "|" + client.lat.to_s + "," + client.long.to_s
    end

    url = URI.parse(Rails.configuration.google_directions_url +
    "origin=" + route.latitude.to_s + "," + route.longitude.to_s +
    "&destination=" + Rails.configuration.carrau_location +
    "&waypoints=" + waypoints +
    "&key=" + Rails.configuration.google_api_key)

    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = true

    res = http.start do
      request = Net::HTTP::Get.new(url.request_uri)
      http.request(request)
    end
    response = JSON.parse(res.body)

    if response["routes"] != nil && response["routes"].first["waypoint_order"] != nil
      route_clients.each_with_index do |r, index|
        position = response["routes"].first["waypoint_order"][index]
        r.update_attribute(:position, position)
      end
    end

    #Actualizo route clients
    route_clients.each do |r|
      r.update_attribute(:status, 'IN_TRANSIT')
      #Actualizo pedidos
      orders = Order.where(route_client_id: r.id)
      orders.each do |o|
        o.update_attribute(:status,'IN_TRANSIT')
      end
    end

    #Creo evento de recorrido
    RouteSummary.create(event: DateTime.now, route_id: route_id, event_type: 'START_ROUTE')
    route.save
    ##############################

    ############################## UPDATE CLIENTS
    route_clients.each do |rc|
      client_id = rc.client_id
      update = rand(0...4)
      current_datetime = DateTime.now + (update/24.0)
      client_status = client_statuses.shuffle.first
      rc.update_attribute(:status,client_status)
      rc.update_attribute(:date,current_datetime)
      rc.update_attribute(:near, true)
      rc.update_attribute(:client_proximity, rand(360000...1440000))
      route.update_attribute(:last_update, DateTime.now)

      if rc.save
        #Se actualiza el estado y fecha finalizado de los pedidos del cliente
        orders = Order.where(route_client_id: rc.id)
        orders.each do |o|
          o.update_attribute(:status,client_status)
          if client_status == 'DELIVERED' || client_status == 'NOT_DELIVERED'
            o.update_attribute(:finalized,current_datetime)
          end
        end

        # Se gerera un registro en la traza de eventos de la ruta
        RouteSummary.create(event: current_datetime, route_id: route_id, client_id: client_id, client_status: client_status, event_type: 'UPDATE_CLIENT_STATUS')
      end
    end
    ##############################

    ############################## FINISH ROUTE
    delay = rand(3...8)
    finish_datetime = DateTime.now + (delay/24.0)
    finish_route = Route.find(route_id)
    finish_route.update_attribute(:status, 'FINISHED')
    finish_route.update_attribute(:end, finish_datetime)
    finish_route.update_attribute(:duration, (finish_route.end - finish_route.start)*1000)

    #Se gerera un registro en la traza de eventos de la ruta
    RouteSummary.create(event: finish_datetime, route_id: route_id, event_type: 'END_ROUTE')
    finish_route.save
    ##############################
  end
end
