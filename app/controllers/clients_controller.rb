class ClientsController < ApplicationController
  #before_filter :require_admin, only: [:create,:update,:destroy]
  before_filter :set_client, only: [:show, :update, :destroy]

  def index
    clients = Client.by_business
    render json: {data: clients}
  end

  def show
    render json: {data: @client}
  end

  def create
    client = Client.new(client_params)
    if client.save
      render json: true, status: 201
    else
      render json: client.errors, status: 422
    end
  end

  def update
    @client.update_attributes(client_params)
    if @client.save
      render json: true, status: 201
    else
      render json: @client.errors, status: 422
    end
  end

  def destroy
    if @client.destroy
      render json: true, status: 201
    else
      render json: @client.errors, status: 422
    end
  end

  private

  def client_params
    params.require(:client).permit!
  end

  def set_client
    @client = Client.find(params[:id])
  end
end
