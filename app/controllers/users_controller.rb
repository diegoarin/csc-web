class UsersController < ApplicationController
  before_filter :require_user, only: [:show, :update, :destroy]
  before_filter :set_user, only: [:show, :update, :destroy]

  def index
    users = User.by_email
    render json: {data: users}
  end

  def create
    user = User.new(user_params)
    #FIXME: Porque el user_params no pasa los passwords?
    user.password = params[:password]
    user.password_confirmation = params[:password_confirmation]
    if user.save
      render json: true, status: 201
    else
      render json: user.errors, status: 422
    end
  end

  def show
    render json: @user.to_json
  end

  def update
    @user.update_attributes(user_params)
    #FIXME: Porque el user_params no pasa los passwords?
    @user.password = params[:password]
    @user.password_confirmation = params[:password_confirmation]
    if @user.save
      render json: true, status: 201
    else
      render json: @user.errors, status: 422
    end
  end

  def destroy
    if @user.destroy
      render json: true, status: 201
    else
      render json: @user.errors, status: 422
    end
  end

  def user_logged
    user_session = current_user_session
    if !user_session.nil? && !user_session.record.nil?
      render json: {logged: true, data: user_session.record}
    else
      render json: {logged: false, data: nil}
    end
  end

  private

  def user_params
    params.require(:user).permit(:login, :password, :password_confirmation, :email, :name, :active, :admin, :adm_users, :adm_clients, :adm_dispatchers, :reports, :queries)
  end

  def set_user
    @user = User.find(params[:id])
  end

end
