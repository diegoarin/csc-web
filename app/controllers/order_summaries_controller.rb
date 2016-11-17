class OrderSummariesController < ApplicationController
  before_filter :set_order_summary, only: [:show, :update, :destroy]

#  def index
#    order_summaries = OrderSummary.by_event
#    order_summaries.each do |order|
#      client = Client.find_by_id(order.client_id)
#      order.client_name = client.business
#    end

#    render json: {data: order_summaries}
#  end

  def index
    order_summaries = OrderSummary.select("order_id,max(event) as event,client_id").
    group("order_id,client_id").
    order("order_id")
    render json: {data: order_summaries}
  end

  def index_by_order
    order_summaries = OrderSummary.where(order_id: params[:order_id]).order(event: :asc)
    order_summaries.each do |orderSummary|
      client = Client.find(orderSummary.client_id)
      orderSummary.business_name = client.business
    end
    render json: {data: order_summaries}.to_json(methods: :business_name)
  end

  def show
    render json: {data: @order_summary}
  end

  def create
    order_summary = OrderSummary.new(order_summary_params)
    if order_summary.save
      render json: true, status: 201
    else
      render json: order_summary.errors, status: 422
    end
  end

  def update
    @order_summary.update_attributes(order_summary_params)
    if @order_summary.save
      render json: true, status: 201
    else
      render json: @order_summary.errors, status: 422
    end
  end

  def destroy
    if @order_summary.destroy
      render json: true, status: 201
    else
      render json: @order_summary.errors, status: 422
    end
  end

  private

  def order_summary_params
    params.require(:order_summary).permit!
  end

  def set_order_summary
    @order_summary = OrderSummary.find(params[:id])
  end

  def business_name
    self.business_name
  end

end
