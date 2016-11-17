class RoutesController < ApplicationController
  before_filter :set_route, only: [:show, :update, :destroy]

  def index
    routes = Route.by_start
    routes.each do |route|
      dispatcher = Dispatcher.find(route.dispatcher_id)
      route.dispatcher_name = dispatcher.name
    end
    render json: {data: routes}.to_json(methods: :dispatcher_name)
  end

  def current_routes
    routes = Route.where.not(status: 'FINISHED').order("id ASC")
    routes.each do |route|
      dispatcher = Dispatcher.find(route.dispatcher_id)
      route.dispatcher_name = dispatcher.name
    end
    render json: {data: routes}.to_json(methods: :dispatcher_name)
  end

  def history_routes
    routes = Route.where(status: 'FINISHED').order("id ASC")
    routes.each do |route|
      dispatcher = Dispatcher.find(route.dispatcher_id)
      route.dispatcher_name = dispatcher.name
    end
    render json: {data: routes}.to_json(methods: :dispatcher_name)
  end

  def show
    render json: @routes.to_json
  end

  def create
    route = Route.new(route_params)
    if route.save
      render json: true, status: 201
    else
      render json: route.errors, status: 400
    end
  end

  def update
    @route.update_attributes(route_params)
    if @route.save
      render json: true, status: 200
    else
      render json: @route.errors, status: 400
    end
  end

  def destroy
    if @route.destroy
      render json: true, status: 200
    else
      render json: @route.errors, status: 400
    end
  end

  def set_dispatcher_location
    route = Route.find(params[:route_id])
    route.latitude = params[:lat]
    route.longitude = params[:long]

    calculate_clients_proximity(params[:route_id])

    if route.save
      render json: { data: true }, status: 200
    else
      render json: { error: route.errors }, status: 400
    end
  end

  def get_dispatcher_location
    route = Route.find(params[:route_id])
    latLng = {  latitude: route.latitude,
      longitude: route.longitude }

      render json: { data: latLng }, status: 200
    end

    def route_clients_position
      get_optimized_position()

      render json: { data: true }, status: 200
    end

    def start_route
      route = Route.find(params[:route_id])
      if(route.status == 'PENDING')
        route.update_attribute(:status, 'IN_TRANSIT')
        route.update_attribute(:start, DateTime.now)

        route_clients = RouteClient.where(route_id: route.id)

        get_optimized_position(route_clients, route.latitude, route.longitude)

        route_clients.each do |r|
          r.update_attribute(:status, 'IN_TRANSIT')
          #Se actualiza el estado de los pedidos del cliente
          orders = Order.where(route_client_id: r.id)
          orders.each do |o|
            o.update_attribute(:status,'IN_TRANSIT')
          end
        end

        RouteSummary.create(event: DateTime.now, route_id: params[:route_id], event_type: 'START_ROUTE')
        route.save
      end
      aux_route_clients = RouteClient.where(route_id: route.id).order("position ASC")
      clients = []
      aux_route_clients.each do |rc|
        aux_client = Client.find(rc.client_id)
        clients << map_route_client_info(aux_client, rc)
      end

      render json: { data: map_route_info(route, clients) }, status: 200
    end

    def end_route
      route = Route.find(params[:route_id])
      route.update_attribute(:status, 'FINISHED')
      route.update_attribute(:end, DateTime.now)
      route.update_attribute(:duration, (route.end - route.start)*1000)

      #Se gerera un registro en la traza de eventos de la ruta
      RouteSummary.create(event: DateTime.now, route_id: params[:route_id], event_type: 'END_ROUTE')

      if route.save
        render json: { data: route.end }, status: 200
      else
        render json: { error: route.errors }, status: 400
      end
    end

    def calculate_clients_proximity(route_id)
      Geocoder.configure(
        :timeout  => 5,
        :lookup   => :yandex,# TODO: hay que revisar este proveedor si esta bien
        :units    => :km
      )
      route = Route.find(route_id)
      route_clients = RouteClient.where(route_id: route_id)
      route_clients.each do |rc|
        client = Client.find(rc.client_id)
        distance = distance = Geocoder::Calculations.distance_between([client.lat, client.long], [route.latitude, route.longitude])
        if distance < 0.05 #50 metros
          if rc.near == true
            if route.last_update.nil?
              route.update_attribute(:last_update, DateTime.now)
            end
            if rc.client_proximity.nil?
              rc.update_attribute(:client_proximity, 0)
            end
            dif = DateTime.now.to_i - route.last_update.to_i
            rc.update_attribute(:client_proximity, rc.client_proximity + dif)
          else
            rc.update_attribute(:near, true)
          end
        else
          rc.update_attribute(:near, false)
        end
      end
      route.update_attribute(:last_update, DateTime.now)
      #render json: { data: true }, status: 200
    end

    def report_daily_routes
      today = DateTime.now
      pending_routes = Route.where(status: :PENDING, start: today.beginning_of_day..today.end_of_day).count
      in_transit_routes = Route.where(status: :IN_TRANSIT, start: today.beginning_of_day..today.end_of_day).count
      finalized_routes = Route.where(status: :FINISHED, start: today.beginning_of_day..today.end_of_day).count
      response = {
        total: pending_routes + in_transit_routes + finalized_routes,
        pending: pending_routes,
        in_transit: in_transit_routes,
        finalized: finalized_routes}

      render json: { data: response }, status: 200
    end

    def report_daily_top_10_dispatchers
      values = Dispatcher.joins("INNER JOIN routes on routes.dispatcher_id = dispatchers.id")
        .select('LEFT(dispatchers.name,20) as dispatcher_name, count(*) as routes_count')
        .where("routes.status = 'FINISHED' AND EXTRACT(month FROM routes.start) = EXTRACT(month FROM NOW())")
        .group('dispatchers.name')
        .order('routes_count DESC').limit(10)
      render json: {data: values}, status: 200
    end

    def report_daily_top_10_clients
      values = Client.joins("INNER JOIN route_clients on route_clients.client_id = clients.id")
        .select('LEFT(clients.business,20) as client_business, count(*) as order_count')
        .where("route_clients.status IN ('DELIVERED','DELIVERED_WITHOUT_VALIDATION') AND EXTRACT(month FROM route_clients.date) = EXTRACT(month FROM NOW())")
        .group('clients.business')
        .order('order_count DESC').limit(10)
      render json: {data: values}, status: 200
    end

    def report_daily_rutes_delay
      today = DateTime.now
      values = Route.joins("INNER JOIN route_clients on route_clients.route_id = routes.id")
        .select('routes.id as route_id, sum(route_clients.client_proximity)/60000::float as route_delay')
        .where(start: today.beginning_of_day..today.end_of_day)
        .group('routes.id')
      render json: {data: values}, status: 200
    end

    def report_routes_finished
      if !params[:search_from].nil? && !params[:search_to].nil?
        values = Route.joins("INNER JOIN dispatchers on dispatchers.id = routes.dispatcher_id")
          .select('routes.id as code, routes.start as start, routes.end as end, routes.duration as duration, dispatchers.name as name')
          .where("routes.status = 'FINISHED' AND routes.end between to_date('" + params[:search_from] + "','yyyy-MM-dd') and to_date('" + params[:search_to] + "','yyyy-MM-dd')")
      end
      render json: {data: values}, status: 200
    end

    private

    def seg2dhms(secs)
      time = secs.round
      sec = time % 60
      time /= 60
      mins = time % 60
      time /= 60
      hrs = time % 24
      time /= 24
      days = time
      [days, hrs, mins, sec]
    end

    def route_params
      params.require(:route).permit!
    end

    def set_route
      @route = Route.find(params[:id])
    end

    def dispatcher_name
      self.dispatcher_name
    end

    def map_route_info(route_info, clients)
      response = {  id: route_info.id,
        cr: route_info.cr,
        start: route_info.start,
        status: route_info.status,
        lat: route_info.latitude,
        long: route_info.longitude,
        dispatcher_id: route_info.dispatcher_id,
        clients: clients}
        return response
      end

      def map_route_client_info(aux_client, r)
        client = {  id: aux_client.id,
          business: aux_client.business,
          branch_id: aux_client.branch_cr,
          branch_name: aux_client.branch_name,
          address: aux_client.address,
          phone: aux_client.phone,
          lat: aux_client.lat,
          long: aux_client.long,
          qr: aux_client.qr,
          route_client_id: r.id,
          route_client_status: r.status,
          route_client_date: r.date,
          route_client_position: r.position}
          return client
        end

        def get_optimized_position(route_clients, lat, long)
          waypoints = "optimize:true"
          route_clients.each do |r|
            client = Client.find(r.client_id)
            waypoints += "|" + client.lat.to_s + "," + client.long.to_s
          end

          url = URI.parse(Rails.configuration.google_directions_url +
          "origin=" + lat.to_s + "," + long.to_s +
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
              puts r.id.to_s + "-" + position.to_s
            end
          end
        end

      end
