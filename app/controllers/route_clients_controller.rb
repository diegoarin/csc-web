class RouteClientsController < ApplicationController
  before_filter :set_route_client, only: [:update, :destroy]
  attr_accessor :status

  def index
    route_clients = RouteClient.by_date
    render json: {data: route_clients}
  end

  def index_by_route
    route_clients = RouteClient.where(route_id: params[:route_id])
    route_clients.each do |route|
      client = Client.find(route.client_id)
      route.client_name = client.business
    end
    render json: {data: route_clients}.to_json(methods: :client_name)
  end

  def index_with_clients
    route = Route.find(params[:route_id])
    route_clients = RouteClient.where(route_id: params[:route_id]).order("date ASC")
    @clients = []
    route_clients.each do |route|
      client = Client.find(route.client_id)
      @clients << map_route_client_info(client, route)
    end
    response = map_route_info(route, @clients)
    #Obtengo información del transportista
    dispatcher = Dispatcher.find(route.dispatcher_id)
    response['dispatcher_name'] = dispatcher.name

    render json: {data: response}
  end

  def index_by_device_id_with_clients
    dispatcher = Dispatcher.find_by_device(params[:device_id])
    if dispatcher == nil
      render json: {data: "DEVICE_NOT_REGISTERED"}
    else
      route = Route.where(dispatcher_id: dispatcher.cr).where.not(status: 'FINISHED').order("id ASC")
      routes = []
      route.each do |r|
        route_clients = RouteClient.where(route_id: r.id).order("position ASC")
        clients = []
        route_clients.each do |rc|
          aux_client = Client.find(rc.client_id)
          clients << map_route_client_info(aux_client, rc)
        end
        routes << map_route_info(r, clients)
      end
      render json: {data: routes}
    end
  end

  def update_route_client_status
    current_datetime = DateTime.now
    route_client = RouteClient.where(route_id: params[:route_id],client_id: params[:client_id])
    route_client_to_update = route_client.first
    route_client_to_update.update_attribute(:status,params[:client_status])
    route_client_to_update.update_attribute(:date,current_datetime)
    if route_client_to_update.save
      aux_route_client = RouteClient.where(route_id: params[:route_id], status: 'IN_TRANSIT')
      null_route_client = RouteClient.where(route_id: params[:route_id]).where.not(status: 'IN_TRANSIT')
      #TODO: MEJORAR
      null_route_client.each do |n|
        n.update_attribute(:position, nil)
      end
      get_optimized_position(aux_route_client)

      route_clients_positions = return_route_clients_positions(params[:route_id])

      #Se actualiza el estado y fecha finalizado de los pedidos del cliente
      orders = Order.where(route_client_id: route_client_to_update.id)
      orders.each do |o|
        o.update_attribute(:status,params[:client_status])
        if params[:client_status] == 'DELIVERED' || 
          params[:client_status] == 'DELIVERED_WITHOUT_VALIDATION' || 
          params[:client_status] == 'NOT_DELIVERED'
          o.update_attribute(:finalized,current_datetime)
        end
      end

      # Se gerera un registro en la traza de eventos de la ruta
      RouteSummary.create(event: current_datetime, route_id: params[:route_id], client_id: params[:client_id], client_status: params[:client_status], event_type: 'UPDATE_CLIENT_STATUS')

      render json: { data: route_clients_positions }, status: 200
    else
      render json: route_client_to_update.errors, status: 400
    end
  end

  def show
    render json: {data: @route_client}
  end

  def create
    route_client = RouteClient.new(route_client_params)
    if route_client.save
      render json: true, status: 201
    else
      render json: route_client.errors, status: 422
    end
  end

  def update
    @route_client.update_attributes(route_client_params)
    if @route_client.save
      render json: true, status: 201
    else
      render json: @route_client.errors, status: 422
    end
  end

  def destroy
    if @route_client.destroy
      render json: true, status: 201
    else
      render json: @route_client.errors, status: 422
    end
  end

  def report_daily_top_10_clients_delay
    values = Client.joins("INNER JOIN route_clients on route_clients.client_id = clients.id")
      .select('LEFT(clients.business,20) as client_business, round(avg(route_clients.client_proximity)/60000::float) as avg_proximity_elapsed')
      .where("route_clients.status IN ('DELIVERED','DELIVERED_WITHOUT_VALIDATION','NOT_DELIVERED')")
      .group('clients.business')
      .order('avg_proximity_elapsed DESC').limit(10)
    render json: {data: values}, status: 200
  end

  def report_deliver_avg
    where_sql = "route_clients.status IN ('DELIVERED','DELIVERED_WITHOUT_VALIDATION')"

    if !params[:search_from].nil? && !params[:search_to].nil?
      where_sql = where_sql + " and orders.finalized between to_date('" + params[:search_from] + "','yyyy-MM-dd') and to_date('" + params[:search_to] + "','yyyy-MM-dd')"
    end

    values = Client.joins("INNER JOIN route_clients on route_clients.client_id = clients.id INNER JOIN routes on routes.id = route_clients.route_id INNER JOIN orders on orders.route_client_id = route_clients.id")
      .select('LEFT(clients.business,20), avg(orders.finalized - routes.start),ROUND(extract(epoch from avg(orders.finalized - routes.start))/3600::float) as interval_in_hours')
      .where(where_sql)
      .group('clients.business')
    render json: {data: values}, status: 200
  end

  def report_client_order_quantity
    where_sql = "route_clients.status IN ('DELIVERED','DELIVERED_WITHOUT_VALIDATION')"
    if !params[:search_from].nil? && !params[:search_to].nil?
      where_sql = where_sql + " and orders.finalized between to_date('" + params[:search_from] + "','yyyy-MM-dd') and to_date('" + params[:search_to] + "','yyyy-MM-dd')"
    end

    values = Client.joins("INNER JOIN route_clients on route_clients.client_id = clients.id INNER JOIN orders on orders.route_client_id = route_clients.id")
      .select('LEFT(clients.business,20), count(orders.id)')
      .where(where_sql)
      .group('clients.business')
    render json: {data: values}, status: 200
  end

  private

  def return_route_clients_positions(par_route_id)
    route_clients = RouteClient.where(route_id: par_route_id)
    positions = []
    route_clients.each do |rc|
      client = {}
      client = {:id => rc.id, :pos => rc.position}
      positions << client
    end
    return positions
  end

  def get_optimized_position(route_clients)
    waypoints = "optimize:true"
    route_clients.each do |r|
      client = Client.find(r.client_id)
      waypoints += "|" + client.lat.to_s + "," + client.long.to_s
    end

    url = URI.parse(Rails.configuration.google_directions_url +
    "origin=" + Rails.configuration.carrau_location +
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

    route_clients.each_with_index do |r, index|
      position = response["routes"].first["waypoint_order"][index]
      r.update_attribute(:position, position)
    end
  end

  def map_route_info(route_info, clients)
    response = {  id: route_info.id,
      cr: route_info.cr,
      start: route_info.start,
      end: route_info.end,
      duration: route_info.duration,
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
        route_client_position: r.position,
        route_client_proximity: r.client_proximity}
        return client
      end

      def route_client_params
        params.require(:route_client).permit!
      end

      def set_route_client
        @route_client = RouteClient.find(params[:id])
      end

      def client_name
        self.client_name
      end

    end
