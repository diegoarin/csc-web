class OrdersController < ApplicationController
  before_filter :set_order, only: [:show, :update, :destroy]

  def index
    orders = Order.by_created
    render json: orders.to_json
  end

  def index_pending
    orders = Order.where(status: :PENDING).order(created: :desc)
    orders.each do |order|
      client = Client.find(order.client_id)
      order.business_name = client.business
    end
    render json: {data: orders}.to_json(methods: :business_name)
  end

  def index_pending_by_client
    route_clients = RouteClient.where(client_id: params[:client_id])
    route_clients = RouteClient.where(status: :PENDING)
    route_clients.each do |route_client|
      orders = Order.where(route_client_id: route_client.id)
      orders = Order.where(status: :PENDING)

    end
  end

  def get_orders_by_qr_dispatcher
    client = Client.find_by_qr(params[:qr])
    route_clients = RouteClient.find(params[:route_client_id])
    if(route_clients.client_id == client.id)
      orders = Order.where(client_id: client.id, status: :IN_TRANSIT).order(cr: :asc)
      render json: {data: orders}, status: 200
    else
      render json: "El código QR es incorrecto para el cliente especificado", status: 409
    end
  end

  def index_to_validate_by_client_qr
    client = Client.find_by_qr(params[:qr])
    orders = Order.where(client_id: client.id, status: :IN_TRANSIT).order(cr: :asc)
    validate_orders = {
      client_name: client.business,
      orders: orders
    }

    render json: {data: validate_orders}, status: 200
  end

  def validates
    current_datetime = DateTime.now
    params[:orders].each do |order|
      order = Order.find_by_cr(order)
      order.update_attribute(:status, :DELIVERED)
      order.update_attribute(:finalized, current_datetime)
    end

    render json: {data: true}, status: 200
  end

  def validate_orders
    current_datetime = DateTime.now
    route_client = RouteClient.find(params[:route_client_id])
    route_client.update_attribute(:status, :DELIVERED)
    params[:orders].each do |order|
      order = Order.find_by_cr(order)
      order.update_attribute(:status, :DELIVERED)
      order.update_attribute(:finalized, current_datetime)
    end

    # Se gerera un registro en la traza de eventos de la ruta
    RouteSummary.create(event: current_datetime, route_id: route_client.route_id, client_id: route_client.client_id, client_status: :DELIVERED, event_type: 'UPDATE_CLIENT_STATUS')

    render json: {data: true}, status: 200
  end

  def map_route_clients_info(route_clients)
    response = {route_clients: route_clients}
  end

  def map_route_client_info(route_client_info, orders)
    route_clients = {  id: route_client_info.id,
      route_id: route_client_info.route_id,
      client_id: route_client_info.client_id,
      orders: orders}

    return route_clients
  end

  def map_order_info(aux_order)
    order = {  id: aux_order.id,
      created: aux_order.created,
      status: aux_order.status}

    return client
  end

  def index_filtered_order
    condition_where = ""

    if !params[:cr].nil? && !params[:cr].blank?
      condition_where = " cr=" + params[:cr]
    end
    if !params[:status].nil? && !params[:status].blank? && !params[:status].eql?('ALL')
      if condition_where.blank?
        condition_where = " status='" + params[:status] + "'"
      else
        condition_where = condition_where + " and status='" + params[:status] + "'"
      end
    end

    orders = Order.where(condition_where).order(created: :desc)

    if !params[:created_from].nil?
      created_from = params[:created_from].to_time.strftime('%a %b %d %H:%M:%S %Z %Y')
    end
    if !params[:created_to].nil?
      created_to = params[:created_to].to_time.strftime('%a %b %d %H:%M:%S %Z %Y')
    end

    if !params[:created_from].nil? && !params[:created_to].nil?
      orders = orders.where(created: created_from..created_to)
    elsif params[:created_from].nil? && !params[:created_to].nil?
      orders = orders.where("created < ?", created_to)
    elsif !params[:created_from].nil? && params[:created_to].nil?
      orders = orders.where("created > ?", created_from)
    end

    orders.each do |order|
      client = Client.find(order.client_id)
      order.business_name = client.business
    end

    render json: {data: orders}.to_json(methods: :business_name)
  end

  def show
    render json: @order.to_json
  end

  def create
    order = Order.new(order_params)
    if order.save
      render json: 'true', status: 201
    else
      render json: order.errors, status: 422
    end
  end

  def update
    @order.update_attributes(order_params)
    if @order.save
      render json: 'true', status: 201
    else
      render json: @order.errors, status: 422
    end
  end

  def destroy
    if @order.destroy
      render json: 'true', status: 201
    else
      render json: @order.errors, status: 422
    end
  end

  def report_daily_orders
    today = DateTime.now

    pending_orders = Order.joins("INNER JOIN route_clients on route_clients.client_id = orders.client_id")
      .where(route_clients: {status: :PENDING, date: today.beginning_of_day..today.end_of_day}).count
    in_transit_orders = Order.joins("INNER JOIN route_clients on route_clients.client_id = orders.client_id")
      .where(route_clients: {status: :IN_TRANSIT, date: today.beginning_of_day..today.end_of_day}).count
    delivered_orders = Order.joins("INNER JOIN route_clients on route_clients.client_id = orders.client_id")
      .where(route_clients: {status: :DELIVERED, date: today.beginning_of_day..today.end_of_day}).count
    delivered_without_validation_orders = Order.joins("INNER JOIN route_clients on route_clients.client_id = orders.client_id")
      .where(route_clients: {status: :DELIVERED_WITHOUT_VALIDATION, date: today.beginning_of_day..today.end_of_day}).count
    not_delivered_orders = Order.joins("INNER JOIN route_clients on route_clients.client_id = orders.client_id")
      .where(route_clients: {status: :NOT_DELIVERED, date: today.beginning_of_day..today.end_of_day}).count

    response = {
      total: pending_orders + in_transit_orders + delivered_orders + delivered_without_validation_orders + not_delivered_orders,
      pending: pending_orders,
      in_transit: in_transit_orders,
      delivered: delivered_orders,
      delivered_without_validation: delivered_without_validation_orders,
      not_delivered: not_delivered_orders}

    render json: { data: response }, status: 200
  end

  def report_daily_top_hour_delivered
    values = Order.select("EXTRACT(hour from finalized) as hour, count(EXTRACT(hour from finalized)) as hour_count")
      .where("status IN ('DELIVERED','DELIVERED_WITHOUT_VALIDATION','NOT_DELIVERED') AND EXTRACT(month FROM finalized) = EXTRACT(month FROM NOW())")
      .group(1).order('hour ASC')
    render json: {data: values}, status: 200
  end

  def report_orders_delivered
    if !params[:search_from].nil? && !params[:search_to].nil?
      values = Order.joins("INNER JOIN clients on clients.id = orders.client_id")
        .select('clients.business as client_name, orders.cr as code, orders.created as created, orders.finalized as delivered')
        .where("status IN ('DELIVERED','DELIVERED_WITHOUT_VALIDATION') AND finalized between to_date('" + params[:search_from] + "','yyyy-MM-dd') and to_date('" + params[:search_to] + "','yyyy-MM-dd')")
    end
    render json: {data: values}, status: 200
  end

  def report_not_delivered_clients_quantity_by_date
    where_sql = "status = 'NOT_DELIVERED'"
    if !params[:search_from].nil? && !params[:search_to].nil?
      where_sql = where_sql + " and orders.finalized between to_date('" + params[:search_from] + "','yyyy-MM-dd') and to_date('" + params[:search_to] + "','yyyy-MM-dd')"
    end
    values = Order.select('finalized::date as fecha, count(*) as cantidad')
      .where(where_sql)
      .group(1)
    render json: {data: values}, status: 200
  end

  private

  def order_params
    params.require(:order).permit!
  end

  def set_order
    @order = Order.find(params[:id])
  end

  def business_name
    self.business_name
  end

end
