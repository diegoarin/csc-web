class RouteSummariesController < ApplicationController
  before_filter :set_route_summary, only: [:show, :update, :destroy]

  def index
   route_summaries = RouteSummary.by_event
   render json: {data: route_summaries}
  end

  def route_summary
    route_summaries = RouteSummary.where(route_id: params[:route_id]).order(event: :asc)
    route_summaries.each do |rs|
      if !rs.client_id.nil?
        client = Client.find(rs.client_id)
        rs.business_name = client.business
      end
    end
    render json: {data: route_summaries}.to_json(methods: :business_name)
  end

  def show
    render json: {data: @route_summary}
  end

  def create
    route_summary = RouteSummary.new(route_summary_params)
    if route_summary.save
      render json: true, status: 201
    else
      render json: route_summaries.errors, status: 422
    end
  end

  def update
    @route_summary.update_attributes(route_summary_params)
    if @route_summary.save
      render json: true, status: 201
    else
      render json: @route_summary.errors, status: 422
    end
  end

  def destroy
    if @route_summary.destroy
      render json: true, status: 201
    else
      render json: @route_summary.errors, status: 422
    end
  end

  private

  def route_summary_params
    params.require(:route_summary).permit!
  end

  def set_route_summary
    @route_summary = RouteSummary.find(params[:id])
  end

  def business_name
    self.business_name
  end

end
