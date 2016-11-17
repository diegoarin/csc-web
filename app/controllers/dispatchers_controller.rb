class DispatchersController < ApplicationController
  #before_filter :require_admin, only: [:create, :update, :destroy]
  before_filter :set_dispatcher, only: [:show, :update, :destroy]

  def index
    dispatchers = Dispatcher.by_name
    render json: {data:dispatchers}
  end

  def show
    render json: @dispatcher.to_json
  end

  def create
    dispatcher = Dispatcher.new(dispatcher_params)
    if dispatcher.save
      render json: true, status: 201
    else
      render json: dispatcher.errors, status: 422
    end
  end

  def update
    @dispatcher.update_attributes(dispatcher_params)
    if @dispatcher.save
      render json: true, status: 201
    else
      render json: @dispatcher.errors, status: 422
    end
  end

  def destroy
    if @dispatcher.destroy
      render json: true, status: 201
    else
      render json: @dispatcher.errors, status: 422
    end
  end

  def report_dispatchers_deliver_avg
    where_sql = "route_clients.status IN ('DELIVERED','DELIVERED_WITHOUT_VALIDATION')"
    if !params[:search_from].nil? && !params[:search_to].nil?
      where_sql = where_sql + " and orders.finalized between to_date('" + params[:search_from] + "','yyyy-MM-dd') and to_date('" + params[:search_to] + "','yyyy-MM-dd')"
      # TODO: Hay que ver bien si el formato de fecha conicide con el que llega
    end

    values = Dispatcher.joins("INNER JOIN routes on routes.dispatcher_id = dispatchers.id INNER JOIN route_clients on route_clients.route_id = routes.id INNER JOIN orders on orders.route_client_id = route_clients.id")
      .select('dispatchers.name, avg(orders.finalized - routes.start),ROUND(extract(epoch from avg(orders.finalized - routes.start))/3600::float) as interval_in_hours')
      .where(where_sql)
      .group(1)
    render json: {data: values}, status: 200
  end

  private

  def dispatcher_params
    params.require(:dispatcher).permit!
  end

  def set_dispatcher
    @dispatcher = Dispatcher.find(params[:id])
  end
end
